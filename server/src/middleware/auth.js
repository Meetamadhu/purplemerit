import User from '../models/User.js';
import { verifyToken } from '../utils/tokens.js';

export async function authenticate(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  try {
    const decoded = verifyToken(token, process.env.JWT_ACCESS_SECRET);
    if (decoded.type === 'refresh') {
      return res.status(401).json({ message: 'Invalid token type' });
    }
    const user = await User.findById(decoded.sub);
    if (!user || user.status !== 'active') {
      return res.status(401).json({ message: 'User not found or inactive' });
    }
    req.user = { id: user._id.toString(), role: user.role, email: user.email };
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Authentication required' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
}
