import { Router } from 'express';
import {
  listUsers,
  listValidators,
  getUser,
  idParam,
  createUser,
  createUserValidators,
  updateUser,
  updateUserValidators,
  deactivateUser,
} from '../controllers/userController.js';
import { authenticate, requireRoles } from '../middleware/auth.js';

const r = Router();

r.use(authenticate);

r.get('/', requireRoles('admin', 'manager'), listValidators, listUsers);
r.post('/', requireRoles('admin'), createUserValidators, createUser);
r.get('/:id', ...idParam, getUser);
r.patch('/:id', updateUserValidators, updateUser);
r.patch('/:id/deactivate', requireRoles('admin'), ...idParam, deactivateUser);

export default r;
