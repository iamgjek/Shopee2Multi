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
import { join } from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration - support multiple origins and Vercel preview deployments
// MUST be defined and applied BEFORE helmet to ensure CORS headers are set correctly
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:5173'];

// Helper function to check if origin is allowed
const isOriginAllowed = (origin: string): boolean => {
  // Check explicit allowed origins
  if (allowedOrigins.includes(origin)) {
    return true;
  }
  
  // Allow Vercel preview deployments (*.vercel.app)
  if (origin.endsWith('.vercel.app')) {
    return true;
  }
  
  // Allow localhost for development
  if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
    return true;
  }
  
  return false;
};

// Manual CORS middleware - runs first to ensure headers are set
// This is a backup in case the cors library doesn't work correctly with Railway
app.use((req, res, next) => {
  const origin = req.headers.origin as string | undefined;
  
  if (origin && isOriginAllowed(origin)) {
    // Explicitly set CORS headers to prevent Railway from overriding
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400');
    
    // Handle preflight requests immediately
    if (req.method === 'OPTIONS') {
      console.log(`✅ CORS preflight allowed for origin: ${origin}`);
      return res.status(204).end();
    }
    
    console.log(`✅ CORS headers set for origin: ${origin}`);
  } else if (origin) {
    console.warn(`⚠️  CORS blocked origin: ${origin}. Allowed: ${allowedOrigins.join(', ')}, *.vercel.app, localhost`);
  }
  
  next();
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

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/conversion', conversionRoutes);
app.use('/api/user', userRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/admin', adminRoutes);

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
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS Configuration:`);
  console.log(`   - Allowed origins from env: ${allowedOrigins.join(', ') || 'none'}`);
  console.log(`   - Auto-allowing: *.vercel.app, localhost`);
  console.log(`   - Test endpoint: /api/cors-test`);
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
  // Don't exit immediately, allow graceful shutdown
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit immediately, allow graceful shutdown
});
