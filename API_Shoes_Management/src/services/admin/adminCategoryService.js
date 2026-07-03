import { adminCategoryModel } from '~/models/admin/category/adminCategoryModel'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'
import slugify from 'slugify'

const generateCustomSlug = (text) => {
  return slugify(text, {
    replacement: '-',
    remove: /[*+~.()'"!:@]/g,
    lower: true,
    strict: true,
    locale: 'vi'
  })
}

// Thuật toán đệ quy: Biến mảng phẳng thành cấu trúc cây danh mục đa cấp lồng nhau
const buildCategoryTree = (flatCategories, parentId = null) => {
  const branch = []

  flatCategories.forEach(category => {
    if (category.parent_id === parentId) {
      const children = buildCategoryTree(flatCategories, category.id)

      const node = {
        id: category.id,
        name: category.name,
        description: category.description,
        slug: category.slug,
        image: category.image ? (typeof category.image === 'string' ? JSON.parse(category.image) : category.image) : null,
        isActive: category.is_active,
        parentName: category.parent_name || null
      }

      if (children.length > 0) {
        node.children = children
      }

      branch.push(node)
    }
  })

  return branch
}

// 1. API: Lấy toàn bộ cây danh mục lồng nhau (Dành cho Menu và bộ lọc)
const getCategoriesList = async (filters) => {
  if (filters.mode === 'tree') {
    const flatCategories = await adminCategoryModel.getAllCategoriesFlat()
    return { mode: 'tree', tree: buildCategoryTree(flatCategories, null) }
  }

  const page = Number(filters.page) || 1
  const limit = Number(filters.limit) || 10
  const offset = (page - 1) * limit

  const filterParams = {
    search: filters.search || null,
    limit: String(limit),
    offset: String(offset)
  }

  const [categories, totalItems, overviewStats] = await Promise.all([
    adminCategoryModel.getCategoriesForAdmin(filterParams),
    adminCategoryModel.countCategoriesForAdmin(filterParams),
    adminCategoryModel.getCategoriesOverviewStats()
  ])

  const formattedCategories = categories.map(cat => ({
    ...cat,
    image: cat.image ? (typeof cat.image === 'string' ? JSON.parse(cat.image) : cat.image) : null,
    totalProducts: Number(cat.total_products) || 0
  }))

  return {
    mode: 'flat',
    overview: overviewStats,
    pagination: {
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      limit
    },
    categories: formattedCategories
  }
}

// 2. API: Admin tạo mới Danh mục đa cấp
const createCategory = async (categoryData) => {
  let generatedSlug = generateCustomSlug(categoryData.name)

  const isSlugExist = await adminCategoryModel.checkSlugExist(generatedSlug)
  if (isSlugExist) {
    generatedSlug = `${generatedSlug}-${Date.now().toString().slice(-4)}`
  }

  const imageJson = categoryData.imageFile
    ? JSON.stringify({ public_id: categoryData.imageFile.filename, secure_url: categoryData.imageFile.path })
    : null

  const newId = await adminCategoryModel.createCategory({
    parentId: categoryData.parentId ? Number(categoryData.parentId) : null,
    name: categoryData.name,
    description: categoryData.description,
    slug: generatedSlug,
    image: imageJson
  })

  return {
    message: 'Khởi tạo danh mục sản phẩm mới thành công!',
    categoryId: newId
  }
}

// 3. API: Admin cập nhật danh mục đa cấp
const updateCategory = async (id, categoryData) => {
  const currentCategory = await adminCategoryModel.getCategoryDetailById(id)
  if (!currentCategory) throw new Error('Danh mục yêu cầu cập nhật không tồn tại trên sàn.')

  if (categoryData.parentId && Number(categoryData.parentId) === Number(id)) {
    throw new Error('Thao tác sai lầm! Không thể chọn chính danh mục này làm danh mục cha của nó.')
  }

  let generatedSlug = currentCategory.slug
  if (categoryData.name && categoryData.name !== currentCategory.name) {
    generatedSlug = generateCustomSlug(categoryData.name)
    const isSlugExist = await adminCategoryModel.checkSlugExist(generatedSlug, id)
    if (isSlugExist) {
      generatedSlug = `${generatedSlug}-${Date.now().toString().slice(-4)}`
    }
  }

  let imageJson = currentCategory.image
  if (categoryData.imageFile) {
    if (currentCategory.image) {
      const oldImage = typeof currentCategory.image === 'string' ? JSON.parse(currentCategory.image) : currentCategory.image
      if (oldImage?.public_id) {
        await CloudinaryProvider.cloudinary.uploader.destroy(oldImage.public_id)
      }
    }
    imageJson = JSON.stringify({ public_id: categoryData.imageFile.filename, secure_url: categoryData.imageFile.path })
  }

  await adminCategoryModel.updateCategory(id, {
    parentId: categoryData.parentId ? Number(categoryData.parentId) : null,
    name: categoryData.name,
    description: categoryData.description,
    slug: generatedSlug,
    image: imageJson
  })

  return { message: 'Cập nhật thông tin danh mục thành công!' }
}

// 4. API: Cập nhật trạng thái danh mục (Bật/Tắt) - Có cascade cho sản phẩm
const toggleCategoryStatus = async (id, isActive) => {
  const category = await adminCategoryModel.getCategoryDetailById(id)
  if (!category) throw new Error('Danh mục mục tiêu không tồn tại trên hệ thống.')

  // Nếu trạng thái hiện tại đã giống với yêu cầu
  if (category.is_active === isActive) {
    throw new Error(`Danh mục đã ở trạng thái ${isActive ? 'hoạt động' : 'khóa'} rồi.`)
  }

  // Cập nhật trạng thái cho danh mục và tất cả danh mục con + sản phẩm liên quan
  const result = await adminCategoryModel.updateCategoryAndChildrenStatus(id, isActive)

  return {
    message: isActive
      ? `Đã kích hoạt danh mục và ${result.categoryUpdated - 1} danh mục con. Đã cập nhật ${result.productsUpdated} sản phẩm.`
      : `Đã khóa danh mục và ${result.categoryUpdated - 1} danh mục con. Đã cập nhật ${result.productsUpdated} sản phẩm.`,
    categoryUpdated: result.categoryUpdated,
    productsUpdated: result.productsUpdated
  }
}

// 5. API: Xóa đơn lẻ danh mục
const deleteCategory = async (id) => {
  const category = await adminCategoryModel.getCategoryDetailById(id)
  if (!category) throw new Error('Danh mục mục tiêu không tồn tại trên hệ thống.')

  await adminCategoryModel.detachChildCategories(id)

  if (category.image) {
    const imageObj = typeof category.image === 'string' ? JSON.parse(category.image) : category.image
    if (imageObj?.public_id) {
      await CloudinaryProvider.cloudinary.uploader.destroy(imageObj.public_id)
    }
  }

  await adminCategoryModel.deleteCategoryHard(id)

  return {
    message: 'Đã xóa bỏ hoàn toàn danh mục! Các danh mục con liên đới đã được đẩy lên làm danh mục độc lập.'
  }
}

// 6. API: Lấy chi tiết danh mục
const getCategoryDetail = async (id) => {
  const category = await adminCategoryModel.getCategoryDetailById(id)

  if (!category) {
    const error = new Error('Danh mục sản phẩm không tồn tại trên sàn hoặc đã bị xóa trước đó.')
    error.statusCode = 404
    throw error
  }

  return {
    id: category.id,
    parentId: category.parent_id,
    parentName: category.parent_name || null,
    name: category.name,
    description: category.description,
    slug: category.slug,
    image: category.image ? (typeof category.image === 'string' ? JSON.parse(category.image) : category.image) : null,
    isActive: category.is_active,
    totalProducts: Number(category.total_products) || 0,
    createdAt: category.created_at
  }
}

export const adminCategoryService = {
  getCategoriesList,
  getCategoryDetail,
  createCategory,
  updateCategory,
  toggleCategoryStatus,
  deleteCategory
}