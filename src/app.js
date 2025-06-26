import 'dotenv/config';
import { startTokenLifecycle } from './tokenManager.js';
import Danylo from './Danylo.js';
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

    const worker = new Danylo();
    const amount = 14156; // Set the desired amount of companies to process
    await worker.updateAllKEPs(amount);

    console.log('🎉 Finished successfully!');
  } catch (err) {
    console.error('❌ Error in application:', err);
  }
})();
