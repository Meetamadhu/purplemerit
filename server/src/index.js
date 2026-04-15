import 'dotenv/config';
import { connectDb } from './config/db.js';
import { createApp } from './app.js';

const port = Number(process.env.PORT) || 5000;
const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('Missing MONGODB_URI');
  process.exit(1);
}
if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
  console.error('Missing JWT_ACCESS_SECRET or JWT_REFRESH_SECRET');
  process.exit(1);
}

try {
  await connectDb(uri);
} catch (err) {
  console.error('Could not connect to MongoDB:', err.message || err);
  const refused =
    err?.cause?.code === 'ECONNREFUSED' || err?.message?.includes('ECONNREFUSED');
  if (refused) {
    console.error(`
Nothing is accepting connections at your MONGODB_URI host/port (often 127.0.0.1:27017).

Fix one of:
  • Docker: from the project root run  docker compose up -d   then retry.
  • Local MongoDB: start the MongoDB Windows service or run mongod.
  • Atlas: set MONGODB_URI in server/.env to your cluster connection string.
`);
  }
  process.exit(1);
}

const app = createApp();
app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
