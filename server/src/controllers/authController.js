import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { signAccessToken, signRefreshToken, verifyToken } from '../utils/tokens.js';

function userResponse(doc) {
  const u = doc.toJSON ? doc.toJSON() : doc;
  return {
    id: u._id?.toString?.() ?? u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.status,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
}

export const loginValidators = [
  body('email').trim().isEmail().normalizeEmail(),
  body('password').isString().notEmpty(),
];

export async function login(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  if (user.status !== 'active') {
    return res.status(403).json({ message: 'Account is inactive' });
  }
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const payload = { sub: user._id.toString(), role: user.role };
  const accessToken = signAccessToken(
    payload,
    process.env.JWT_ACCESS_SECRET,
    process.env.JWT_ACCESS_EXPIRES || '15m'
  );
  const refreshToken = signRefreshToken(
    { sub: user._id.toString() },
    process.env.JWT_REFRESH_SECRET,
    process.env.JWT_REFRESH_EXPIRES || '7d'
  );

  return res.json({
    accessToken,
    refreshToken,
    user: userResponse(user),
  });
}

export const registerValidators = [
  body('name').trim().isLength({ min: 1, max: 120 }),
  body('email').trim().isEmail().normalizeEmail(),
  body('password').isString().isLength({ min: 8, max: 128 }),
];

export async function register(req, res) {
  if (process.env.ALLOW_REGISTER !== 'true') {
    return res.status(403).json({ message: 'Registration is disabled' });
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }
  const { name, email, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists) {
    return res.status(409).json({ message: 'Email already registered' });
  }
  const hash = await bcrypt.hash(password, 12);
  const user = await User.create({
    name,
    email,
    password: hash,
    role: 'user',
    status: 'active',
  });
  return res.status(201).json({ user: userResponse(user) });
}

export const refreshValidators = [body('refreshToken').isString().notEmpty()];

export async function refresh(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }
  try {
    const decoded = verifyToken(req.body.refreshToken, process.env.JWT_REFRESH_SECRET);
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
    const user = await User.findById(decoded.sub);
    if (!user || user.status !== 'active') {
      return res.status(401).json({ message: 'User not found or inactive' });
    }
    const payload = { sub: user._id.toString(), role: user.role };
    const accessToken = signAccessToken(
      payload,
      process.env.JWT_ACCESS_SECRET,
      process.env.JWT_ACCESS_EXPIRES || '15m'
    );
    return res.json({ accessToken });
  } catch {
    return res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
}

export async function me(req, res) {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  return res.json({ user: userResponse(user) });
}
