import { cartService } from '~/services/user/cartService'

const addToCart = async (req, res) => {
  try {
    const userId = req.jwtDecoded.id
    const { variantId, quantity } = req.body

    const result = await cartService.addToCart(userId, Number(variantId), Number(quantity))
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi thêm vào giỏ hàng: ${error.message}` })
  }
}

const getCart = async (req, res) => {
  try {
    const userId = req.jwtDecoded.id
    const result = await cartService.getCart(userId)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi tải dữ liệu giỏ hàng: ${error.message}` })
  }
}

const updateQuantity = async (req, res) => {
  try {
    const userId = req.jwtDecoded.id
    const { variantId, quantity } = req.body

    const result = await cartService.updateQuantity(userId, Number(variantId), Number(quantity))
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi cập nhật số lượng giỏ hàng: ${error.message}` })
  }
}

const removeFromCart = async (req, res) => {
  try {
    const userId = req.jwtDecoded.id
    const variantIds = req.body?.variantIds || req.query?.variantIds

    const result = await cartService.removeFromCart(userId, variantIds)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi xóa sản phẩm khỏi giỏ hàng: ${error.message}` })
  }
}

export const cartController = {
  addToCart,
  getCart,
  updateQuantity,
  removeFromCart
}