import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';

if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not set in .env');

const port = process.env.PORT || 5000;
connectDB()
  .then(() => app.listen(port, () => console.log(`API running on http://localhost:${port}`)))
  .catch((err) => {
    console.error('Failed to start:', err.message);
    process.exit(1);
  });
