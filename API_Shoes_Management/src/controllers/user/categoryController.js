import { categoryService } from '~/services/user/categoryService'

const getAllCategories = async (req, res) => {
  try {
    const result = await categoryService.getAllCategories()
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi lấy danh mục: ${error.message}` })
  }
}

export const categoryController = {
  getAllCategories
}