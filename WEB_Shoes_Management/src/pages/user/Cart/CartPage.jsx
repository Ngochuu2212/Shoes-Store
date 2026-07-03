import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { cartApiService } from '~/services/user/cartService'
import { orderApiService } from '~/services/user/orderService'
import { orderTrackingApiService } from '~/services/user/orderTrackingApiService'
import {
  setCart,
  setCartCount,
  setSelectedItems,
  setPendingOrderIds,
  clearPendingOrderIds,
  restorePendingOrderIds
} from '~/redux/user/cartSlice'
import { toast } from 'react-toastify'
import { FiShoppingBag } from 'react-icons/fi'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import { CartItemList } from './CartItemList'
import { CheckoutForm } from './CheckoutForm'
import { CartSummary } from './CartSummary'
import { CartSystemVoucherPicker } from './CartSystemVoucherPicker'
import { ConfirmDeleteModal } from '~/components/common/ConfirmDeleteModal'
import { RecommendedProducts } from '~/components/user/RecommendedProducts'
import { usePageTitle } from '~/hooks/usePageTitle'

export const CartPage = () => {
  usePageTitle('Giỏ hàng', 'Xem và quản lý giỏ hàng của bạn tại Shoes Platform')
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const userInfo = useSelector((state) => state.user.userInfo)
  const cartItems = useSelector((state) => state.cart?.cartItems) || []
  const selectedItems = useSelector((state) => state.cart?.selectedItems) || []
  const pendingOrderIds = useSelector((state) => state.cart?.pendingOrderIds) || []

  const [paymentMethod, setPaymentMethod] = useState('COD')
  const [storeVouchers, setStoreVouchers] = useState({})
  const [systemVoucher, setSystemVoucher] = useState({ code: null, discountValue: 0 })
  const [loadingOrder, setLoadingOrder] = useState(false)
  const [isProcessingPaymentFailure, setIsProcessingPaymentFailure] = useState(false)

  // STATES QUẢN LÝ MODAL XÓA
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [pendingDeleteIds, setPendingDeleteIds] = useState([])

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      recipientName: userInfo?.fullname || '',
      recipientPhone: userInfo?.phone || '',
      shippingAddress: userInfo?.address || ''
    }
  })

  const fetchCartData = async () => {
    try {
      const data = await cartApiService.getCart()
      if (Array.isArray(data)) {
        dispatch(setCart(data))

        // Khôi phục selected items nếu có
        const savedSelected = JSON.parse(localStorage.getItem('selected_items') || '[]')
        if (savedSelected.length > 0) {
          const validSelected = savedSelected.filter(id =>
            data.some(item => item.variant_id === id)
          )
          dispatch(setSelectedItems(validSelected))
        }
      }
    } catch (err) {
      console.error('Lỗi fetch cart:', err)
    }
  }

  const handlePaymentFailure = async (orderIdsFromUrl = null) => {
    // Tránh gọi nhiều lần
    if (isProcessingPaymentFailure) return
    setIsProcessingPaymentFailure(true)

    try {
      // Ưu tiên orderIds từ URL, sau đó từ Redux, cuối cùng từ localStorage
      let orderIds = orderIdsFromUrl || pendingOrderIds || []

      if (!orderIds || orderIds.length === 0) {
        orderIds = JSON.parse(localStorage.getItem('pending_order_ids') || '[]')
      }

      if (orderIds.length > 0) {
        // Gọi API xóa đơn hàng pending
        await orderTrackingApiService.deletePendingOrders(orderIds)

        // Xóa pending order ids khỏi Redux và localStorage
        dispatch(clearPendingOrderIds())

        toast.warning('Thanh toán thất bại hoặc bị hủy. Vui lòng thử lại!')
      }

      // Xóa param khỏi URL
      window.history.replaceState({}, '', '/cart')

      // Refresh cart để đảm bảo dữ liệu chính xác
      await fetchCartData()
    } catch (error) {
      console.error('Lỗi xóa đơn hàng pending:', error)
      toast.error('Có lỗi xảy ra khi xử lý thanh toán thất bại. Vui lòng kiểm tra lại giỏ hàng.')
    } finally {
      setIsProcessingPaymentFailure(false)
    }
  }

  useEffect(() => {
    const paymentStatus = searchParams.get('payment')
    const paymentError = searchParams.get('error')
    const orderIdsFromUrl = searchParams.get('orderIds')

    // Khôi phục pending order ids từ localStorage
    dispatch(restorePendingOrderIds())

    // Xử lý lỗi hệ thống
    if (paymentStatus === 'error' || paymentError === 'error') {
      toast.error('Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại sau!')
      window.history.replaceState({}, '', '/cart')
      return
    }

    // Nếu thanh toán thất bại hoặc bị hủy
    if (paymentStatus === 'failed' || paymentError === 'failed') {
      let orderIds = []
      if (orderIdsFromUrl) {
        orderIds = orderIdsFromUrl.split(',').map(Number)
      }
      handlePaymentFailure(orderIds)
    }
  }, [searchParams])

  // Lưu selected items vào localStorage khi thay đổi
  useEffect(() => {
    if (selectedItems && Array.isArray(selectedItems)) {
      localStorage.setItem('selected_items', JSON.stringify(selectedItems))
    }
  }, [selectedItems])

  useEffect(() => {
    fetchCartData()
  }, [])

  const handleReloadAndScrollTop = () => {
    fetchCartData()
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  // ── Xóa 1 sản phẩm lẻ ──
  const handleRequestRemoveSingle = (variantId) => {
    setPendingDeleteIds([variantId])
    setIsDeleteModalOpen(true)
  }

  // ── Xóa hàng loạt sản phẩm ──
  const handleRequestRemoveSelectedBulk = () => {
    if (!selectedItems || selectedItems.length === 0) return
    setPendingDeleteIds(selectedItems)
    setIsDeleteModalOpen(true)
  }

  // ── Xác nhận xóa chính thức trên Modal ──
  const handleConfirmRemoveItemsSubmit = async () => {
    if (pendingDeleteIds.length === 0) return

    try {
      const res = await cartApiService.removeFromCart(pendingDeleteIds)

      if (res) {
        toast.success(pendingDeleteIds.length > 1 ? 'Đã xóa tất cả sản phẩm thành công!' : 'Đã gỡ sản phẩm khỏi giỏ.')

        // Cập nhật selected items - KIỂM TRA AN TOÀN
        const updatedSelected = Array.isArray(selectedItems)
          ? selectedItems.filter(id => !pendingDeleteIds.includes(id))
          : []
        dispatch(setSelectedItems(updatedSelected))

        setStoreVouchers(v => {
          const copy = { ...v }
          pendingDeleteIds.forEach(id => delete copy[id])
          return copy
        })

        fetchCartData()
      }
    } catch (error) {
      toast.error('Gặp lỗi khi xóa sản phẩm!')
    } finally {
      setIsDeleteModalOpen(false)
      setPendingDeleteIds([])
    }
  }

  // Xử lý Checkbox chọn hàng lẻ
  const handleToggleSelect = (variantId) => {
    const currentSelected = Array.isArray(selectedItems) ? selectedItems : []
    const isRemoving = currentSelected.includes(variantId)

    if (isRemoving) {
      setStoreVouchers(v => {
        const copy = { ...v }
        delete copy[variantId]
        return copy
      })
    }

    dispatch(setSelectedItems(
      isRemoving
        ? currentSelected.filter(id => id !== variantId)
        : [...currentSelected, variantId]
    ))
  }

  // Chọn toàn bộ giỏ hàng
  const handleToggleSelectAll = () => {
    const currentSelected = Array.isArray(selectedItems) ? selectedItems : []

    if (currentSelected.length === cartItems.length) {
      dispatch(setSelectedItems([]))
      setStoreVouchers({})
      setSystemVoucher({ code: null, discountValue: 0 })
    } else {
      dispatch(setSelectedItems(cartItems.map(item => item.variant_id)))
    }
  }

  const handleUpdateQuantity = async (variantId, newQty) => {
    const oldItem = cartItems.find(item => item.variant_id === variantId)
    const oldQty = oldItem?.cart_quantity || 1

    // Update UI ngay lập tức
    const updatedCart = cartItems.map(item =>
      item.variant_id === variantId
        ? { ...item, cart_quantity: newQty }
        : item
    )
    dispatch(setCart(updatedCart))

    try {
      await cartApiService.updateQuantity(variantId, newQty)
      // Cập nhật lại count
      const totalItems = updatedCart.reduce((sum, item) => sum + item.cart_quantity, 0)
      dispatch(setCartCount(totalItems))
    } catch (error) {
      // Rollback nếu lỗi
      dispatch(setCart(cartItems.map(item =>
        item.variant_id === variantId
          ? { ...item, cart_quantity: oldQty }
          : item
      )))
      toast.error(error.response?.data?.message || 'Lỗi cập nhật số lượng!')
    }
  }

  const handleStoreVoucherSelect = (storeId, code, discountValue) => {
    setStoreVouchers(prev => ({
      ...prev,
      [storeId]: { code, discountValue }
    }))
  }

  const handleSystemVoucherSelect = (code, discountValue) => {
    setSystemVoucher({ code, discountValue })
  }

  const safeSelectedItems = Array.isArray(selectedItems) ? selectedItems : []
  const safeCartItems = Array.isArray(cartItems) ? cartItems : []

  const selectedCartObjects = safeCartItems.filter(item =>
    safeSelectedItems.includes(item.variant_id)
  )

  const subTotal = selectedCartObjects.reduce((sum, item) => {
    return sum + (Number(item.base_price) * item.cart_quantity)
  }, 0)

  const storeDiscountAmount = selectedCartObjects.reduce((sum, item) => {
    const itemRowPrice = Number(item.base_price) * item.cart_quantity

    const backendPromoPercent = Number(item.discount_percentage || 0)
    const productItemDiscount = itemRowPrice * (backendPromoPercent / 100)

    const voucherRowPercent = storeVouchers[item.store_id]?.discountValue || 0
    const voucherRowDiscount = itemRowPrice * (voucherRowPercent / 100)

    return sum + productItemDiscount + voucherRowDiscount
  }, 0)

  const systemVoucherDiscountAmount = systemVoucher.code
    ? Math.round(subTotal * (systemVoucher.discountValue / 100))
    : 0

  const totalDiscountAmount = storeDiscountAmount + systemVoucherDiscountAmount

  const finalTotal = Math.max(0, subTotal - totalDiscountAmount)

  // XỬ LÝ ĐẶT HÀNG
  const handleCheckoutProcess = handleSubmit(async (formData) => {
    if (!safeSelectedItems || safeSelectedItems.length === 0) {
      toast.warning('Vui lòng tích chọn ít nhất một đôi giày để tiến hành thanh toán!')
      return
    }

    setLoadingOrder(true)

    const storeDiscounts = {}

    selectedCartObjects.forEach(item => {
      const storeId = item.store_id

      if (!storeDiscounts[storeId]) {
        storeDiscounts[storeId] = {
          amount: 0,
          code: storeVouchers[storeId]?.code || null
        }
      }

      const itemRowPrice = Number(item.base_price) * item.cart_quantity
      const backendPromoPercent = Number(item.discount_percentage || 0)
      const productItemDiscount = itemRowPrice * (backendPromoPercent / 100)

      const voucherRowPercent = storeVouchers[storeId]?.discountValue || 0
      const voucherRowDiscount = itemRowPrice * (voucherRowPercent / 100)

      storeDiscounts[storeId].amount += (productItemDiscount + voucherRowDiscount)
    })

    const orderPayload = {
      recipientName: formData.recipientName,
      recipientPhone: formData.recipientPhone,
      shippingAddress: formData.shippingAddress,
      discountAmount: totalDiscountAmount,
      paymentMethod: paymentMethod,
      storeDiscounts: storeDiscounts,
      systemDiscount: systemVoucher.code
        ? { code: systemVoucher.code, amount: systemVoucherDiscountAmount }
        : null
    }

    try {
      if (paymentMethod === 'COD') {
        const data = await orderApiService.createOrderCOD(orderPayload)

        if (data) {
          toast.success('Đặt hàng thành công! Đơn hàng của bạn đang được xử lý.')
          dispatch(setCartCount(0))

          const formattedOrderIds = data.orderIds && data.orderIds.length > 0
            ? `#${data.orderIds.join(', #')}`
            : '#ORD-UNKNOWN'

          const uniqueCategoryIds = [...new Set(selectedCartObjects.map(item => item.category_id))]
          const boughtProductIds = selectedCartObjects.map(item => item.product_id)

          navigate('/order-success', {
            state: {
              orderData: {
                orderId: formattedOrderIds,
                orderDate: new Date().toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' }),
                paymentMethod: 'Thanh toán khi nhận hàng (COD)'
              },
              categoryIds: uniqueCategoryIds,
              excludedIds: boughtProductIds
            }
          })
        }
      } else {
        const data = await orderApiService.createOrderOnline(orderPayload)

        if (data?.paymentUrl) {
          // Lưu orderIds vào Redux và localStorage
          if (data.orderIds) {
            dispatch(setPendingOrderIds(data.orderIds))
          }

          toast.info('Đang chuyển hướng sang cổng thanh toán an toàn...')
          window.location.href = data.paymentUrl
        } else {
          toast.error('Không nhận được đường dẫn thanh toán từ cổng điện tử.')
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi hệ thống trong quá trình đặt hàng!')
    } finally {
      setLoadingOrder(false)
    }
  })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  }

  const leftColumnVariants = {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  }

  const rightColumnVariants = {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  }

  const emptyStateVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 150, damping: 15 } }
  }

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg">

      <div className="py-8 w-full flex-1 flex flex-col">
        <main className="app-container flex-1">

          {/* ── Header Giỏ hàng ── */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="flex justify-between items-center mb-6"
          >
            <h2 className="text-xl font-extrabold text-brand-secondary uppercase tracking-tight flex items-center gap-2.5 after:content-[''] after:inline-block after:w-20 after:h-[5px] after:bg-brand-primary/60 after:rounded-full">
              <FiShoppingBag size={24} className="text-brand-primary shrink-0" />
              <span>Giỏ hàng của bạn ({safeCartItems.length} sản phẩm)</span>
            </h2>
          </motion.div>

          <AnimatePresence mode="wait">
            {safeCartItems.length === 0 ? (
              <motion.div
                key="empty-cart"
                variants={emptyStateVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className="text-center py-16 bg-white border border-gray-100 rounded-3xl shadow-sm max-w-xl mx-auto my-8"
              >
                <div className="w-16 h-16 bg-brand-primary/5 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-primary">
                  <FiShoppingBag size={32} />
                </div>

                <h3 className="text-base font-bold text-gray-800 mb-1">Giỏ hàng của bạn đang trống</h3>
                <p className="text-xs text-gray-400 italic max-w-xs mx-auto mb-6">
                  Có vẻ như bạn chưa thêm bất kỳ đôi giày nào vào giỏ hàng của mình.
                </p>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
                  <Link
                    to="/products"
                    className="inline-flex items-center gap-2 bg-brand-primary hover:bg-[#c73652] text-white text-sm font-bold px-6 py-3 rounded-xl transition-colors shadow-sm cursor-pointer"
                  >
                    <span>Mua sản phẩm ngay</span>
                  </Link>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="populated-cart"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start"
              >
                <motion.div variants={leftColumnVariants} className="lg:col-span-2">
                  <CartItemList
                    cartItems={safeCartItems}
                    selectedItems={safeSelectedItems}
                    onToggleSelect={handleToggleSelect}
                    onToggleSelectAll={handleToggleSelectAll}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemoveItem={handleRequestRemoveSingle}
                    handleRequestRemoveSelectedBulk={handleRequestRemoveSelectedBulk}
                    storeVouchers={storeVouchers}
                    onStoreVoucherSelect={handleStoreVoucherSelect}
                  />
                </motion.div>

                <motion.div variants={rightColumnVariants} className="space-y-6">
                  <CheckoutForm
                    register={register}
                    errors={errors}
                    paymentMethod={paymentMethod}
                    setPaymentMethod={setPaymentMethod}
                  />

                  {safeSelectedItems.length > 0 && (
                    <CartSystemVoucherPicker
                      orderTotal={subTotal}
                      onSelectVoucher={handleSystemVoucherSelect}
                      currentSelectedVoucher={systemVoucher.code}
                    />
                  )}

                  <CartSummary
                    subTotal={subTotal}
                    discountAmount={storeDiscountAmount}
                    systemDiscountAmount={systemVoucherDiscountAmount}
                    finalTotal={finalTotal}
                    hasSelectedItems={safeSelectedItems.length > 0}
                    onSubmitOrder={handleCheckoutProcess}
                    loadingOrder={loadingOrder}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sản phẩm gợi ý khi giỏ hàng trống */}
          {safeCartItems.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <RecommendedProducts
                type="empty-cart"
                limit={8}
                onAddToCartSuccess={handleReloadAndScrollTop}
              />
            </motion.div>
          )}

        </main>
      </div>

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        title={pendingDeleteIds.length > 1 ? 'Xóa hàng loạt sản phẩm' : 'Gỡ sản phẩm khỏi giỏ hàng'}
        message={pendingDeleteIds.length > 1
          ? `Bạn có chắc chắn muốn xóa hoàn toàn ${pendingDeleteIds.length} sản phẩm đang được tick chọn này ra khỏi giỏ hàng không?`
          : 'Hành động này sẽ xóa hoàn toàn sản phẩm và các mã giảm giá đang áp dụng của đôi giày này khỏi giỏ hàng hiện tại.'}
        productInfo={pendingDeleteIds.length === 1 ? safeCartItems.find(item => item.variant_id === pendingDeleteIds[0]) : null}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setPendingDeleteIds([])
        }}
        onConfirm={handleConfirmRemoveItemsSubmit}
      />
    </div>
  )
}