import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import Admin from '../models/Admin.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });

router.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    const admin = email && (await Admin.findOne({ email: String(email).toLowerCase() }));
    const ok = admin && password && (await bcrypt.compare(String(password), admin.passwordHash));
    if (!ok) return res.status(401).json({ message: 'Invalid email or password' });
    admin.lastLogin = new Date();
    await admin.save();
    const token = jwt.sign({ id: admin.id, email: admin.email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '2h',
    });
    res.json({ token, email: admin.email });
  } catch (e) {
    next(e);
  }
});

router.get('/me', requireAdmin, (req, res) => res.json({ email: req.admin.email }));

export default router;
