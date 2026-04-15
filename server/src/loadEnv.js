import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverDir = path.join(__dirname, '..');
const repoRoot = path.join(serverDir, '..');

/** Prefer server/.env, then cwd, then repo root (monorepo). */
const envCandidates = [
  path.join(serverDir, '.env'),
  path.join(process.cwd(), '.env'),
  path.join(repoRoot, '.env'),
];

let loadedFrom = null;
for (const envPath of envCandidates) {
  if (!fs.existsSync(envPath)) continue;
  let raw = fs.readFileSync(envPath, 'utf8');
  // UTF-8 BOM makes the first key "\uFEFFMONGODB_URI" so process.env.MONGODB_URI is undefined
  if (raw.charCodeAt(0) === 0xfeff) {
    raw = raw.slice(1);
  }
  const parsed = dotenv.parse(raw);
  for (const [k, v] of Object.entries(parsed)) {
    if (v !== undefined) process.env[k] = v;
  }
  loadedFrom = envPath;
  break;
}

if (!loadedFrom) {
  console.error('No .env file found. Tried:');
  envCandidates.forEach((p) => console.error(' ', p));
}

export const envLoadedFrom = loadedFrom;
export const expectedEnvPath = path.join(serverDir, '.env');
