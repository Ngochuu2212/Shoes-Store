import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion'
import { useRef, useEffect } from 'react'

export const CountUp = ({ value, duration = 1.5, suffix = '' }) => {
  const count = useMotionValue(0)

  // Định dạng số theo chuẩn Việt Nam (10.000.000) và cộng thêm hậu tố
  const rounded = useTransform(count, (v) =>
    Math.round(v).toLocaleString('vi-VN') + suffix
  )

  const ref = useRef(null)
  // Kích hoạt khi cuộn chuột màn hình tới vị trí component
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  useEffect(() => {
    if (!isInView) return

    // Xử lý bẫy lỗi ép kiểu nếu dữ liệu truyền vào là chuỗi thay vì số
    const end =
      typeof value === 'number'
        ? value
        : parseFloat(String(value).replace(/[^0-9.-]+/g, '')) || 0

    // Thực thi hiệu ứng chạy chữ mượt mà (Spring-like easing)
    animate(count, end, { duration, ease: [0.16, 1, 0.3, 1] })
  }, [isInView, value, count, duration])

  return <motion.span ref={ref}>{rounded}</motion.span>
}