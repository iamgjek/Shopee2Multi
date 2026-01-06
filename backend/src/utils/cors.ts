import express from 'express';

// Get allowed origins from environment variable
const getAllowedOrigins = (): string[] => {
  return process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
    : ['http://localhost:5173'];
};

// Helper function to check if origin is allowed
export const isOriginAllowed = (origin: string): boolean => {
  const allowedOrigins = getAllowedOrigins();
  
  // Check explicit allowed origins
  if (allowedOrigins.includes(origin)) {
    return true;
  }
  
  // Allow Vercel preview deployments (*.vercel.app)
  if (origin.endsWith('.vercel.app')) {
    return true;
  }
  
  // Allow shopee2multi.space domain
  if (origin.includes('shopee2multi.space')) {
    return true;
  }
  
  // Allow localhost for development
  if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
    return true;
  }
  
  return false;
};

// Helper function to set CORS headers
export const setCorsHeaders = (req: express.Request, res: express.Response): void => {
  const origin = req.headers.origin as string | undefined;
  if (origin && isOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition, Content-Type');
  }
};

