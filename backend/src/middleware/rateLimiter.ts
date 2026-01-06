import rateLimit from 'express-rate-limit';

export const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // Disable trust proxy validation since we're using trust proxy: 1 (first proxy only)
  // This is safe because we only trust Railway's reverse proxy, not all proxies
  validate: {
    trustProxy: false,
  },
});
