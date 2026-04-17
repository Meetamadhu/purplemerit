import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { body, param, query, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import User from '../models/User.js';

function isAdminTarget(userDoc) {
  return userDoc && userDoc.role === 'admin';
}

async function canReadUser(actor, target) {
  if (actor.role === 'admin') return true;
  if (actor.id === target._id.toString()) return true;
  if (actor.role === 'manager' && !isAdminTarget(target)) return true;
  return false;
}

async function canUpdateUser(actor, target, bodyKeys) {
  if (bodyKeys.includes('password') && actor.id !== target._id.toString()) {
    return {
      ok: false,
      code: 403,
      message: 'Password can only be changed by the account owner (e.g. from their profile).',
    };
  }
  if (actor.id === target._id.toString()) {
    const allowed = new Set(['name', 'password']);
    const forbidden = bodyKeys.filter((k) => !allowed.has(k));
    if (forbidden.length) return { ok: false, code: 403, message: 'Cannot update those fields on your own profile' };
    return { ok: true };
  }
  if (actor.role === 'admin') return { ok: true };
  if (actor.role === 'manager') {
    if (isAdminTarget(target)) return { ok: false, code: 403, message: 'Cannot modify admin users' };
    const allowed = new Set(['name', 'email', 'status']);
    const forbidden = bodyKeys.filter((k) => !allowed.has(k));
    if (forbidden.length) {
      return { ok: false, code: 403, message: 'Managers can only update name, email, and status' };
    }
    return { ok: true };
  }
  return { ok: false, code: 403, message: 'Insufficient permissions' };
}

export const listValidators = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('search').optional().trim().isLength({ max: 200 }),
  query('role').optional().isIn(['admin', 'manager', 'user', '']),
  query('status').optional().isIn(['active', 'inactive', '']),
];

export async function listUsers(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;
  const search = req.query.search || '';
  const roleFilter = req.query.role;
  const statusFilter = req.query.status;

  const filter = {};
  if (search) {
    filter.$or = [
      { name: new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
      { email: new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
    ];
  }
  if (roleFilter) filter.role = roleFilter;
  if (statusFilter) filter.status = statusFilter;

  const [rawItems, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email'),
    User.countDocuments(filter),
  ]);

  const items = rawItems.map((doc) => doc.toJSON());

  return res.json({
    data: items,
    meta: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  });
}

export const idParam = [param('id').isMongoId()];

export async function getUser(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }
  const target = await User.findById(req.params.id)
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email');
  if (!target) return res.status(404).json({ message: 'User not found' });

  const allowed = await canReadUser(req.user, target);
  if (!allowed) return res.status(403).json({ message: 'Cannot access this user' });

  return res.json({ user: target });
}

const createValidators = [
  body('name').trim().isLength({ min: 1, max: 120 }),
  body('email').trim().isEmail(),
  body('role').isIn(['admin', 'manager', 'user']),
  body('status').optional().isIn(['active', 'inactive']),
  body('password').optional().isString().isLength({ min: 8, max: 128 }),
  body('autoPassword').optional().isBoolean(),
];

export { createValidators as createUserValidators };

export async function createUser(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }
  const { name, role, status = 'active' } = req.body;
  const email = String(req.body.email).trim().toLowerCase();
  let password = req.body.password;
  if (req.body.autoPassword) {
    password = crypto.randomBytes(12).toString('base64url');
  }
  if (!password) {
    return res.status(400).json({ message: 'Password is required unless autoPassword is true' });
  }
  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: 'Email already in use' });

  const hash = await bcrypt.hash(password, 12);
  const user = await User.create({
    name,
    email,
    password: hash,
    role,
    status,
    createdBy: req.user.id,
    updatedBy: req.user.id,
  });
  const plain = req.body.autoPassword ? password : undefined;
  const doc = user.toJSON();
  return res.status(201).json({ user: doc, generatedPassword: plain });
}

const updateValidators = [
  param('id').isMongoId(),
  body('name').optional().trim().isLength({ min: 1, max: 120 }),
  body('email').optional().trim().isEmail(),
  body('role').optional().isIn(['admin', 'manager', 'user']),
  body('status').optional().isIn(['active', 'inactive']),
  body('password').optional().isString().isLength({ min: 8, max: 128 }),
];

export { updateValidators as updateUserValidators };

export async function updateUser(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }
  const target = await User.findById(req.params.id);
  if (!target) return res.status(404).json({ message: 'User not found' });

  const bodyKeys = Object.keys(req.body).filter((k) =>
    ['name', 'email', 'role', 'status', 'password'].includes(k)
  );
  if (bodyKeys.length === 0) {
    return res.status(400).json({ message: 'No updatable fields provided' });
  }

  if (req.user.role === 'user' && req.user.id !== target._id.toString()) {
    return res.status(403).json({ message: 'Cannot update other users' });
  }
  if (req.user.role === 'user' && bodyKeys.includes('role')) {
    return res.status(403).json({ message: 'Cannot change your role' });
  }

  const perm = await canUpdateUser(req.user, target, bodyKeys);
  if (!perm.ok) return res.status(perm.code).json({ message: perm.message });

  if (req.user.role === 'admin' && bodyKeys.includes('role') && target._id.toString() === req.user.id) {
    return res.status(400).json({ message: 'Cannot change your own role' });
  }

  const nextEmail =
    req.body.email !== undefined ? String(req.body.email).trim().toLowerCase() : undefined;
  if (bodyKeys.includes('email') && nextEmail) {
    const taken = await User.findOne({ email: nextEmail, _id: { $ne: target._id } });
    if (taken) return res.status(409).json({ message: 'Email already in use' });
  }

  if (req.body.name !== undefined) target.name = req.body.name;
  if (nextEmail !== undefined) target.email = nextEmail;
  if (req.body.status !== undefined) target.status = req.body.status;
  if (req.body.role !== undefined && req.user.role === 'admin') target.role = req.body.role;
  if (req.body.password) {
    target.password = await bcrypt.hash(req.body.password, 12);
  }
  target.updatedBy = new mongoose.Types.ObjectId(req.user.id);
  await target.save();

  const populated = await User.findById(target._id)
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email');
  return res.json({ user: populated });
}

export async function deactivateUser(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }
  const target = await User.findById(req.params.id);
  if (!target) return res.status(404).json({ message: 'User not found' });
  if (target._id.toString() === req.user.id) {
    return res.status(400).json({ message: 'Cannot deactivate yourself' });
  }
  target.status = 'inactive';
  target.updatedBy = new mongoose.Types.ObjectId(req.user.id);
  await target.save();
  return res.json({ message: 'User deactivated', user: target });
}
