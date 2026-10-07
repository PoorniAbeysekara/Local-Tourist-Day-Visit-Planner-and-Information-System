import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import placesRoutes from './routes/places.js';
import categoriesRoutes from './routes/categories.js';
import authRoutes from './routes/auth.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Since helmet sets Cross-Origin-Resource-Policy by default, which can block images
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/places', placesRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/auth', authRoutes);
import uploadRoutes from './routes/upload.js';
app.use('/api/upload', uploadRoutes);

app.use('/api', (_req, res) => res.status(404).json({ message: 'Not found' }));

// REQ-5.5: clear validation errors
app.use((err, _req, res, _next) => {
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((e) => e.message).join('; ');
    return res.status(400).json({ message });
  }
  if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid id' });
  console.error(err);
  res.status(500).json({ message: 'Something went wrong on the server' });
});

export default app;
