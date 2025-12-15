import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { UserModel } from '../models/User';
import { pool } from '../db/connection';
import { AppError } from '../middleware/errorHandler';
import { z } from 'zod';

const router = express.Router();

const updatePlanSchema = z.object({
  plan: z.enum(['free', 'pro', 'biz'])
});

// Get pricing plans
router.get('/plans', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM pricing_plans ORDER BY price_monthly');
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
});

// Update subscription plan
router.post('/update', authenticate, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const { plan } = updatePlanSchema.parse(req.body);

    // Update user plan
    await UserModel.updatePlan(req.user.id, plan);

    // Create subscription record
    await pool.query(
      `INSERT INTO subscriptions (user_id, plan, status) 
       VALUES ($1, $2, 'active') 
       ON CONFLICT DO NOTHING`,
      [req.user.id, plan]
    );

    res.json({
      success: true,
      message: 'Subscription updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
