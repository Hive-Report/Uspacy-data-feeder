import UspaceManager from "./UspaceManager.js";
import UakeyManager from './UakeyManager.js';

class Danylo {
    extractUSREOU(html) {
        const match = html.match(/\b\d{8,}\b/);
        if (match) return match[0];

        console.error("Error: Unable to find correct USREOU.", html);
        return null;
    }
      
    convertToTimestamp(dateStr) {
        const [day, month, year] = dateStr.split('.').map(Number);
        return Math.floor(new Date(year, month - 1, day).getTime() / 1000);
    }

    async updateKEPs(companyId) {
        const parser = new UakeyManager();
        const uspacy = new UspaceManager();
    
        try {
            const entity = await uspacy.getEntity('companies', companyId);
            const USREOU = this.extractUSREOU(entity.uf_crm_1632905074);
            if (!USREOU) throw new Error('Company USREOU code was not found!', USREOU);
    
            const oldKEPsInUspacy = await uspacy.getKEPsByCompany(companyId);
            if (!oldKEPsInUspacy) throw new Error("Failed to fetch old KEPs from Uspacy.");
    
            const parsedCerts = await parser.fetchUakeyInfo(USREOU);
            if (!parsedCerts) throw new Error("Uakey parsing failed.");
            if (!parsedCerts.uakey[USREOU]) throw new Error(`No data found for USREOU: ${USREOU}`);
            if (!parsedCerts.uakey[USREOU]?.certs?.length) throw new Error("KEPs were not found.");
    
            const signingCerts = parsedCerts.uakey[USREOU].certs.filter(cert => cert.certType === "Підписання");
    
            // Compare function
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
                console.log("✅ No changes in KEPs. Skipping update. ", companyId);
                return null;
            }
    
            // Deleting old KEPs
            for (let KEP of oldKEPsInUspacy) {
                await uspacy.deleteKEP(KEP.id);
            }
    
            // Adding new KEPs
            for (let cert of signingCerts) {
                await uspacy.createKEPEntityForCompany(
                    companyId,
                    cert.name,
                    7,
                    this.convertToTimestamp(cert.startDate),
                    this.convertToTimestamp(cert.endDate),
                    cert.cloudkey
                );
            }
    
            console.log("✅ KEPs successfully updated. " , companyId);
            return true;
        } catch (err) {
            console.error("❌ Danylo has no ability to update KEPs:", err.message || err);
            return 1;
        }
    }    
}

export default Danylo;
