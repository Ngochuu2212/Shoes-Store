import { vendorProductModel } from '~/models/vendor/product/vendorProductModel'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'
import { userModel } from '~/models/user/userModel'
import { notificationService } from '~/services/notification/notificationService'
import { PRODUCT_MODERATION_STATUS, NOTIFICATION_TYPES } from '~/utils/constants'
import slugify from 'slugify'

// Trả về Object Store
const getVerifiedStore = async (userId) => {
  const store = await vendorProductModel.getStoreByOwnerId(userId)
  if (!store) throw new Error('Tài khoản chưa đăng ký cửa hàng trên hệ thống.')
  if (!store.is_active) throw new Error('Cửa hàng hiện đang chờ phê duyệt hoặc đã bị khóa.')
  return store
}

// Thêm sản phẩm mới
const createProduct = async (userId, productData) => {
  const store = await getVerifiedStore(userId)

  const baseSlug = slugify(productData.name, { replacement: '-', remove: /[*+~.()'"!:@]/g, lower: true, locale: 'vi', trim: true })
  const slug = `${baseSlug}-${Date.now()}`

  const result = await vendorProductModel.createProduct({
    storeId: store.id,
    categoryId: productData.categoryId,
    name: productData.name,
    slug,
    description: productData.description,
    price: productData.price
  })

  const managerIds = await userModel.getAllManagerIds()
  for (const managerId of managerIds) {
    await notificationService.createAndPushNotification({
      userId: managerId,
      title: 'Yêu cầu kiểm duyệt sản phẩm mới',
      content: JSON.stringify({
        message: `Gian hàng "${store.store_name}" vừa thêm sản phẩm: ${productData.name}`,
        image: '',
        storeName: store.store_name,
        productName: productData.name
      }),
      type: NOTIFICATION_TYPES.PRODUCT_PENDING,
      referenceId: result.insertId
    }).catch(err => console.error('Lỗi gửi thông báo:', err))
  }

  return {
    message: 'Đăng ký sản phẩm thành công! Vui lòng chờ Điều hành viên sàn phê duyệt hiển thị.',
    insertId: result.insertId
  }
}

// Chỉnh sửa thông tin sản phẩm
const updateProduct = async (userId, productId, updateData) => {
  const store = await getVerifiedStore(userId)
  const isOwner = await vendorProductModel.checkProductOwnership(productId, store.id)
  if (!isOwner) throw new Error('Bạn không có quyền chỉnh sửa sản phẩm này.')

  const currentProduct = await vendorProductModel.getProductDetailWithVariants(productId, store.id)
  const wasApproved = currentProduct?.status === PRODUCT_MODERATION_STATUS.APPROVED

  await vendorProductModel.updateProduct(productId, {
    categoryId: updateData.categoryId,
    name: updateData.name,
    description: updateData.description,
    price: updateData.price
  })

  if (wasApproved) {
    await vendorProductModel.updateProductStatus(productId, PRODUCT_MODERATION_STATUS.PENDING_REAPPROVAL)

    let thumbnail = ''
    try {
      // Lấy variants của product
      const variants = currentProduct?.variants || []

      // Tìm variant đầu tiên có ảnh
      const variantWithImage = variants.find(v => v.image)

      if (variantWithImage && variantWithImage.image) {
        // Parse image nếu là string JSON
        const imageData = typeof variantWithImage.image === 'string'
          ? JSON.parse(variantWithImage.image)
          : variantWithImage.image

        if (imageData && imageData.secure_url) {
          thumbnail = imageData.secure_url
        }
      }
    } catch (e) {
      thumbnail = ''
    }

    const managerIds = await userModel.getAllManagerIds()
    for (const managerId of managerIds) {
      await notificationService.createAndPushNotification({
        userId: managerId,
        title: 'Yêu cầu kiểm duyệt lại sản phẩm',
        content: JSON.stringify({
          message: `Gian hàng "${store.store_name}" vừa chỉnh sửa sản phẩm: ${currentProduct.name}. Vui lòng kiểm duyệt lại.`,
          image: thumbnail,
          productId: productId,
          productName: currentProduct.name
        }),
        type: NOTIFICATION_TYPES.PRODUCT_REAPPROVAL,
        referenceId: productId
      }).catch(err => console.error('Lỗi gửi thông báo kiểm duyệt lại:', err))
    }
  }

  return { message: 'Cập nhật sản phẩm thành công! Mặt hàng đã được chuyển về hàng chờ kiểm duyệt lại.' }
}

// Xóa cứng sản phẩm
const deleteProduct = async (userId, productId) => {
  const store = await getVerifiedStore(userId)
  const isOwner = await vendorProductModel.checkProductOwnership(productId, store.id)
  if (!isOwner) {
    throw new Error('Bạn không có quyền xóa sản phẩm này.')
  }

  const product = await vendorProductModel.getProductImages(productId)

  if (product && product.images) {
    try {
      const trimmedImages = product.images.trim()
      if (trimmedImages && trimmedImages !== '[]' && trimmedImages !== 'null') {
        const imagesArray = JSON.parse(trimmedImages)
        for (const img of imagesArray) {
          if (img && img.public_id) {
            await CloudinaryProvider.cloudinary.uploader.destroy(img.public_id)
          }
        }
      }
    } catch (cloudinaryError) {
      console.error('Cảnh báo lỗi format ảnh:', cloudinaryError.message)
    }
  }

  await vendorProductModel.hardDeleteProduct(productId)
  return { message: 'Xóa sản phẩm thành công.' }
}

const createVariant = async (userId, productId, variantData) => {
  const store = await getVerifiedStore(userId)
  const isOwner = await vendorProductModel.checkProductOwnership(productId, store.id)
  if (!isOwner) throw new Error('Bạn không có quyền tạo biến thể cho sản phẩm này.')

  // 1. Tạo variant
  await vendorProductModel.createVariant({
    productId,
    size: variantData.size,
    color: variantData.color,
    stock: variantData.stock,
    image: variantData.image
  })

  // 2. Nếu có ảnh variant, thêm vào product.images
  if (variantData.image) {
    await vendorProductModel.addImageToProduct(productId, variantData.image)
  }

  return { message: 'Thêm biến thể kho hàng thành công.' }
}

const updateVariant = async (userId, productId, variantId, variantData) => {
  const store = await getVerifiedStore(userId)
  const isOwner = await vendorProductModel.checkProductOwnership(productId, store.id)
  if (!isOwner) throw new Error('Bạn không có quyền sửa biến thể của sản phẩm này.')

  // 1. Cập nhật variant
  const updated = await vendorProductModel.updateVariant(variantId, {
    size: variantData.size,
    color: variantData.color,
    stock: variantData.stock,
    image: variantData.image // Có thể là object, null, hoặc undefined
  })

  if (updated === 0) throw new Error('Không tìm thấy biến thể hoặc không có thay đổi.')

  // 2. Nếu có ảnh mới -> thêm vào product.images
  if (variantData.image && typeof variantData.image === 'object') {
    await vendorProductModel.addImageToProduct(productId, variantData.image)
  }

  return { message: 'Cập nhật biến thể thành công.' }
}

const deleteVariant = async (userId, productId, variantId) => {
  const store = await getVerifiedStore(userId)
  const isOwner = await vendorProductModel.checkProductOwnership(productId, store.id)
  if (!isOwner) throw new Error('Bạn không có quyền xóa biến thể của sản phẩm này.')

  // 1. Lấy variant để biết ảnh
  const variant = await vendorProductModel.getVariantById(variantId)
  if (!variant) throw new Error('Biến thể không tồn tại.')

  // 2. Kiểm tra biến thể có trong giỏ hàng không
  const inCart = await vendorProductModel.checkVariantInCart(variantId)
  if (inCart) {
    throw new Error('Biến thể đang có trong giỏ hàng của khách, không thể xóa. Hãy ẩn thay vì xóa.')
  }

  // 3. Xóa variant
  await vendorProductModel.deleteVariant(variantId)

  // 4. Nếu có ảnh, kiểm tra xem còn variant nào dùng ảnh này không
  if (variant.image) {
    const hasOtherVariant = await vendorProductModel.checkImageUsedByOtherVariant(productId, variant.image, variantId)
    if (!hasOtherVariant) {
      // Không còn variant nào dùng -> xóa khỏi product.images
      await vendorProductModel.removeImageFromProduct(productId, variant.image)
    }
  }

  return { message: 'Xóa biến thể thành công.' }
}

// Lấy danh sách biến thể
const getVariantsByProductId = async (userId, productId) => {
  const store = await getVerifiedStore(userId)
  const isOwner = await vendorProductModel.checkProductOwnership(productId, store.id)
  if (!isOwner) throw new Error('Sản phẩm không thuộc quyền sở hữu của cửa hàng.')

  const variants = await vendorProductModel.getVariantsByProductId(productId)
  return { variants }
}

// Lấy danh sách sản phẩm
const getVendorProducts = async (userId, filters) => {
  const store = await getVerifiedStore(userId)
  const storeId = store.id

  const page = Number(filters.page) || 1
  const limit = Number(filters.limit) || 10
  const offset = (page - 1) * limit

  const filterParams = {
    search: filters.search || null,
    categoryId: filters.categoryId || null,
    isActive: filters.isActive !== undefined ? filters.isActive : null,
    minPrice: filters.minPrice || null,
    maxPrice: filters.maxPrice || null,
    sortBy: filters.sortBy || 'ctime',
    limit,
    offset
  }

  const [products, totalItems, overviewStats] = await Promise.all([
    vendorProductModel.getVendorProductsWithFilters(storeId, filterParams),
    vendorProductModel.countVendorProductsWithFilters(storeId, filterParams),
    vendorProductModel.getProductsOverviewStats(storeId)
  ])

  return {
    overview: overviewStats,
    pagination: {
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      limit
    },
    products
  }
}

// Lấy chi tiết sản phẩm
const getProductDetail = async (userId, productId) => {
  const store = await getVerifiedStore(userId)
  const productDetail = await vendorProductModel.getProductDetailWithVariants(productId, store.id)
  if (!productDetail) throw new Error('Sản phẩm không tồn tại hoặc không thuộc quyền sở hữu của cửa hàng.')
  return productDetail
}

// Bật/Tắt trạng thái hoạt động hàng loạt
const toggleProductsActiveBulk = async (userId, productIds, isActive) => {
  const store = await getVerifiedStore(userId)
  const storeId = store.id

  const isAllOwner = await vendorProductModel.checkMultipleProductsOwnership(productIds, storeId)
  if (!isAllOwner) throw new Error('Danh sách sản phẩm chứa mã không thuộc quyền sở hữu của cửa hàng bạn.')

  const affectedRows = await vendorProductModel.updateProductsStatusBulk(productIds, Number(isActive), storeId)

  if (affectedRows < productIds.length) {
    if (isActive) {
      throw new Error(
        'Không thể tự kích hoạt lại hoạt động! Trong danh sách có sản phẩm chưa được duyệt (Pending) hoặc đã bị khóa (Banned). Bạn phải gửi yêu cầu gỡ phạt để được cứu xét.'
      )
    }
  }
  return {
    message: isActive
      ? `Đã mở bán lại thành công ${affectedRows} sản phẩm đã chọn.`
      : `Đã tạm ẩn hiển thị thành công ${affectedRows} sản phẩm đã chọn.`
  }
}

// Xóa cứng hàng loạt sản phẩm
const deleteProductsBulk = async (userId, productIds) => {
  const store = await getVerifiedStore(userId)
  const storeId = store.id

  const isAllOwner = await vendorProductModel.checkMultipleProductsOwnership(productIds, storeId)
  if (!isAllOwner) {
    throw new Error('Danh sách sản phẩm chứa mã không thuộc quyền sở hữu của cửa hàng bạn.')
  }

  const productsImageList = await vendorProductModel.getMultipleProductImages(productIds, storeId)

  for (const p of productsImageList) {
    if (p && p.images) {
      try {
        const trimmedImages = p.images.trim()
        if (trimmedImages && trimmedImages !== '[]' && trimmedImages !== 'null') {
          const imagesArray = JSON.parse(trimmedImages)
          for (const img of imagesArray) {
            if (img && img.public_id) {
              await CloudinaryProvider.cloudinary.uploader.destroy(img.public_id)
            }
          }
        }
      } catch (err) {
        console.error('Lỗi dọn ảnh bulk (Bỏ qua để xóa DB):', err.message)
      }
    }
  }

  const affectedRows = await vendorProductModel.hardDeleteProductsBulk(productIds, storeId)
  return { message: `Đã xóa hoàn toàn dữ liệu của ${affectedRows} sản phẩm thành công.` }
}

const toggleProductActiveSingle = async (userId, productId, isActive) => {
  return await toggleProductsActiveBulk(userId, [Number(productId)], isActive)
}

const requestProductsReapprovalBulk = async (userId, productIds) => {
  const store = await vendorProductModel.getStoreByOwnerId(userId)
  if (!store) throw new Error('Cửa hàng không tồn tại trên hệ thống.')
  if (!Array.isArray(productIds) || productIds.length === 0) throw new Error('Danh sách ID không hợp lệ.')

  const isAllOwner = await vendorProductModel.checkMultipleProductsOwnership(productIds, store.id)
  if (!isAllOwner) throw new Error('Danh sách chứa sản phẩm không thuộc quyền quản lý của shop.')

  const affectedRows = await vendorProductModel.requestProductsReapprovalBulk(productIds, store.id)
  if (affectedRows === 0) throw new Error('Gửi yêu cầu thất bại. Chỉ có sản phẩm đang bị khóa (BANNED) mới có thể gửi yêu cầu giải trình.')

  let productNames = []
  for (const productId of productIds) {
    const product = await vendorProductModel.getProductDetailWithVariants(productId, store.id)
    if (product) productNames.push(product.name)
  }

  const managerIds = await userModel.getAllManagerIds()

  for (const managerId of managerIds) {
    await notificationService.createAndPushNotification({
      userId: managerId,
      title: 'Yêu cầu giải trình cứu xét sản phẩm',
      content: JSON.stringify({
        message: `Gian hàng "${store.store_name}" vừa gửi yêu cầu duyệt lại ${affectedRows} sản phẩm bị vi phạm: ${productNames.join(', ')}`,
        image: '',
        storeName: store.store_name,
        productCount: affectedRows,
        productNames: productNames
      }),
      type: NOTIFICATION_TYPES.PRODUCT_REAPPROVAL,
      referenceId: productIds[0]
    }).catch(err => console.error('Lỗi gửi thông báo:', err))
  }

  return { message: `Đã gửi yêu cầu phê duyệt lại thành công cho ${affectedRows} sản phẩm.` }
}

export const vendorProductService = {
  createProduct,
  updateProduct,
  deleteProduct,
  createVariant,
  updateVariant,
  deleteVariant,
  getVariantsByProductId,
  getVendorProducts,
  getProductDetail,
  toggleProductsActiveBulk,
  deleteProductsBulk,
  toggleProductActiveSingle,
  requestProductsReapprovalBulk
}