import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiArrowDownCircle, FiArrowUpCircle, FiClock, FiRefreshCw, FiWifi, FiInfo } from 'react-icons/fi'
import { walletApiService } from '~/services/user/walletApiService'
import { formatPrice } from '~/utils/formatters'
import { toast } from 'react-toastify'

const PAGE_SIZE = 8

export const TabWallet = () => {
  const [walletData, setWalletData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  const fetchWallet = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const data = await walletApiService.getWallet(p, PAGE_SIZE)
      setWalletData(data)
      setPage(p)
    } catch {
      toast.error('Không tải được thông tin ví. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      try {
        const data = await walletApiService.getWallet(1, PAGE_SIZE)
        if (!cancelled) { setWalletData(data); setPage(1) }
      } catch { if (!cancelled) toast.error('Không tải được thông tin ví.') }
      finally { if (!cancelled) setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const balance = walletData?.balance || 0
  const transactions = walletData?.transactions || []
  const pagination = walletData?.pagination || {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-brand-secondary">Ví của tôi</h2>
        <button
          onClick={() => fetchWallet(page)}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-brand-primary transition-colors cursor-pointer"
        >
          <FiRefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-brand-primary to-[#c73652] rounded-2xl p-6 text-white shadow-lg"
      >
        <div className="flex items-center gap-2 mb-3 opacity-80">
          <FiWifi size={14} />
          <span className="text-xs font-semibold uppercase tracking-wider">Số dư ví hiện tại</span>
        </div>
        {loading && !walletData ? (
          <div className="h-10 bg-white/20 rounded-xl animate-pulse w-48" />
        ) : (
          <p className="text-3xl font-extrabold tracking-tight">{formatPrice(balance)}</p>
        )}
        <div className="mt-4 flex items-start gap-1.5 bg-white/10 rounded-xl p-3">
          <FiInfo size={13} className="shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed opacity-90">
            Số dư ví được hoàn vào khi đơn hàng <strong>đã thanh toán online</strong> bị hủy.
            Bạn có thể dùng ví để trả một phần hoặc toàn bộ đơn hàng tiếp theo.
          </p>
        </div>
      </motion.div>

      {/* Transaction History */}
      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <FiClock size={15} className="text-brand-primary" />
          Lịch sử giao dịch
          {pagination.totalItems > 0 && (
            <span className="text-[10px] text-gray-400 font-normal">({pagination.totalItems} giao dịch)</span>
          )}
        </h3>

        <AnimatePresence mode="wait">
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-gray-400"
            >
              <FiClock size={36} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">Chưa có giao dịch nào</p>
              <p className="text-xs mt-1 opacity-70">Lịch sử sẽ xuất hiện khi bạn dùng ví hoặc được hoàn tiền</p>
            </motion.div>
          ) : (
            <motion.div
              key={page}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-2"
            >
              {transactions.map((tx) => {
                const isRefund = tx.type === 'REFUND'
                return (
                  <div
                    key={tx.id}
                    className="flex items-center gap-3 p-3.5 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-shadow"
                  >
                    {/* Icon */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isRefund ? 'bg-green-50' : 'bg-red-50'}`}>
                      {isRefund
                        ? <FiArrowDownCircle size={18} className="text-green-500" />
                        : <FiArrowUpCircle size={18} className="text-red-400" />
                      }
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{tx.description || (isRefund ? 'Hoàn tiền' : 'Thanh toán')}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {new Date(tx.created_at).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        {tx.order_id && <span className="ml-1.5 text-brand-primary font-semibold">• ĐH #{tx.order_id}</span>}
                      </p>
                    </div>

                    {/* Amount */}
                    <p className={`text-sm font-extrabold shrink-0 ${isRefund ? 'text-green-600' : 'text-red-500'}`}>
                      {isRefund ? '+' : '-'}{formatPrice(tx.amount)}
                    </p>
                  </div>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-5">
            <button
              onClick={() => fetchWallet(page - 1)}
              disabled={page <= 1 || loading}
              className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Trước
            </button>
            <span className="text-xs text-gray-500">
              Trang {page} / {pagination.totalPages}
            </span>
            <button
              onClick={() => fetchWallet(page + 1)}
              disabled={page >= pagination.totalPages || loading}
              className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Tiếp
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
