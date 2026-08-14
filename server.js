import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const connectDB = require('./backend/config/db');
const { initFirebase } = require('./backend/config/firebase');
const bookingRoutes = require('./backend/routes/bookingRoutes');
const contactRoutes = require('./backend/routes/contactRoutes');
const userRoutes = require('./backend/routes/userRoutes');
const imageRoutes = require('./backend/routes/imageRoutes');
const contentRoutes = require('./backend/routes/contentRoutes');
const adminRoutes = require('./backend/routes/adminRoutes');
const errorHandler = require('./backend/middleware/errorHandler');

const app = express();
app.set('trust proxy', 1);

// --- Security & performance middleware ---
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
    xssFilter: true,
    noSniff: true,
    hidePoweredBy: true,
    hsts: process.env.NODE_ENV === 'production' ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
  })
);
app.use(compression());
app.use(express.json({ limit: '10mb' }));

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Global API rate limit to mitigate broad DDoS/brute-force attacks
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
});
app.use('/api', apiLimiter);

// Strict rate limit for auth, user sync, and form submission endpoints against brute-force attacks
const strictAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication or form submission attempts. Please try again after 15 minutes.',
  },
});
app.use(['/api/users/sync', '/api/bookings', '/api/contact'], strictAuthLimiter);

// Dedicated Admin Login brute-force protector (max 10 attempts per 15 mins)
const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many administrative login attempts. For security, please try again in 15 minutes.',
  },
});
app.use('/api/admin/login', adminLoginLimiter);

// Serve uploaded media files
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// --- API Routes ---
app.get('/api/health', (req, res) =>
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() })
);
app.use('/api/admin', adminRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/users', userRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/content', contentRoutes);

// 404 handler for API routes specifically
app.use('/api/*', (req, res) =>
  res.status(404).json({ success: false, message: 'API route not found' })
);

// Global Express error handling middleware
app.use(errorHandler);

// --- Vite middleware (Dev) / Static files (Production) ---
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: 3000 },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const PORT = process.env.PORT || 3000;

  try {
    await connectDB();
  } catch (err) {
    console.warn('MongoDB unavailable, running with fallback store:', err.message);
  }

  initFirebase();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
