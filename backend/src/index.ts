import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import authRoutes from './routes/auth';
import conversionRoutes from './routes/conversion';
import userRoutes from './routes/user';
import subscriptionRoutes from './routes/subscription';
import adminRoutes from './routes/admin';
import contactRoutes from './routes/contact';
import { join } from 'path';
import { autoMigrate } from './db/autoMigrate';
import { autoSeedAdmin } from './db/autoSeed';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Trust proxy - Required when behind a reverse proxy (Railway, Nginx, etc.)
// This allows express-rate-limit to correctly identify client IPs from X-Forwarded-For header
app.set('trust proxy', true);

// CORS configuration - support multiple origins and Vercel preview deployments
// MUST be defined and applied BEFORE helmet to ensure CORS headers are set correctly
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:5173'];

// Helper function to check if origin is allowed
const isOriginAllowed = (origin: string): boolean => {
  // Check explicit allowed origins
  if (allowedOrigins.includes(origin)) {
    console.log(`✅ Origin ${origin} matched explicit allowed origin`);
    return true;
  }
  
  // Allow Vercel preview deployments (*.vercel.app)
  if (origin.endsWith('.vercel.app')) {
    console.log(`✅ Origin ${origin} matched *.vercel.app pattern`);
    return true;
  }
  
  // Allow shopee2multi.space domain
  if (origin.includes('shopee2multi.space')) {
    console.log(`✅ Origin ${origin} matched shopee2multi.space pattern`);
    return true;
  }
  
  // Allow localhost for development
  if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
    console.log(`✅ Origin ${origin} matched localhost pattern`);
    return true;
  }
  
  console.log(`❌ Origin ${origin} not allowed. Checked against: ${allowedOrigins.join(', ')}, *.vercel.app, shopee2multi.space, localhost`);
  return false;
};

// Manual CORS middleware - runs first to ensure headers are set
// This is a backup in case the cors library doesn't work correctly with Railway
// IMPORTANT: This must handle OPTIONS requests even if the server is having issues
app.use((req, res, next) => {
  try {
    const origin = req.headers.origin as string | undefined;
    
    // Always handle OPTIONS preflight requests, even if origin check fails
    // This prevents 502 errors when the server is starting up or having issues
    if (req.method === 'OPTIONS') {
      if (origin && isOriginAllowed(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.setHeader('Access-Control-Expose-Headers', 'Content-Type, Authorization');
        res.setHeader('Access-Control-Max-Age', '86400');
        console.log(`✅ CORS preflight allowed for origin: ${origin}`);
        return res.status(204).end();
      } else if (origin) {
        // Even if origin is not allowed, respond to OPTIONS to prevent 502
        console.warn(`⚠️  CORS preflight blocked for origin: ${origin}`);
        return res.status(403).json({ error: 'CORS policy: Origin not allowed' });
      } else {
        // No origin header, allow the request (for same-origin or non-browser requests)
        return res.status(204).end();
      }
    }
    
    if (origin && isOriginAllowed(origin)) {
      // Explicitly set CORS headers to prevent Railway from overriding
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.setHeader('Access-Control-Expose-Headers', 'Content-Type, Authorization');
      res.setHeader('Access-Control-Max-Age', '86400');
      
      console.log(`✅ CORS headers set for origin: ${origin}`);
    } else if (origin) {
      console.warn(`⚠️  CORS blocked origin: ${origin}. Allowed: ${allowedOrigins.join(', ')}, *.vercel.app, localhost`);
    }
    
    next();
  } catch (error) {
    // If CORS middleware fails, still try to respond to OPTIONS requests
    if (req.method === 'OPTIONS') {
      console.error('❌ Error in CORS middleware, but responding to OPTIONS:', error);
      return res.status(204).end();
    }
    next(error);
  }
});

// CORS middleware using cors library (as additional layer)
app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean | string) => void) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    
    if (isOriginAllowed(origin)) {
      // Explicitly return the origin value to ensure correct CORS header
      callback(null, origin);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Middleware - Configure helmet to not interfere with CORS
// Placed AFTER CORS to ensure CORS headers are not overridden
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

// Rate limiting
app.use('/api/', rateLimiter);

// Health check - should be accessible without authentication
// Place before rate limiting to ensure it's always accessible
app.get('/health', (req, res) => {
  try {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/conversion', conversionRoutes);
app.use('/api/user', userRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);

// Error handling
app.use(errorHandler);

// CORS test endpoint for debugging
app.get('/api/cors-test', (req, res) => {
  const origin = req.headers.origin;
  res.json({
    origin,
    allowed: origin ? isOriginAllowed(origin) : false,
    allowedOrigins,
    message: 'CORS test endpoint'
  });
});

// Start server with error handling
// IMPORTANT: Bind to 0.0.0.0 (all interfaces) not localhost for Railway/cloud deployments
// Railway will automatically set PORT environment variable
const HOST = process.env.HOST || '0.0.0.0';

// Auto-migrate database on startup (non-blocking)
// This ensures tables are created automatically if they don't exist
autoMigrate()
  .then(() => {
    // After migration, seed admin user if enabled
    return autoSeedAdmin();
  })
  .catch(err => {
    console.error('⚠️  Auto-migration/seed failed, but server will continue:', err);
    console.error('💡 You may need to run migration manually: npm run migrate');
    console.error('💡 You may need to run seed manually: npm run seed');
  });

const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS Configuration:`);
  console.log(`   - Allowed origins from env: ${allowedOrigins.join(', ') || 'none'}`);
  console.log(`   - Auto-allowing: *.vercel.app, localhost`);
  console.log(`   - Test endpoint: /api/cors-test`);
  console.log(`   - Health check: /health`);
  console.log(`✅ Server is ready to accept connections`);
  console.log(`📡 Listening on all network interfaces (0.0.0.0) for Railway compatibility`);
});

// Handle server errors
server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
  } else {
    console.error('❌ Server error:', err);
  }
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  console.error('Stack trace:', err.stack);
  // In production, we might want to exit, but for now allow graceful shutdown
  // process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
  // In production, we might want to exit, but for now allow graceful shutdown
  // process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('📴 SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
