import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from './models/User.js';
import { envLoadedFrom, expectedEnvPath } from './loadEnv.js';

const uri = process.env.MONGODB_URI?.trim();
if (!uri) {
  console.error('MONGODB_URI is missing or empty after loading .env.');
  if (envLoadedFrom) {
    console.error('Loaded .env from:', envLoadedFrom);
  } else {
    console.error('Create a file at:', expectedEnvPath);
  }
  console.error(
    'Add one line (use double quotes if your password or URI contains #):\n  MONGODB_URI="mongodb+srv://user:pass@host/db?options"'
  );
  process.exit(1);
}

await mongoose.connect(uri);

const seeds = [
  { name: 'Admin User', email: 'admin@example.com', password: 'Admin123!', role: 'admin' },
  { name: 'Manager User', email: 'manager@example.com', password: 'Manager123!', role: 'manager' },
  { name: 'Regular User', email: 'user@example.com', password: 'User12345!', role: 'user' },
];

for (const s of seeds) {
  const hash = await bcrypt.hash(s.password, 12);
  const res = await User.updateOne(
    { email: s.email },
    {
      $set: {
        name: s.name,
        email: s.email,
        password: hash,
        role: s.role,
        status: 'active',
      },
    },
    { upsert: true }
  );
  if (res.upsertedCount) console.log('Created:', s.email, `(${s.role})`);
  else console.log('Updated (password reset):', s.email, `(${s.role})`);
}

console.log('\nDefault passwords:');
seeds.forEach((s) => console.log(`  ${s.email} / ${s.password}`));

await mongoose.disconnect();
process.exit(0);
