import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err.message || 'Internal Server Error';

  // Always log errors with full details
  console.error('\n❌ [錯誤處理] ========================================');
  console.error(`   路徑: ${req.method} ${req.path}`);
  console.error(`   狀態碼: ${statusCode}`);
  console.error(`   錯誤訊息: ${message}`);
  if (err.stack) {
    console.error(`   堆疊追蹤:`, err.stack);
  }
  if (err instanceof Error && 'code' in err) {
    console.error(`   錯誤代碼: ${(err as any).code}`);
  }
  if (err instanceof Error && 'detail' in err) {
    console.error(`   詳細信息: ${(err as any).detail}`);
  }
  console.error('================================================\n');

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};
