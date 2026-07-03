import { motion } from 'framer-motion'
import { FiFlag } from 'react-icons/fi'

export const ReportReasonCard = ({ reason }) => {
  if (!reason) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-amber-50 border border-amber-200 rounded-3xl p-6 shadow-sm"
    >
      <h3 className="text-lg font-black text-amber-700 flex items-center gap-2 mb-3">
        <FiFlag className="text-amber-600" /> Lý do báo cáo vi phạm
      </h3>
      <p className="text-amber-800 leading-relaxed">{reason}</p>
    </motion.div>
  )
}