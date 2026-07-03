import { reviewService } from '~/services/user/reviewService'

const extractImagesFromReqFiles = (reqFiles) => {
  const imagesArray = []
  if (reqFiles && reqFiles.length > 0) {
    reqFiles.forEach(file => {
      imagesArray.push({
        public_id: file.filename,
        secure_url: file.path
      })
    })
  }
  return imagesArray
}

const getProductReviews = async (req, res) => {
  try {
    const { slug } = req.params
    const result = await reviewService.getReviewsByProductSlug(slug)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi tải đánh giá sản phẩm: ${error.message}` })
  }
}

const createReview = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const { orderId } = req.params
    const { rating, comment } = req.body

    // Bốc mảng file ảnh đã qua bộ lọc Cloudinary Provider
    const images = extractImagesFromReqFiles(req.files)

    const result = await reviewService.createReview(userId, Number(orderId), {
      rating: Number(rating),
      comment,
      images
    })

    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi khi thực hiện viết đánh giá: ${error.message}` })
  }
}

const createStoreReview = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const { orderId } = req.params
    const { rating, comment } = req.body

    const result = await reviewService.createStoreReview(userId, Number(orderId), {
      rating: Number(rating),
      comment
    })

    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi khi thực hiện viết đánh giá cửa hàng: ${error.message}` })
  }
}

export const reviewController = {
  getProductReviews,
  createReview,
  createStoreReview
}