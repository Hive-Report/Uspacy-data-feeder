import 'dotenv/config';
import { startTokenLifecycle } from './tokenManager.js';
import Danylo from './Danylo.js';
import pLimit from 'p-limit';
import fs from 'node:fs';  // Імпортуємо модуль для запису в файл

// Відкриваємо потоки для запису в файли
const logStream = fs.createWriteStream('output.log', { flags: 'a' });
const errorStream = fs.createWriteStream('error.log', { flags: 'a' });

// Перенаправляємо console.log та console.error на файли
console.log = (...args) => {
  logStream.write(args.join(' ') + '\n');
  process.stdout.write(args.join(' ') + '\n'); // Також виводимо в термінал
};

console.error = (...args) => {
  errorStream.write(args.join(' ') + '\n');
  process.stderr.write(args.join(' ') + '\n'); // Також виводимо в термінал
};

(async () => {
  try {
    console.log('🚀 Starting application...');

    await startTokenLifecycle();
    console.log('ℹ️ Token lifecycle started.');

    const worker = new Danylo();

    const companyIds = Array.from({ length: 13894 }, (_, i) => i + 1); 

    for (let i = 1; i < 13894; i++) {
      await worker.updateKEPs(i);
    }

    console.log('🎉 Finished successfully!');
  } catch (err) {
    console.error('❌ Error in application:', err);
  }
})();
