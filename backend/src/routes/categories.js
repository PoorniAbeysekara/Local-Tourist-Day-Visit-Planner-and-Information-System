import { Router } from 'express';
import Category from '../models/Category.js';

const router = Router();
router.get('/', async (_req, res, next) => {
  try {
    res.json(await Category.find().sort({ name: 1 }));
  } catch (e) {
    next(e);
  }
});
export default router;
