import serverless from 'serverless-http';
import { connectDb } from '../server/src/config/db.js';
import { createApp } from '../server/src/app.js';

export const config = {
  maxDuration: 60,
};

let cachedHandler;

export default async function handler(req, res) {
  if (!process.env.MONGODB_URI || !process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
    res.status(500).json({ message: 'Server misconfigured: set MONGODB_URI and JWT secrets in Vercel.' });
    return;
  }
  try {
    if (!cachedHandler) {
      await connectDb(process.env.MONGODB_URI);
      cachedHandler = serverless(createApp());
    }
    return cachedHandler(req, res);
  } catch (e) {
    console.error(e);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
