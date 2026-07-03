import { FiCalendar } from 'react-icons/fi'

export const TimelineCard = ({ createdAt, updatedAt }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    const date = new Date(dateStr)
    return date.toLocaleString('vi-VN')
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
      <h3 className="text-lg font-black text-brand-secondary flex items-center gap-2 border-b border-gray-50 pb-3 mb-4">
        <FiCalendar className="text-brand-primary" /> Thời gian
      </h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
          <span className="text-sm font-semibold text-gray-600">Ngày đánh giá</span>
          <span className="text-sm font-bold text-gray-800">{formatDate(createdAt)}</span>
        </div>
        {updatedAt && updatedAt !== createdAt && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <span className="text-sm font-semibold text-gray-600">Cập nhật lần cuối</span>
            <span className="text-sm font-bold text-gray-800">{formatDate(updatedAt)}</span>
          </div>
        )}
      </div>
    </div>
  )
}