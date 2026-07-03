import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  cartCount: 0,
  cartItems: [],
  selectedItems: [],
  pendingOrderIds: [],
  paymentStatus: null
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Nạp toàn bộ giỏ hàng
    setCart: (state, action) => {
      state.cartItems = action.payload
      state.cartCount = action.payload.reduce((sum, item) => sum + item.cart_quantity, 0)
    },

    // Nạp tổng số lượng giỏ hàng từ API về
    setCartCount: (state, action) => {
      state.cartCount = action.payload
    },

    // Cộng dồn nhanh khi click thêm sản phẩm ngoài danh sách
    incrementCartCount: (state, action) => {
      state.cartCount += action.payload
    },

    // Trừ đi hoặc làm sạch khi đăng xuất
    clearCart: (state) => {
      state.cartCount = 0
      state.cartItems = []
      state.selectedItems = []
      state.pendingOrderIds = []
      state.paymentStatus = null
    },

    // Cập nhật selected items
    setSelectedItems: (state, action) => {
      state.selectedItems = action.payload
    },

    // Lưu orderIds đang pending
    setPendingOrderIds: (state, action) => {
      state.pendingOrderIds = action.payload
      localStorage.setItem('pending_order_ids', JSON.stringify(action.payload))
    },

    // Xóa pending order ids
    clearPendingOrderIds: (state) => {
      state.pendingOrderIds = []
      localStorage.removeItem('pending_order_ids')
    },

    // Set payment status
    setPaymentStatus: (state, action) => {
      state.paymentStatus = action.payload
    },

    // Restore pending order ids từ localStorage (khi app reload)
    restorePendingOrderIds: (state) => {
      const saved = localStorage.getItem('pending_order_ids')
      if (saved) {
        try {
          state.pendingOrderIds = JSON.parse(saved)
        } catch (e) {
          state.pendingOrderIds = []
        }
      }
    }
  }
})

export const {
  setCart,
  setCartCount,
  incrementCartCount,
  clearCart,
  setSelectedItems,
  setPendingOrderIds,
  clearPendingOrderIds,
  setPaymentStatus,
  restorePendingOrderIds
} = cartSlice.actions

export default cartSlice.reducer