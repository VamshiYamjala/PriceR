// server/src/config/env.js
// Centralized environment variable loader.
// Resolves server/.env with an absolute path regardless of current working directory.

import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Always resolves to <project-root>/server/.env
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

export function reloadEnv() {
  dotenv.config({ path: envPath, override: true });
  return process.env;
}

export default process.env;
