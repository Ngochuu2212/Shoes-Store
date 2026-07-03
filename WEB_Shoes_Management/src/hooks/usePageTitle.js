import { useEffect } from 'react'

export const usePageTitle = (title, description) => {
  useEffect(() => {
    const defaultTitle = 'Shoes Platform - Sàn thương mại điện tử giày dép đa người bán'
    const defaultDescription = 'Mua sắm giày dép chính hãng, đa dạng mẫu mã, giá tốt nhất tại Shoes Platform'

    // Cập nhật title
    document.title = title ? `${title} | Shoes Platform` : defaultTitle

    // Cập nhật meta description
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.content = description || defaultDescription
    } else {
      // Nếu chưa có meta description, tạo mới
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content = description || defaultDescription
      document.head.appendChild(meta)
    }
  }, [title, description])
}