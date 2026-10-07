import jwt from 'jsonwebtoken';

function readToken(req) {
  const h = req.headers.authorization || '';
  return h.startsWith('Bearer ') ? h.slice(7) : null;
}

// Sets req.admin when a valid token is present; never blocks.
export function optionalAuth(req, _res, next) {
  const token = readToken(req);
  if (token) {
    try {
      req.admin = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      /* ignore invalid token on public routes */
    }
  }
  next();
}

// REQ-6.2: deny unauthenticated access to admin routes.
export function requireAdmin(req, res, next) {
  const token = readToken(req);
  if (!token) return res.status(401).json({ message: 'Authentication required' });
  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Session expired. Please sign in again.' });
  }
}
