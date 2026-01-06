import express from 'express';
import { ContactModel } from '../models/Contact';
import { AppError } from '../middleware/errorHandler';
import { z } from 'zod';

const router = express.Router();

const contactSchema = z.object({
  name: z.string().min(1, '姓名不能為空').max(255, '姓名過長'),
  email: z.string().email('請輸入有效的電子郵件'),
  subject: z.string().min(1, '主旨不能為空').max(500, '主旨過長'),
  message: z.string().min(1, '訊息內容不能為空').max(5000, '訊息內容過長')
});

// Submit contact form
router.post('/submit', async (req, res, next) => {
  try {
    console.log('📧 [聯絡表單] 收到聯絡表單提交');
    const { name, email, subject, message } = contactSchema.parse(req.body);
    console.log(`   姓名: ${name}, Email: ${email}, 主旨: ${subject}`);

    // Create contact submission
    const submission = await ContactModel.create(name, email, subject, message);
    console.log(`✅ [聯絡表單] 表單已儲存, ID: ${submission.id}`);

    res.json({
      success: true,
      data: {
        id: submission.id,
        message: '您的訊息已成功送出，我們會盡快回覆您！'
      }
    });
  } catch (error) {
    console.error('❌ [聯絡表單錯誤]', error);
    if (error instanceof z.ZodError) {
      console.error('   驗證錯誤:', error.errors);
      return next(new AppError('Invalid input data', 400));
    }
    next(error);
  }
});

// Get all contact submissions (admin only - can be added later)
// router.get('/submissions', authenticate, async (req, res, next) => {
//   try {
//     // Check if user is admin
//     if (req.user?.role !== 'admin') {
//       throw new AppError('Unauthorized', 403);
//     }
//     // Implementation here
//   } catch (error) {
//     next(error);
//   }
// });

export default router;

