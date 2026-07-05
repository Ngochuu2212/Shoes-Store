import express from 'express'
import multer from 'multer'
import { aiController } from '~/controllers/ai/aiController'

const router = express.Router()

// Cấu hình Multer để lưu trữ ảnh trong bộ nhớ (Memory Storage) dưới dạng buffer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // Giới hạn kích thước ảnh 5MB
  }
})

router.post('/chat', aiController.chatWithAI)
router.post('/search-by-image', upload.single('image'), aiController.searchByImage)
router.post('/analyze-tryon', upload.single('image'), aiController.analyzeTryOn)
router.post('/detect-feet', upload.single('image'), aiController.detectFeet)

export const aiRouter = router
