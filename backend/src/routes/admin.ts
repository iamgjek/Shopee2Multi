import express from 'express';
import { requireAdmin, AuthRequest } from '../middleware/auth';
import { UserModel } from '../models/User';
import { UsageLogModel } from '../models/UsageLog';
import { ConversionTaskModel } from '../models/ConversionTask';
import { pool } from '../db/connection';
import { AppError } from '../middleware/errorHandler';
import { z } from 'zod';

const router = express.Router();

// All admin routes require admin authentication
router.use(requireAdmin);

const updateUserSchema = z.object({
  plan: z.enum(['free', 'pro', 'biz']).optional(),
  status: z.enum(['active', 'suspended', 'deleted']).optional(),
  role: z.enum(['user', 'admin']).optional()
});

// Get all users with pagination
router.get('/users', async (req: AuthRequest, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string | undefined;
    const offset = (page - 1) * limit;

    const { users, total } = await UserModel.findAll(limit, offset, search);

    // Get usage stats for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const dailyUsage = await UsageLogModel.getDailyUsage(user.id);
        const totalTasks = await ConversionTaskModel.countByUserId(user.id);
        return {
          ...user,
          stats: {
            dailyUsage,
            totalTasks
          }
        };
      })
    );

    res.json({
      success: true,
      data: {
        users: usersWithStats,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get single user details
router.get('/users/:userId', async (req: AuthRequest, res, next) => {
  try {
    const { userId } = req.params;

    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Get detailed stats
    const dailyUsage = await UsageLogModel.getDailyUsage(userId);
    const totalTasks = await ConversionTaskModel.countByUserId(userId);
    const recentTasks = await ConversionTaskModel.findByUserId(userId, 10);
    const usageHistory = await UsageLogModel.getUsageHistory(userId, 30);

    res.json({
      success: true,
      data: {
        user,
        stats: {
          dailyUsage,
          totalTasks,
          recentTasks,
          usageHistory
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Update user (plan, status, role)
router.patch('/users/:userId', async (req: AuthRequest, res, next) => {
  try {
    const { userId } = req.params;
    const updates = updateUserSchema.parse(req.body);

    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Prevent admin from removing their own admin role
    if (req.user?.id === userId && updates.role === 'user') {
      throw new AppError('Cannot remove your own admin role', 400);
    }

    await UserModel.updateUser(userId, updates);

    const updatedUser = await UserModel.findById(userId);

    res.json({
      success: true,
      data: {
        user: updatedUser,
        message: 'User updated successfully'
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get platform statistics
router.get('/stats/platforms', async (req: AuthRequest, res, next) => {
  try {
    const result = await pool.query(`
      SELECT 
        platform_target,
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed
      FROM conversion_tasks
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY platform_target
      ORDER BY total DESC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
});

// Get user plan distribution
router.get('/stats/plans', async (req: AuthRequest, res, next) => {
  try {
    const result = await pool.query(`
      SELECT 
        plan,
        COUNT(*) as count,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active
      FROM users
      GROUP BY plan
      ORDER BY 
        CASE plan
          WHEN 'free' THEN 1
          WHEN 'pro' THEN 2
          WHEN 'biz' THEN 3
        END
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
});

// Get daily usage statistics
router.get('/stats/daily-usage', async (req: AuthRequest, res, next) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    
    const result = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'success' THEN 1 END) as success,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
        AVG(latency_ms) as avg_latency
      FROM usage_logs
      WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
});

// Get top users by usage
router.get('/stats/top-users', async (req: AuthRequest, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const days = parseInt(req.query.days as string) || 30;

    const result = await pool.query(`
      SELECT 
        u.id,
        u.email,
        u.name,
        u.plan,
        COUNT(ul.id) as usage_count,
        COUNT(CASE WHEN ul.status = 'success' THEN 1 END) as success_count
      FROM users u
      LEFT JOIN usage_logs ul ON u.id = ul.user_id 
        AND ul.created_at >= CURRENT_DATE - INTERVAL '${days} days'
      GROUP BY u.id, u.email, u.name, u.plan
      ORDER BY usage_count DESC
      LIMIT $1
    `, [limit]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
});

export default router;

