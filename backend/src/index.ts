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

// CORS middleware - MUST be before helmet to prevent header conflicts
app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean | string) => void) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    
    if (isOriginAllowed(origin)) {
      // Explicitly return the origin value to ensure correct CORS header
      // This prevents Railway or other proxies from overriding it
      console.log(`✅ CORS allowed for origin: ${origin}`);
      callback(null, origin);
    } else {
      console.warn(`⚠️  CORS blocked: ${origin}. Allowed origins: ${allowedOrigins.join(', ')}, *.vercel.app, localhost`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  // Ensure preflight requests are handled correctly
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

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});
