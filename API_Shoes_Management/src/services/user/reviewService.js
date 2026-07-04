import pool from '~/config/db.js'
import { reviewModel } from '~/models/user/review/reviewModel'
import { ORDER_STATUS } from '~/utils/constants'

const getReviewsByProductSlug = async (slug) => {
  const reviews = await reviewModel.getReviewsByProductSlug(slug)

  const totalReviews = reviews.length
  const averageRating = totalReviews > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : 0

  return {
    totalReviews,
    averageRating: Number(averageRating),
    reviews
  }
}

const createReview = async (userId, orderId, { rating, comment, images }) => {
  const order = await reviewModel.getOrderForReview(orderId, userId)
  if (!order) {
    throw new Error('Đơn hàng không tồn tại hoặc bạn không có quyền đánh giá đơn hàng này.')
  }

  if (order.status !== ORDER_STATUS.DELIVERED && order.status !== ORDER_STATUS.COMPLETED) {
    throw new Error('Bạn chỉ có thể đánh giá sản phẩm sau khi đơn hàng đã được giao thành công.')
  }

  const connection = await pool.getConnection()
  await connection.beginTransaction()

  try {
    const productsInOrder = await reviewModel.getProductIdsByOrderId(orderId)
    if (productsInOrder.length === 0) {
      throw new Error('Đơn hàng không chứa sản phẩm nào hợp lệ để đánh giá.')
    }

    for (const item of productsInOrder) {
      await reviewModel.createProductReview(connection, {
        userId,
        productId: item.product_id,
        orderId,
        rating,
        comment,
        images: images || []
      })

      await reviewModel.updateProductRatingAvg(connection, item.product_id)
    }

    await connection.commit()
    return { message: 'Đăng bài đánh giá sản phẩm thành công!' }
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

const createStoreReview = async (userId, orderId, { rating, comment }) => {
  const order = await reviewModel.getOrderForReview(orderId, userId)
  if (!order) {
    throw new Error('Đơn hàng không tồn tại hoặc bạn không có quyền đánh giá.')
  }

  if (order.status !== ORDER_STATUS.DELIVERED && order.status !== ORDER_STATUS.COMPLETED) {
    throw new Error('Bạn chỉ có thể đánh giá cửa hàng sau khi đơn hàng đã được giao thành công.')
  }

  const connection = await pool.getConnection()
  await connection.beginTransaction()

  try {
    await reviewModel.createStoreReview(connection, {
      userId,
      storeId: order.store_id,
      orderId,
      rating,
      comment
    })

    await reviewModel.updateStoreRatingAvg(connection, order.store_id)

    await connection.commit()
    return { message: 'Đăng bài đánh giá cửa hàng thành công!' }
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

export const reviewService = {
  getReviewsByProductSlug,
  createReview,
  createStoreReview
}