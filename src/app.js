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

    // const USREOU = '27272727';
    // const fetchedData = await parser.fetchUakeyInfo(USREOU);
    // console.log(fetchedData);    
    
    // const res = await uspacy.search('ТОВ "ЛЕАНДРА"');
    // console.log(res);

    // const testComp = await uspacy.getEntity('companies', '9987');
    // console.log(testComp); //uf_crm_1632905074 is a company USREOU

    // const resEditEntity = await uspacy.editEntityItem('companies', '9987', 'uf_crm_1632905074', 1111);
    // console.log(resEditEntity);



    // I try to find company ID and update all KEPs linked with the company
    let USREOU = "";
    let companyId = "";

    // const testCompanyName = "АСК \"УКРРІЧФЛОТ\"";
    const testCompanyName = "Тест Тестович";

    companyId = (await uspacy.search(testCompanyName)).companies[0].id;
    if (!companyId) throw new Error('Company ID was not found!');
    USREOU = extractUSREOU((await uspacy.getEntity('companies', companyId)).uf_crm_1632905074);
    if (!USREOU) throw new Error('Company USREOU code was not found!');
    console.log(`USREOU: ${USREOU}`);

    const paresdKEPs = await parser.fetchUakeyInfo(USREOU);
    const resAfterCreateKEPEntity = await uspacy.createKEPEntityForCompany(companyId, 'testByProg', '7', convertToTimestamp("18.03.2025"), convertToTimestamp("17.03.2026"), true);

    const KEPsInUspacy = await uspacy.getKEPsByCompany(companyId);

    console.log(KEPsInUspacy);
    console.log(resAfterCreateKEPEntity); // I cannot add relationship with company

    console.log(await uspacy.getEntity('companies', '9987')); 


  } catch (err) {
    console.error('❌Error in application:', err);
  }
})();
