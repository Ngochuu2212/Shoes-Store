import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Pagination } from '~/components/common/Pagination'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '~/components/ui/tabs'
import { orderTrackingApiService } from '~/services/user/orderTrackingApiService'
import { toast } from 'react-toastify'
import { OrderCard } from './OrderCard'
import { CancelOrderModal } from './CancelOrderModal'
import { WithdrawCancelModal } from './WithdrawCancelModal'
import { ORDER_STATUS } from '~/utils/constant'
import { FiGrid, FiFileText,
  FiPackage, FiTruck,
  FiCheckCircle, FiXCircle,
  FiAlertCircle, FiInbox
} from 'react-icons/fi'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { usePageTitle } from '~/hooks/usePageTitle'

export const OrderTrackingPage = () => {
  usePageTitle('Theo dõi đơn hàng', 'Quản lý và theo dõi trạng thái đơn hàng của bạn')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()
  const currentTabFromUrl = searchParams.get('tab') || 'all'
  const [currentTab, setCurrentTab] = useState(currentTabFromUrl)
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, limit: 5 })
  const [statusCounts, setStatusCounts] = useState({})

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [selectedOrderForCancel, setSelectedOrderForCancel] = useState(null)
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false)
  const [selectedOrderForWithdraw, setSelectedOrderForWithdraw] = useState(null)

  const navigate = useNavigate()

  const fetchOrders = async (page = 1, status = 'all') => {
    setLoading(true)
    try {
      const res = await orderTrackingApiService.getOrderHistory(page, pagination.limit, status)
      setOrders(res.orders)
      setPagination(res.pagination)
      setStatusCounts(res.statusCounts || {})
    } catch (error) {
      toast.error('Gặp lỗi khi tải lịch sử đơn hàng.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Đồng bộ tab từ URL khi component mount
    const tabFromUrl = searchParams.get('tab') || 'all'
    if (tabFromUrl !== currentTab) {
      setCurrentTab(tabFromUrl)
    }
  }, [searchParams])

  useEffect(() => {
    fetchOrders(pagination.currentPage, currentTab)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [pagination.currentPage, currentTab])

  const handleTabChange = (value) => {
    setCurrentTab(value)
    setSearchParams({ tab: value })
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  const handleConfirmCancel = async (orderId, reason) => {
    setIsCancelModalOpen(false)
    try {
      const res = await orderTrackingApiService.cancelOrder(orderId, reason)
      toast.success(res.message)
      fetchOrders(pagination.currentPage, currentTab)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi hủy đơn.')
    }
    setSelectedOrderForCancel(null)
  }

  const triggerCancelModal = (order) => {
    setSelectedOrderForCancel(order)
    setIsCancelModalOpen(true)
  }

  const triggerWithdrawModal = (order) => {
    setSelectedOrderForWithdraw(order)
    setIsWithdrawModalOpen(true)
  }

  const handleConfirmWithdraw = async (orderId) => {
    setIsWithdrawModalOpen(false)
    try {
      const res = await orderTrackingApiService.withdrawCancelRequest(orderId)
      toast.success(res.message)
      fetchOrders()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi rút yêu cầu.')
    }
  }

  const handleNavigateToReview = (order) => {
    navigate(`/orders/${order.order_id}/review`)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 15 } }
  }

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      <main className="flex-1 w-full max-w-5xl mx-auto pt-8 px-4">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ease: 'anticipate', duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-extrabold text-brand-secondary flex items-center gap-3 after:content-[''] after:inline-block after:w-20 after:h-[5px] after:bg-brand-primary/60 after:rounded-full">
            <FiPackage size={28} className="text-brand-primary" />
                Theo dõi đơn hàng
          </h1>
          <p className="text-sm text-gray-500 mt-2">Quản lý và xem lộ trình vận chuyển các đơn hàng của bạn.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease: 'circOut', duration: 0.5, delay: 0.1 }}
        >
          <Tabs defaultValue="all" value={currentTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="w-full flex overflow-x-auto justify-start lg:justify-between items-center bg-white px-3 py-8 gap-1.5 rounded-2xl shadow-sm mb-6 border border-gray-100 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <TabsTrigger value="all" className="flex-1 py-3.5 px-4 text-sm font-medium text-gray-500 rounded-xl hover:text-brand-primary hover:bg-gray-50/80 data-[state=active]:bg-brand-primary/10 data-[state=active]:text-brand-primary data-[state=active]:font-bold transition-all duration-300 ease-in-out active:scale-95 cursor-pointer">
                <div className="flex items-center justify-center gap-2">
                  <FiGrid size={16} />
                  <span>Tất cả</span>
                  {statusCounts?.all > 0 && <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-[10px] font-bold">{statusCounts.all}</span>}
                </div>
              </TabsTrigger>

              <TabsTrigger value={ORDER_STATUS.PENDING} className="flex-1 py-3.5 px-4 text-sm font-medium text-gray-500 rounded-xl hover:text-brand-primary hover:bg-gray-50/80 data-[state=active]:bg-brand-primary/10 data-[state=active]:text-brand-primary data-[state=active]:font-bold transition-all duration-300 ease-in-out active:scale-95 cursor-pointer">
                <div className="flex items-center justify-center gap-2">
                  <FiFileText size={16} />
                  <span>Đơn hàng mới</span>
                  {statusCounts?.pending > 0 && <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-[10px] font-bold">{statusCounts.pending}</span>}
                </div>
              </TabsTrigger>

              <TabsTrigger value={ORDER_STATUS.PROCESSING} className="flex-1 py-3.5 px-4 text-sm font-medium text-gray-500 rounded-xl hover:text-brand-primary hover:bg-gray-50/80 data-[state=active]:bg-brand-primary/10 data-[state=active]:text-brand-primary data-[state=active]:font-bold transition-all duration-300 ease-in-out active:scale-95 cursor-pointer">
                <div className="flex items-center justify-center gap-2">
                  <FiPackage size={16} />
                  <span>Đang xử lý</span>
                  {statusCounts?.processing > 0 && <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full text-[10px] font-bold">{statusCounts.processing}</span>}
                </div>
              </TabsTrigger>

              <TabsTrigger value={ORDER_STATUS.SHIPPING} className="flex-1 py-3.5 px-4 text-sm font-medium text-gray-500 rounded-xl hover:text-brand-primary hover:bg-gray-50/80 data-[state=active]:bg-brand-primary/10 data-[state=active]:text-brand-primary data-[state=active]:font-bold transition-all duration-300 ease-in-out active:scale-95 cursor-pointer">
                <div className="flex items-center justify-center gap-2">
                  <FiTruck size={16} />
                  <span>Đang giao</span>
                  {statusCounts?.shipping > 0 && <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full text-[10px] font-bold">{statusCounts.shipping}</span>}
                </div>
              </TabsTrigger>

              <TabsTrigger value={ORDER_STATUS.COMPLETED} className="flex-1 py-3.5 px-4 text-sm font-medium text-gray-500 rounded-xl hover:text-brand-primary hover:bg-gray-50/80 data-[state=active]:bg-brand-primary/10 data-[state=active]:text-brand-primary data-[state=active]:font-bold transition-all duration-300 ease-in-out active:scale-95 cursor-pointer">
                <div className="flex items-center justify-center gap-2">
                  <FiCheckCircle size={16} />
                  <span>Đã giao</span>
                  {statusCounts?.completed > 0 && <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded-full text-[10px] font-bold">{statusCounts.completed}</span>}
                </div>
              </TabsTrigger>

              <TabsTrigger value={ORDER_STATUS.CANCELLED} className="flex-1 py-3.5 px-4 text-sm font-medium text-gray-500 rounded-xl hover:text-brand-primary hover:bg-gray-50/80 data-[state=active]:bg-brand-primary/10 data-[state=active]:text-brand-primary data-[state=active]:font-bold transition-all duration-300 ease-in-out active:scale-95 cursor-pointer">
                <div className="flex items-center justify-center gap-2">
                  <FiXCircle size={16} />
                  <span>Đã hủy</span>
                  {statusCounts?.cancelled > 0 && <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-[10px] font-bold">{statusCounts.cancelled}</span>}
                </div>
              </TabsTrigger>

              <TabsTrigger value={ORDER_STATUS.CANCEL_REQUESTED} className="flex-1 py-3.5 px-4 text-sm font-medium text-gray-500 rounded-xl hover:text-brand-primary hover:bg-gray-50/80 data-[state=active]:bg-brand-primary/10 data-[state=active]:text-brand-primary data-[state=active]:font-bold transition-all duration-300 ease-in-out active:scale-95 cursor-pointer">
                <div className="flex items-center justify-center gap-2">
                  <FiAlertCircle size={16} />
                  <span>Yêu cầu hủy</span>
                  {statusCounts?.cancel_requested > 0 && <span className="bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full text-[10px] font-bold">{statusCounts.cancel_requested}</span>}
                </div>
              </TabsTrigger>
            </TabsList>

            <TabsContent value={currentTab} className="mt-0 outline-none">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTab + (loading ? '-loading' : '-loaded')} // Reset animation khi trạng thái thay đổi
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
                >
                  {loading ? (
                    <div className="flex justify-center py-20">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full"
                      />
                    </div>
                  ) : orders.length === 0 ? (
                    <motion.div
                      variants={cardVariants}
                      className="text-center py-20 mb-8 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center"
                    >
                      <div className="w-20 h-20 ring ring-brand-primary bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <FiInbox size={40} className="text-brand-primary" />
                      </div>
                      <p className="text-gray-500 font-medium">Chưa có đơn hàng nào ở trạng thái này.</p>
                    </motion.div>
                  ) : (
                    <>
                      {orders.map((order) => (
                        <motion.div key={order.order_id} variants={cardVariants}>
                          <OrderCard
                            order={order}
                            onReviewOrder={handleNavigateToReview}
                            onCancelOrder={() => triggerCancelModal(order)}
                            onWithdrawCancel={() => triggerWithdrawModal(order)}
                          />
                        </motion.div>
                      ))}

                      {/* Phân trang */}
                      {pagination.totalPages > 1 && (
                        <motion.div variants={cardVariants} className="mt-8 flex justify-center">
                          <Pagination
                            currentPage={pagination.currentPage}
                            totalPages={pagination.totalPages}
                            onPageChange={(page) => setPagination(prev => ({ ...prev, currentPage: page }))}
                          />
                        </motion.div>
                      )}
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </TabsContent>
          </Tabs>
        </motion.div>

      </main>

      <CancelOrderModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        order={selectedOrderForCancel}
        onConfirm={handleConfirmCancel}
      />

      <WithdrawCancelModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        order={selectedOrderForWithdraw}
        onConfirm={handleConfirmWithdraw}
      />
    </div>
  )
}