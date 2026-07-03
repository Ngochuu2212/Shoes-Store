import multer from 'multer'

export const errorHandlingMiddleware = (err, req, res, next) => {
  // Nếu hệ thống bắt trúng quả tang lỗi phát ra từ phía ông Multer
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'Tệp tải lên quá lớn! Dung lượng ảnh danh mục tối đa là 2MB.' })
    }
    return res.status(400).json({ message: `Lỗi tải tệp: ${err.message}` })
  }

  const responseStatusCode = err.statusCode || 500
  return res.status(responseStatusCode).json({
    message: err.message || 'Internal Server Error',
    stack: err.stack
  })
}