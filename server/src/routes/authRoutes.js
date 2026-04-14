import { Router } from 'express';
import {
  login,
  loginValidators,
  register,
  registerValidators,
  refresh,
  refreshValidators,
  me,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const r = Router();

r.post('/login', loginValidators, login);
r.post('/register', registerValidators, register);
r.post('/refresh', refreshValidators, refresh);
r.get('/me', authenticate, me);

export default r;
