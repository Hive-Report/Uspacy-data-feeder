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
    const USREOU = '27272727';
    const fetchedData = await parser.fetchUakeyInfo(USREOU);
    console.log(fetchedData);

    const uspacy = new UspaceManager();
    const res = uspacy.searchCompanyId({q:'ТОВ "ЛЕАНДРА"'});

    console.log(await res);

  } catch (err) {
    console.error('❌Error in application:', err);
  }
})();
