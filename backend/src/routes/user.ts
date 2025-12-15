import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { UserModel } from '../models/User';
import { UsageLogModel } from '../models/UsageLog';
import { pool } from '../db/connection';

const router = express.Router();

// Get current user profile
router.get('/profile', authenticate, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      throw new Error('Authentication required');
    }

    const user = await UserModel.findById(req.user.id);
    if (!user) {
      throw new Error('User not found');
    }

    // Get daily usage
    const dailyUsage = await UsageLogModel.getDailyUsage(req.user.id);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          plan: user.plan,
          status: user.status
        },
        usage: {
          daily: dailyUsage,
          limit: user.plan === 'free' ? 10 : 999999
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get usage statistics
router.get('/usage', authenticate, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      throw new Error('Authentication required');
    }

    const history = await UsageLogModel.getUsageHistory(req.user.id, 30);
    const dailyUsage = await UsageLogModel.getDailyUsage(req.user.id);

    res.json({
      success: true,
      data: {
        daily: dailyUsage,
        history: history.slice(0, 30)
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
