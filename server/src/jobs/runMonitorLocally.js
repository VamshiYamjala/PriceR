// server/src/jobs/runMonitorLocally.js
// Owner: Member 1 & Member 4
// Standalone runner script to trigger a price monitoring cycle directly from PowerShell
// during local development or testing without needing GitHub Actions.

import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import { runMonitoringCycle } from '../services/priceMonitor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function run() {
  console.log('🚀 [local-monitor] Initializing local price monitoring cycle...');
  try {
    await connectDB();
    const result = await runMonitoringCycle();
    console.log('📊 [local-monitor] Monitoring Cycle Summary:');
    console.log(`   - Offers Checked:    ${result.offersChecked}`);
    console.log(`   - Alerts Triggered:  ${result.triggeredAlerts}`);
    console.log(`   - Errors Encountered:${result.errors}`);
  } catch (err) {
    console.error('❌ [local-monitor] Monitoring cycle failed:', err.message);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('🔒 [local-monitor] Database connection closed.');
    }
  }
}

run();
