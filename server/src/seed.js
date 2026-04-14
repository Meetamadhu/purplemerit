import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from './models/User.js';

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('Set MONGODB_URI in .env');
  process.exit(1);
}

await mongoose.connect(uri);

const seeds = [
  { name: 'Admin User', email: 'admin@example.com', password: 'Admin123!', role: 'admin' },
  { name: 'Manager User', email: 'manager@example.com', password: 'Manager123!', role: 'manager' },
  { name: 'Regular User', email: 'user@example.com', password: 'User12345!', role: 'user' },
];

for (const s of seeds) {
  const existing = await User.findOne({ email: s.email });
  if (existing) {
    console.log('Skip (exists):', s.email);
    continue;
  }
  const hash = await bcrypt.hash(s.password, 12);
  await User.create({
    name: s.name,
    email: s.email,
    password: hash,
    role: s.role,
    status: 'active',
  });
  console.log('Created:', s.email, `(${s.role})`);
}

console.log('\nDefault passwords:');
seeds.forEach((s) => console.log(`  ${s.email} / ${s.password}`));

await mongoose.disconnect();
process.exit(0);
