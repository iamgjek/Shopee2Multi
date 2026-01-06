import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { ShopeeParser } from '../services/shopeeParser';
import { FormatConverter, TargetPlatform } from '../services/formatConverter';
import { ExcelExporter } from '../services/excelExporter';
import { ConversionTaskModel } from '../models/ConversionTask';
import { UsageLogModel } from '../models/UsageLog';
import { UserModel } from '../models/User';
import { AppError } from '../middleware/errorHandler';
import { setCorsHeaders } from '../utils/cors';
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

    console.log(`\n🔄 [轉檔開始] 用戶ID: ${userId}, URL: ${url}, 目標平台: ${platform}`);

    // Check user plan and quota
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    console.log(`📋 [用戶檢查] 方案: ${user.plan}, 用戶: ${user.email}`);

    // Check daily quota for free plan
    if (user.plan === 'free') {
      const dailyUsage = await UsageLogModel.getDailyUsage(userId);
      console.log(`📊 [配額檢查] 今日已使用: ${dailyUsage}/10`);
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
    console.log(`✅ [任務建立] 任務ID: ${taskId}`);

    // Update task status
    await ConversionTaskModel.updateStatus(taskId, 'processing');
    console.log(`⏳ [狀態更新] 任務狀態: processing`);

    // Parse Shopee product
    console.log(`🌐 [開始解析] 正在解析 Shopee 商品頁面...`);
    const parseStartTime = Date.now();
    const parser = new ShopeeParser();
    const shopeeProduct = await parser.parseProduct(url);
    await parser.close();
    const parseTime = Date.now() - parseStartTime;
    console.log(`✅ [解析完成] 耗時: ${parseTime}ms`);
    console.log(`   - 商品標題: ${shopeeProduct.title}`);
    console.log(`   - 商品價格: NT$ ${shopeeProduct.price}`);
    console.log(`   - 圖片數量: ${shopeeProduct.images.length}`);
    console.log(`   - 規格數量: ${shopeeProduct.variants.length}`);
    console.log(`   - 規格詳情: ${Object.keys(shopeeProduct.specifications).length} 項`);

    // Convert format
    console.log(`🔄 [格式轉換] 正在轉換為 ${platform} 格式...`);
    const convertStartTime = Date.now();
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
    const convertTime = Date.now() - convertStartTime;
    console.log(`✅ [轉換完成] 耗時: ${convertTime}ms`);
    console.log(`   - 轉換後標題: ${convertedProduct.title}`);
    console.log(`   - 轉換後價格: NT$ ${convertedProduct.price}`);

    // Export to Excel
    console.log(`📊 [Excel 導出] 正在生成 Excel 檔案...`);
    const exportStartTime = Date.now();
    const excelBuffer = await ExcelExporter.exportToExcel([convertedProduct], platform);
    const exportTime = Date.now() - exportStartTime;
    console.log(`✅ [導出完成] 耗時: ${exportTime}ms, 檔案大小: ${(excelBuffer.length / 1024).toFixed(2)} KB`);

    // Save file
    const uploadsDir = join(process.cwd(), 'uploads');
    await mkdir(uploadsDir, { recursive: true });
    const filename = `${taskId}.xlsx`;
    const filepath = join(uploadsDir, filename);
    await writeFile(filepath, excelBuffer);
    console.log(`💾 [檔案儲存] 路徑: ${filepath}`);

    // Update task status
    await ConversionTaskModel.updateStatus(taskId, 'completed', filepath);
    console.log(`✅ [狀態更新] 任務狀態: completed`);

    // Log usage
    const latency = Date.now() - startTime;
    await UsageLogModel.create(userId, 1, platform, 'success', latency);
    console.log(`📝 [使用記錄] 已記錄使用情況, 總耗時: ${latency}ms`);

    console.log(`🎉 [轉檔成功] 任務ID: ${taskId}, 總耗時: ${latency}ms\n`);

    res.json({
      success: true,
      data: {
        taskId,
        downloadUrl: `/conversion/download/${taskId}`,  // 不包含 /api 前綴，由前端根據環境構建完整 URL
        product: {
          title: convertedProduct.title,
          price: convertedProduct.price
        }
      }
    });
  } catch (error) {
    const latency = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    console.error(`\n❌ [轉檔失敗] 任務ID: ${taskId || 'N/A'}, 耗時: ${latency}ms`);
    console.error(`   錯誤訊息: ${errorMessage}`);
    
    if (taskId) {
      await ConversionTaskModel.updateStatus(
        taskId,
        'failed',
        undefined,
        errorMessage
      );
      console.error(`   [狀態更新] 任務狀態: failed`);
      
      if (req.user) {
        await UsageLogModel.create(
          req.user.id,
          1,
          req.body.platform || 'unknown',
          'failed',
          latency,
          errorMessage
        );
        console.error(`   [使用記錄] 已記錄失敗使用情況\n`);
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

    // Set CORS headers before download
    setCorsHeaders(req, res);

    // Use sendFile instead of download to have better control over headers
    // Set Content-Disposition header for file download
    const filename = `shopee2multi-${task.platform_target}-${task.id}.xlsx`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    
    res.sendFile(join(process.cwd(), task.result_path), (err) => {
      if (err) {
        console.error('Error sending file:', err);
        if (!res.headersSent) {
          next(err);
        }
      }
    });
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
