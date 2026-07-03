export const formatPrice = (price) => {
  if (!price) return 'Liên hệ'
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(parseFloat(price))
}

export const formatSold = (sold) => {
  if (sold >= 1000) return (sold / 1000).toFixed(1) + 'k'
  return sold
}

export const formatReview = (num) => {
  if (!num) return '0'
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}

export const calculateFinalPrice = (price, discountPercentage) => {
  const priceNum = Number(price) || 0
  const discountNum = Number(discountPercentage) || 0

  if (discountNum > 0) {
    return priceNum - (priceNum * discountNum / 100)
  }

  return priceNum
}

export const formatTime = (seconds) => {
  return `00:${seconds < 10 ? `0${seconds}` : seconds}`
}

export const getImageUrl = (imageField, placeholder) => {
  if (!imageField) return placeholder

  let target = imageField

  // 1. Nếu là chuỗi Văn bản (String JSON), tiến hành parse ra trước
  if (typeof imageField === 'string') {
    try {
      target = JSON.parse(imageField)
    } catch {
      return placeholder
    }
  }

  // 2. Nếu sau khi parse (hoặc bản chất ban đầu) là Mảng (Array) -> Bốc phần tử đầu tiên
  if (Array.isArray(target)) {
    if (target.length === 0) return placeholder
    target = target[0]
  }

  // 3. Trích xuất secure_url từ Object cuối cùng
  return target?.secure_url || placeholder
}

export const getFirstVariantImage = (product, placeholder = 'https://placehold.co/100x100?text=No+Image') => {
  if (!product) return placeholder

  // Nếu product có variants và là array
  if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
    for (const variant of product.variants) {
      if (variant.image) {
        try {
          let imageData = variant.image
          if (typeof variant.image === 'string') {
            imageData = JSON.parse(variant.image)
          }
          if (imageData && imageData.secure_url) {
            return imageData.secure_url
          }
        } catch (e) {
          continue
        }
      }
    }
  }
  return placeholder
}


export const getVariantImageUrl = (variant, placeholder = null) => {
  if (!variant) return placeholder

  // Nếu variant có image
  if (variant.image) {
    try {
      let imageData = variant.image

      // Nếu là string JSON thì parse
      if (typeof variant.image === 'string') {
        imageData = JSON.parse(variant.image)
      }

      // Nếu có secure_url thì trả về
      if (imageData && imageData.secure_url) {
        return imageData.secure_url
      }
    } catch (e) {
      console.error('Lỗi parse ảnh variant:', e)
      return placeholder
    }
  }

  return placeholder
}

export const getOrderItemImage = (item, placeholder = 'https://placehold.co/100x100?text=Product') => {
  if (!item) return placeholder

  if (item.variant_image) {
    // Nếu variant_image đã là object có secure_url
    if (item.variant_image.secure_url) {
      return item.variant_image.secure_url
    }
    // Nếu variant_image là string JSON
    if (typeof item.variant_image === 'string') {
      try {
        const parsed = JSON.parse(item.variant_image)
        if (parsed && parsed.secure_url) {
          return parsed.secure_url
        }
      } catch (e) {
        // Bỏ qua
      }
    }
  }

  if (item.product_images && Array.isArray(item.product_images) && item.product_images.length > 0) {
    const firstImage = item.product_images[0]
    if (firstImage && firstImage.secure_url) {
      return firstImage.secure_url
    }
  }

  if (item.images && Array.isArray(item.images) && item.images.length > 0) {
    const firstImage = item.images[0]
    if (firstImage && firstImage.secure_url) {
      return firstImage.secure_url
    }
  }

  if (item.product_images && typeof item.product_images === 'string') {
    try {
      const parsed = JSON.parse(item.product_images)
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].secure_url) {
        return parsed[0].secure_url
      }
    } catch (e) {
      // Bỏ qua
    }
  }

  return placeholder
}

export const getReviewImage = (review, placeholder = 'https://placehold.co/100x100?text=Product') => {
  if (!review) return placeholder

  // Nếu review có variants (từ product)
  if (review.variants && Array.isArray(review.variants) && review.variants.length > 0) {
    for (const variant of review.variants) {
      if (variant.image) {
        try {
          let imageData = variant.image
          if (typeof variant.image === 'string') {
            imageData = JSON.parse(variant.image)
          }
          if (imageData && imageData.secure_url) {
            return imageData.secure_url
          }
        } catch (e) {
          continue
        }
      }
    }
  }

  // Fallback sang product_images
  if (review.product_images) {
    return getImageUrl(review.product_images, placeholder)
  }

  return placeholder
}


export const formatLastActive = (lastActive) => {
  if (!lastActive) return 'Không hoạt động'

  const now = new Date()
  const lastActiveDate = new Date(lastActive)
  const diffMs = now - lastActiveDate
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Vài giây trước'
  if (diffMins < 60) return `${diffMins} phút trước`
  if (diffHours < 24) return `${diffHours} giờ trước`
  return `${diffDays} ngày trước`
}

export const formatMessageTime = (timestamp) => {
  if (!timestamp) return ''

  const date = new Date(timestamp)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  const diffDays = Math.floor((today - msgDate) / 86400000)

  if (diffDays === 0) {
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  } else if (diffDays === 1) {
    return `Hôm qua lúc ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
  } else if (diffDays < 7) {
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
    return `${days[date.getDay()]} lúc ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
  } else {
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
           ` lúc ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
  }
}

export const formatRelativeTime = (timestamp) => {
  if (!timestamp) return ''

  const now = new Date()
  const date = new Date(timestamp)
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Vừa xong'
  if (diffMins < 60) return `${diffMins} phút`
  if (diffHours < 24) return `${diffHours} giờ`
  return `${diffDays} ngày`
}

export const shouldShowTimeDivider = (prevTime, currentTime) => {
  if (!prevTime || !currentTime) return true

  const prevDate = new Date(prevTime)
  const currentDate = new Date(currentTime)
  const diffMins = Math.abs(currentDate - prevDate) / 60000

  return diffMins >= 30
}

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// Định dạng ngày tháng (dd/mm/yyyy)
export const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Định dạng giờ (hh:mm:ss)
export const formatTimeOnly = (dateStr) => {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  return date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}