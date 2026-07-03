import { adminCategoryService } from '~/services/admin/adminCategoryService'

const getCategoryTree = async (req, res) => {
  try {
    const result = await adminCategoryService.getCategoriesList(req.query)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi tải danh sách danh mục: ${error.message}` })
  }
}

const createCategory = async (req, res) => {
  try {
    const { parentId, name, description } = req.body
    const imageFile = req.file

    const result = await adminCategoryService.createCategory({ parentId, name, description, imageFile })
    return res.status(201).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi khởi tạo danh mục: ${error.message}` })
  }
}

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params
    const { parentId, name, description } = req.body
    const imageFile = req.file

    const result = await adminCategoryService.updateCategory(Number(id), { parentId, name, description, imageFile })
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi cập nhật danh mục: ${error.message}` })
  }
}

const toggleCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { isActive } = req.body

    if (isActive === undefined || isActive === null) {
      return res.status(400).json({ message: 'Vui lòng cung cấp trạng thái isActive (true/false)' })
    }

    const result = await adminCategoryService.toggleCategoryStatus(Number(id), isActive)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi cập nhật trạng thái danh mục: ${error.message}` })
  }
}

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params
    const result = await adminCategoryService.deleteCategory(Number(id))
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi xử lý xóa danh mục: ${error.message}` })
  }
}

const getCategoryDetail = async (req, res, next) => {
  try {
    const { id } = req.params
    const result = await adminCategoryService.getCategoryDetail(Number(id))
    return res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

export const adminCategoryController = {
  getCategoryTree,
  createCategory,
  updateCategory,
  toggleCategoryStatus,
  deleteCategory,
  getCategoryDetail
}