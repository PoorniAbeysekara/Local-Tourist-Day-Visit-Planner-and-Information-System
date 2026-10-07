import { Router } from 'express';
import Place from '../models/Place.js';
import { optionalAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const EDITABLE = [
  'name', 'description', 'categories', 'location', 'distanceKm', 'entranceFee', 'open24h',
  'openingHours', 'visitDuration', 'travelTips', 'facilities', 'contact', 'photos',
  'status', 'isTempClosed', 'notices',
];
const pick = (body) => Object.fromEntries(EDITABLE.filter((k) => k in body).map((k) => [k, body[k]]));

function serialize(place) {
  const o = place.toObject();
  const now = new Date();
  o.id = String(o._id);
  o.isOpenNow = place.isOpenNow();
  o.notices = (o.notices || []).filter((n) => !n.validUntil || new Date(n.validUntil) > now);
  return o;
}

// REQ-1.x: list + search + filters
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { q, category, maxDistance, freeOnly, openNow, includeInactive } = req.query;
    const filter = {};
    if (!(includeInactive === 'true' && req.admin)) filter.status = 'active';
    if (category && category !== 'all') filter.categories = String(category);
    if (maxDistance) filter.distanceKm = { $lte: Number(maxDistance) };
    if (freeOnly === 'true') filter.entranceFee = 0;
    if (q) {
      const rx = new RegExp(escapeRegex(String(q)), 'i');
      filter.$or = [{ name: rx }, { categories: rx }];
    }
    let out = (await Place.find(filter).sort({ distanceKm: 1 })).map(serialize);
    if (openNow === 'true') out = out.filter((p) => p.isOpenNow);
    res.json(out);
  } catch (e) {
    next(e);
  }
});

router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const place = await Place.findById(req.params.id);
    if (!place || (place.status !== 'active' && !req.admin)) {
      return res.status(404).json({ message: 'Place not found' });
    }
    res.json(serialize(place));
  } catch (e) {
    next(e);
  }
});

// Admin CRUD (REQ-5.x)
router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const place = await Place.create(pick(req.body));
    res.status(201).json(serialize(place));
  } catch (e) {
    next(e);
  }
});

router.put('/:id', requireAdmin, async (req, res, next) => {
  try {
    const place = await Place.findById(req.params.id);
    if (!place) return res.status(404).json({ message: 'Place not found' });
    place.set(pick(req.body));
    await place.save(); // runs validators
    res.json(serialize(place));
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const deleted = await Place.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Place not found' });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

export default router;
