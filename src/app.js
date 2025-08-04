import 'dotenv/config';
import { startTokenLifecycle } from './tokenManager.js';
import Danylo from './Danylo.js';
import UakeyManager from './UakeyManager.js';
import UspaceManager from './UspaceManager.js';
import fs from 'node:fs';

const logStream = fs.createWriteStream('output.log', { flags: 'a', encoding: 'utf8' });
const errorStream = fs.createWriteStream('error.log', { flags: 'a', encoding: 'utf8' });

console.log = (...args) => {
  logStream.write(args.join(' ') + '\n');
  process.stdout.write(args.join(' ') + '\n');
};

console.error = (...args) => {
  errorStream.write(args.join(' ') + '\n');
  process.stderr.write(args.join(' ') + '\n');
};

(async () => {
  try {
    console.log('🚀 Starting application...');

    await startTokenLifecycle();
    console.log('ℹ️ Token lifecycle started.');

    const amount = 14156; // Загальна кількість компаній
    const processed = 0;  // Вже оброблені компанії
    const remaining = amount - processed;
    
    console.log(`ℹ️ ${processed} companies already processed. Processing remaining ${remaining} companies in parallel.`);
    
    const threadCount = 6;
    
    const companiesPerThread = Math.ceil(remaining / threadCount);
    
    const workers = [];
    
    for (let i = 0; i < threadCount; i++) {
      const startId = processed + 1 + i * companiesPerThread;
      const endId = Math.min(processed + (i + 1) * companiesPerThread, amount);
      if (startId > endId) continue;

      const worker = new Danylo();
      worker.parser = new UakeyManager();
      worker.uspace = new UspaceManager();
      workers.push(worker.updateAllKEPs(startId, endId));
    }
    
    // Чекаємо завершення всіх потоків
    await Promise.all(workers);

    console.log('🎉 Finished successfully!');
  } catch (err) {
    console.error('❌ Error in application:', err);
  }
})();
