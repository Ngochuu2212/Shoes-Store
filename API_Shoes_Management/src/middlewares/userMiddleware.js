import { CloudinaryProvider } from '~/providers/CloudinaryProvider'
import multer from 'multer'

const uploadAvatar = (req, res, next) => {
  CloudinaryProvider.streamUpload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'Dung lượng ảnh quá lớn! Vui lòng chọn ảnh dưới 2MB.' })
      }
      return res.status(400).json({ message: `Lỗi tải tập tin: ${err.message}` })
    } else if (err) {
      return res.status(500).json({ message: `Lỗi hệ thống khi xử lý ảnh: ${err.message}` })
    }

    // Nếu không có lỗi, file ảnh sau khi up lên Cloudinary thành công sẽ có thông tin trong req.file
    next()
  })
}

export const userMiddleware = {
  uploadAvatar
}