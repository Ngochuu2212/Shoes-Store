import { cartModel } from '~/models/user/cart/cartModel'

// Logic: Thêm vào giỏ
const addToCart = async (userId, variantId, quantity) => {
  // BƯỚC 1: Kiểm tra xem biến thể có tồn tại không và hàng trong kho còn đủ không
  const stockAvailable = await cartModel.checkVariantStock(variantId)
  if (stockAvailable === 0) {
    throw new Error('Sản phẩm này hiện tại đã hết hàng trong kho.')
  }

  // BƯỚC 2: Kiểm tra xem sản phẩm đã nằm trong giỏ hàng của user chưa
  const existingItem = await cartModel.findCartItem(userId, variantId)

  if (existingItem) {
    // Nếu có rồi thì tính toán cộng dồn số lượng mới vào số lượng cũ
    const newQuantity = existingItem.quantity + quantity

    // Đảm bảo tổng số lượng sau cộng dồn không vượt quá kho hàng hiện có
    if (newQuantity > stockAvailable) {
      throw new Error(`Bạn chỉ có thể thêm tối đa ${stockAvailable} sản phẩm này vào giỏ hàng.`)
    }

    await cartModel.updateCartQuantity(userId, variantId, newQuantity)
    return { message: 'Đã cập nhật số lượng sản phẩm trong giỏ hàng thành công.' }
  } else {
    // Nếu chưa có thì kiểm tra số lượng yêu cầu ban đầu có vượt kho không
    if (quantity > stockAvailable) {
      throw new Error(`Số lượng tồn kho không đủ (Hiện còn: ${stockAvailable} sản phẩm).`)
    }

    await cartModel.addToCart(userId, variantId, quantity)
    return { message: 'Đã thêm sản phẩm mới vào giỏ hàng thành công.' }
  }
}

// Logic: Lấy toàn bộ danh sách giỏ hàng
const getCart = async (userId) => {
  return await cartModel.getCartByUserId(userId)
}

// Logic: Cập nhật trực tiếp số lượng (Dùng khi khách bấm nút cộng trừ ở UI)
const updateQuantity = async (userId, variantId, quantity) => {
  if (quantity <= 0) {
    // Nếu số lượng chỉnh về bằng 0 hoặc âm, tự động xóa item đó luôn
    await cartModel.removeFromCart(userId, variantId)
    return { message: 'Đã xóa sản phẩm khỏi giỏ hàng do số lượng bằng 0.' }
  }

  const stockAvailable = await cartModel.checkVariantStock(variantId)
  if (quantity > stockAvailable) {
    throw new Error(`Không thể cập nhật. Số lượng vượt quá tồn kho thực tế (Hiện còn: ${stockAvailable}).`)
  }

  await cartModel.updateCartQuantity(userId, variantId, quantity)
  return { message: 'Cập nhật số lượng giỏ hàng thành công.' }
}

// Logic: Xóa sản phẩm khỏi giỏ
const removeFromCart = async (userId, variantIds) => {
  const idsArray = Array.isArray(variantIds) ? variantIds : [Number(variantIds)]

  await cartModel.removeFromCart(userId, idsArray)
  return { message: 'Đã gỡ các sản phẩm được chọn khỏi giỏ hàng.' }
}

export const cartService = {
  addToCart,
  getCart,
  updateQuantity,
  removeFromCart
}