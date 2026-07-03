import { motion } from 'framer-motion'

export const NotificationSkeleton = () => {
  return (
    <div className="p-3 sm:p-4 space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.05 }}
          className="flex gap-3 p-3 rounded-xl bg-gray-50/50 mx-0.5 sm:mx-1"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gray-200 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="flex justify-between">
              <div className="w-24 sm:w-32 h-4 bg-gray-200 rounded animate-pulse" />
              <div className="w-12 sm:w-16 h-3 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="w-full h-3 bg-gray-200 rounded animate-pulse" />
            <div className="w-3/4 h-3 bg-gray-200 rounded animate-pulse" />
          </div>
        </motion.div>
      ))}
    </div>
  )
}