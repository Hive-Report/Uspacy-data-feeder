import 'dotenv/config';
import UspaceManager from './UspaceManager.js';
import UakeyManager from './UakeyManager.js';
import { startTokenLifecycle } from './tokenManager.js';

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

    

  } catch (err) {
    console.error('❌Error in application:', err);
  }
})();
