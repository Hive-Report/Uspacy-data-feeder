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

    const limit = pLimit(6);

    // Масив для зберігання компаній, де виникли помилки
    const failedCompanies = [];

    const updatePromises = companyIds.map((companyId) =>
      limit(async () => {
        try {
          let counter = 0;
          let res = await worker.updateKEPs(companyId);
          while (res == 1 && counter < 10) {
            res = await worker.updateKEPs(companyId);
            counter++;
          }
          if (res != 1){
            console.log(`✅ KEPs updated for company ${companyId}`);
          } else {
            failedCompanies.push(companyId);
          }
        } catch (err) {
          console.error(`❌ Error updating KEPs for company ${companyId}:`, err);

          // Додаємо компанію до списку помилок
          failedCompanies.push(companyId);
        }
      })
    );

    // Очікуємо завершення всіх оновлень
    await Promise.all(updatePromises);

    // Якщо є невдалі спроби, записуємо їх у файл
    if (failedCompanies.length > 0) {
      const failedLog = `Failed companies:\n${failedCompanies.join('\n')}`;
      fs.writeFileSync('failed_companies.txt', failedLog, 'utf-8');
      console.log(`📝 Failed companies logged to 'failed_companies.txt'`);
    }

    console.log('🎉 Finished successfully!');
  } catch (err) {
    console.error('❌ Error in application:', err);
  }
})();
