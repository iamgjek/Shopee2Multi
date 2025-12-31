import express from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { AppError } from '../middleware/errorHandler';
import { z } from 'zod';

const router = express.Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

// Register
router.post('/register', async (req, res, next) => {
  try {
    console.log('📝 [註冊請求] 收到註冊請求');
    const { email, password, name } = registerSchema.parse(req.body);
    console.log(`   Email: ${email}, Name: ${name || 'N/A'}`);

    // Check if user exists
    console.log('🔍 [註冊檢查] 檢查用戶是否已存在...');
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      console.log(`⚠️  [註冊失敗] 郵箱已註冊: ${email}`);
      throw new AppError('Email already registered', 400);
    }
    console.log('✅ [註冊檢查] 郵箱可用');

    // Create user
    console.log('👤 [註冊創建] 正在創建用戶...');
    const user = await UserModel.create(email, password, name);
    console.log(`✅ [註冊創建] 用戶創建成功, ID: ${user.id}`);

    // Generate JWT
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('❌ [註冊錯誤] JWT_SECRET 環境變數未設置');
      throw new AppError('Server configuration error', 500);
    }
    console.log('🔑 [註冊JWT] 生成 JWT token...');
    const token = jwt.sign(
      { id: user.id, email: user.email, plan: user.plan, role: user.role || 'user' },
      jwtSecret,
      { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'] }
    );
    console.log('✅ [註冊成功] 用戶註冊完成');

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          plan: user.plan,
          role: user.role || 'user'
        }
      }
    });
  } catch (error) {
    console.error('❌ [註冊錯誤]', error);
    if (error instanceof z.ZodError) {
      console.error('   驗證錯誤:', error.errors);
      return next(new AppError('Invalid input data', 400));
    }
    next(error);
  }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Find user
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Verify password
    const isValid = await UserModel.verifyPassword(password, user.password_hash);
    if (!isValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate JWT
    const jwtSecret = process.env.JWT_SECRET || 'secret';
    const token = jwt.sign(
      { id: user.id, email: user.email, plan: user.plan, role: user.role || 'user' },
      jwtSecret,
      { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'] }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          plan: user.plan,
          role: user.role || 'user'
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
