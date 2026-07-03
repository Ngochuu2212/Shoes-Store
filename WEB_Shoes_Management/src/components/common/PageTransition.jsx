import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Cấu hình các thông số trạng thái animation
const pageVariants = {
  initial: {
    opacity: 0,
    y: 12 // Trượt nhẹ từ dưới lên 12px
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4, // Chạy trong 0.4 giây
      ease: [0.25, 1, 0.5, 1] // Hàm chuyển động Bezier giúp hiệu ứng mượt như mỡ
    }
  },
  exit: {
    opacity: 0,
    y: -12 // Khi biến mất thì trượt nhẹ lên trên
  }
}

export const PageTransition = ({ children }) => {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }, [pathname])

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full flex flex-col min-h-screen"
    >
      {children}
    </motion.div>
  )
}