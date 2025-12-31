import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { ShopeeParser } from '../services/shopeeParser';
import { FormatConverter, TargetPlatform } from '../services/formatConverter';
import { ExcelExporter } from '../services/excelExporter';
import { ConversionTaskModel } from '../models/ConversionTask';
import { UsageLogModel } from '../models/UsageLog';
import { UserModel } from '../models/User';
import { AppError } from '../middleware/errorHandler';
import { z } from 'zod';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const router = express.Router();

const convertSchema = z.object({
  url: z.string().url(),
  platform: z.enum(['momo', 'pchome', 'coupang', 'yahoo', 'easystore'])
});

// Convert Shopee product to target platform
router.post('/convert', authenticate, async (req: AuthRequest, res, next) => {
  const startTime = Date.now();
  let taskId: string | null = null;

  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const { url, platform } = convertSchema.parse(req.body);
    const userId = req.user.id;

    // Check user plan and quota
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check daily quota for free plan
    if (user.plan === 'free') {
      const dailyUsage = await UsageLogModel.getDailyUsage(userId);
      if (dailyUsage >= 10) {
        throw new AppError('Daily quota exceeded. Please upgrade to Pro plan.', 403);
      }
    }

    // Check platform support based on plan
    if (platform === 'coupang' || platform === 'yahoo') {
      if (user.plan !== 'biz') {
        throw new AppError('This platform requires Biz plan', 403);
      }
    }
    // EasyStore is available for Pro and Biz plans
    if (platform === 'easystore') {
      if (user.plan === 'free') {
        throw new AppError('EasyStore requires Pro plan or higher', 403);
      }
    }

    // Create conversion task
    const task = await ConversionTaskModel.create(userId, url, platform);
    taskId = task.id;

    // Update task status
    await ConversionTaskModel.updateStatus(taskId, 'processing');

    // Parse Shopee product
    const parser = new ShopeeParser();
    const shopeeProduct = await parser.parseProduct(url);
    await parser.close();

    // Convert format
    let convertedProduct;
    switch (platform) {
      case 'momo':
        convertedProduct = FormatConverter.convertToMomo(shopeeProduct);
        break;
      case 'pchome':
        convertedProduct = FormatConverter.convertToPChome(shopeeProduct);
        break;
      case 'coupang':
        convertedProduct = FormatConverter.convertToCoupang(shopeeProduct);
        break;
      case 'yahoo':
        convertedProduct = FormatConverter.convertToYahoo(shopeeProduct);
        break;
      case 'easystore':
        convertedProduct = FormatConverter.convertToEasystore(shopeeProduct);
        break;
      default:
        throw new AppError('Unsupported platform', 400);
    }

    // Export to Excel
    const excelBuffer = await ExcelExporter.exportToExcel([convertedProduct], platform);

    // Save file
    const uploadsDir = join(process.cwd(), 'uploads');
    await mkdir(uploadsDir, { recursive: true });
    const filename = `${taskId}.xlsx`;
    const filepath = join(uploadsDir, filename);
    await writeFile(filepath, excelBuffer);

    // Update task status
    await ConversionTaskModel.updateStatus(taskId, 'completed', filepath);

    // Log usage
    const latency = Date.now() - startTime;
    await UsageLogModel.create(userId, 1, platform, 'success', latency);

    res.json({
      success: true,
      data: {
        taskId,
        downloadUrl: `/api/conversion/download/${taskId}`,
        product: {
          title: convertedProduct.title,
          price: convertedProduct.price
        }
      }
    });
  } catch (error) {
    if (taskId) {
      await ConversionTaskModel.updateStatus(
        taskId,
        'failed',
        undefined,
        error instanceof Error ? error.message : 'Unknown error'
      );
      if (req.user) {
        await UsageLogModel.create(
          req.user.id,
          1,
          req.body.platform || 'unknown',
          'failed',
          Date.now() - startTime,
          error instanceof Error ? error.message : 'Unknown error'
        );
      }
    }
    next(error);
  }
});

// Download converted file
router.get('/download/:taskId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const task = await ConversionTaskModel.findById(req.params.taskId);
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    if (task.user_id !== req.user.id) {
      throw new AppError('Unauthorized', 403);
    }

    if (task.status !== 'completed' || !task.result_path) {
      throw new AppError('File not ready', 404);
    }

    res.download(task.result_path, `shopee2multi-${task.platform_target}-${task.id}.xlsx`);
  } catch (error) {
    next(error);
  }
});

// Get conversion history
router.get('/history', authenticate, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const tasks = await ConversionTaskModel.findByUserId(req.user.id, 50);
    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
});

export default router;
