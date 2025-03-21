import 'dotenv/config';
import UspaceManager from './UspaceManager.js';
import UakeyManager from './UakeyManager.js';
import { startTokenLifecycle } from './tokenManager.js';

function extractUSREOU(html) {
  const match = html.match(/\b\d{8,}\b/);
  
  if (match) {
      return match[0];
  } else {
      console.error("Error: Unable to find correct EDRPOU.");
      return null;
  }
}

function convertToTimestamp(dateStr) {
  const [day, month, year] = dateStr.split('.').map(Number);
  
  const date = new Date(year, month - 1, day);

  return Math.floor(date.getTime() / 1000);
}

(async () => {
  try {
    console.log('Starting application...');
    
    await startTokenLifecycle();
    console.log('ℹ️ Token lifecycle started.');

    // Other processes
    const parser = new UakeyManager();
    const uspacy = new UspaceManager();

    // I try to find company ID and update all KEPs linked with the company
    let USREOU = "";
    let companyId = "";

    // const testCompanyName = "АСК \"УКРРІЧФЛОТ\"";
    const testCompanyName = "Тест Тестович";

    companyId = (await uspacy.search(testCompanyName)).companies[0].id;
    if (!companyId) throw new Error('Company ID was not found!');

    let KEPsInUspacy = await uspacy.getKEPsByCompany(companyId);
    console.log(`Before deleting: ${KEPsInUspacy}`);

    for (let KEP of KEPsInUspacy) {
      await uspacy.deleteKEP(KEP.id);
    }

    KEPsInUspacy = await uspacy.getKEPsByCompany(companyId);
    console.log(`After deleting: ${KEPsInUspacy}`);

    USREOU = extractUSREOU((await uspacy.getEntity('companies', companyId)).uf_crm_1632905074);
    if (!USREOU) throw new Error('Company USREOU code was not found!');
    console.log(`USREOU: ${USREOU}`);

    const paresdCerts = await parser.fetchUakeyInfo(USREOU);
    if (!paresdCerts) throw new Error("Uakey parsing failed.")
    if (paresdCerts.uakey[USREOU].certs.length === 0) throw new Error("KEPS was not found.");
    const certsArray = paresdCerts.uakey[USREOU].certs || [];
    const signingCerts = certsArray.filter(cert => cert.certType === "Підписання");
    console.log(signingCerts);

    for (let cert of signingCerts) {
      await uspacy.createKEPEntityForCompany(companyId, cert.name, 7, convertToTimestamp(cert.startDate), convertToTimestamp(cert.endDate), cert.cloudkey);
    }


    KEPsInUspacy = await uspacy.getKEPsByCompany(companyId);
    console.log(`Result: ${KEPsInUspacy}`);
  } catch (err) {
    console.error('❌Error in application:', err);
  }
})();
