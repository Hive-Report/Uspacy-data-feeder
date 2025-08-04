import UspaceManager from "./UspaceManager.js";
import UakeyManager from './UakeyManager.js';
import pLimit from 'p-limit';

class Danylo {
    constructor() {
        this.parser = new UakeyManager();
        this.uspace = new UspaceManager();
    }

    extractUSREOU(html) {
        const match = html.match(/\b\d{8,}\b/);
        if (match) return match[0];
        return null;
    }
      
    convertToTimestamp(dateStr) {
        const [day, month, year] = dateStr.split('.').map(Number);
        return Math.floor(new Date(year, month - 1, day).getTime() / 1000);
    }

    async getHashCompaniesTable(start, chunk = 50) {
        const hashCompanyIds = new Map();
        for (let i = start; i < start + chunk; i++) {
            const entity = await this.uspace.getEntity('companies', i);
            const USREOU = this.extractUSREOU(entity.uf_crm_1632905074);
            console.log(`Processing company ID: ${i}, USREOU: ${USREOU}`);
            if (USREOU) {
                hashCompanyIds.set(i, USREOU);
            }
        }
        return hashCompanyIds;
    }

    async updateAllKEPs(startId, endId) {
        const chunk = 50;
        const limit = pLimit(5); // максимум 5 одночасних запитів у чанку
        let processed = 0;
        
        try {
            for (let i = startId; i <= endId; i += chunk) {
                const currentChunkEnd = Math.min(i + chunk - 1, endId);
                console.log(`ℹ️ Processing companies from ${i} to ${currentChunkEnd}. Remaining: ${endId - i + 1} companies.`);
                
                let hashCompanyIds = await this.getHashCompaniesTable(i, Math.min(chunk, endId - i + 1));
                if (!hashCompanyIds || hashCompanyIds.size === 0) {
                    console.error(`❌ No companies found or hashCompanyIds is empty in range ${i}-${currentChunkEnd}.`);
                    processed += Math.min(chunk, endId - i + 1);
                    continue;
                }
                
                const USREOUList = Array.from(hashCompanyIds.values());
                const parsedCerts = await this.parser.fetchMassiveUakeyInfo(USREOUList);
                console.log(`ℹ️ Fetched Uakey data for ${JSON.stringify(parsedCerts, null, 2)} USREOU values.`);

                let updatedCount = 0;

                const tasks = [];
                for (const [companyId, USREOU] of hashCompanyIds) {
                    tasks.push(limit(async () => {
                        const updated = await this.processCompany(companyId, USREOU, parsedCerts.certs);
                        if (updated) updatedCount++; // інкрементуємо, якщо компанія була оновлена
                    }));
                }
                await Promise.all(tasks);

                processed += hashCompanyIds.size;
                console.log(`📊 Chunk complete: Updated ${updatedCount} companies in this chunk.`);
            }
            
            console.log(`🏁 Processing complete: Processed ${processed} companies in total.`);
            return true;
        } catch (err) {
            console.error(`❌ Fatal error in updateAllKEPs for range ${startId}-${endId}:`, err.message || err);
            return null;
        }
    }

    // Додайте окремий метод для обробки компанії
    async processCompany(companyId, USREOU, parsedCerts) {
        try {
            if (!parsedCerts || !Array.isArray(parsedCerts.uakey)) {
                console.error(`❌ No uakey data for company ${companyId} with USREOU ${USREOU}.`);
                return;
            }

            // Переконуємося, що порівнюємо в одному форматі
            const searchUSREOU = String(USREOU).trim();
            let companyData = parsedCerts.uakey.find(item => 
                String(item.code).trim() === searchUSREOU
            );

            // Додаткова перевірка, якщо точний пошук не спрацював
            if (!companyData) {
                console.log(`🔍 No exact match for USREOU ${USREOU}, trying alternative search...`);
                const possibleMatches = parsedCerts.uakey.filter(item => 
                    String(item.code).includes(searchUSREOU) || 
                    searchUSREOU.includes(String(item.code))
                );
                
                if (possibleMatches.length === 1) {
                    console.log(`✅ Found alternative match: ${possibleMatches[0].code}`);
                    companyData = possibleMatches[0];
                } else if (possibleMatches.length > 1) {
                    console.error(`❌ Multiple possible matches for USREOU ${USREOU}: ${possibleMatches.map(m => m.code).join(', ')}`);
                }
            }

            if (!companyData || !companyData.certs || companyData.certs.length === 0) {
                console.error(`❌ No certificate data found for company ${companyId} with USREOU ${USREOU}.`);
                return;
            }

            const signingCerts = companyData.certs.filter(cert => 
                cert && cert.certType && 
                (cert.certType.toLowerCase().includes("підп") || 
                 cert.certType.includes("╨Я╤Ц╨┤╨┐"))
            );

            if (signingCerts.length === 0) {
                console.error(`❌ No signing certificates found for company ${companyId} with USREOU ${USREOU}.`);
                return;
            }

            const isKEPsIdentical = (KEPsInUspacy, signingCerts) => {
                if (!Array.isArray(KEPsInUspacy) || !Array.isArray(signingCerts)) return false;
                if (KEPsInUspacy.length !== signingCerts.length) return false;
                for (let i = 0; i < KEPsInUspacy.length; i++) {
                    if (!(
                        KEPsInUspacy[i].title === signingCerts[i]?.name &&
                        KEPsInUspacy[i].data_formuvannya === this.convertToTimestamp(signingCerts[i]?.startDate) &&
                        KEPsInUspacy[i].data_zakinchennya === this.convertToTimestamp(signingCerts[i]?.endDate) &&
                        KEPsInUspacy[i].na_cloudkey === signingCerts[i]?.cloudkey
                    )) return false;
                }
                return true;
            };
            
            // Check old KEPs and parsed KEPs
            if (isKEPsIdentical(oldKEPsInUspacy, signingCerts)) {
                console.log(`✅ No changes in KEPs for company ${companyId} with USREOU ${USREOU}. Skipping update.`);
                return;
            }
    
            // Deleting old KEPs
            for (let KEP of oldKEPsInUspacy) {
                await this.uspace.deleteKEP(KEP.id);
            }
    
            console.log(`🔍 Saving KEPs for company ${companyId} (${USREOU})`);
            console.log(`   Found ${signingCerts.length} certificates for saving`);

            // Adding new KEPs
            for (let cert of signingCerts) {
                console.log(`   - Saving certificate: ${cert.name}`);
                await this.uspace.createKEPEntityForCompany(
                    companyId,
                    cert.name,
                    7,
                    this.convertToTimestamp(cert.startDate),
                    this.convertToTimestamp(cert.endDate),
                    cert.cloudkey
                );
            }
    
            console.log(`✅ KEPs successfully updated for company ${companyId} with USREOU ${USREOU}`);
            updatedCount++;
        } catch (companyError) {
            console.error(`❌ Error updating KEPs for company ${companyId}:`, companyError.message || companyError);
        }
    }
}

export default Danylo;
