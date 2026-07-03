import { motion } from 'framer-motion'
import { FiBox, FiGrid } from 'react-icons/fi'
import { CountUp } from '~/components/common/CountUp'

export const AttributeOverviewWidgets = ({ sizes, colors }) => {
  const items = [
    {
      title: 'Tổng kích cỡ',
      value: sizes?.length || 0,
      icon: FiBox,
      color: 'border-l-blue-500 text-blue-600',
      bg: 'from-blue-50/60 to-white',
      blob: 'bg-blue-100/50',
      delay: 0.1
    },
    {
      title: 'Tổng màu sắc',
      value: colors?.length || 0,
      icon: FiGrid,
      color: 'border-l-purple-500 text-purple-600',
      bg: 'from-purple-50/60 to-white',
      blob: 'bg-purple-100/50',
      delay: 0.15
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      {items.map((item, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            delay: item.delay,
            duration: 0.4,
            ease: 'easeOut',
            type: 'spring',
            stiffness: 300,
            damping: 20
          }}
          whileHover={{
            y: -4,
            scale: 1.02,
            boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
            transition: { duration: 0.2 }
          }}
          className={`relative ${item.bg} rounded-2xl border-l-4 ${item.color.split(' ')[0]} border-t border-b border-r border-gray-100 shadow-sm p-5 overflow-hidden group transition-all duration-300`}
        >
          <div className={`absolute -top-4 -right-4 w-16 h-16 rounded-full ${item.blob} blur-xl pointer-events-none`} />
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{item.title}</p>
            <motion.div
              whileHover={{ rotate: 12, scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              <item.icon size={16} className={item.color.split(' ')[1]} />
            </motion.div>
          </div>
          <h3 className="text-2xl font-black text-gray-800 mt-2">
            <CountUp value={item.value} />
          </h3>
        </motion.div>
      ))}
    </motion.div>
  )
}