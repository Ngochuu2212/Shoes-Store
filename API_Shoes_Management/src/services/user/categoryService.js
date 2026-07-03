import { categoryModel } from '~/models/user/category/categoryModel'

// Build nested tree từ flat array
const buildTree = (items) => {
  const map = {}
  const roots = []

  items.forEach(item => {
    map[item.id] = { ...item, children: [] }
  })

  items.forEach(item => {
    if (item.parent_id && map[item.parent_id]) {
      map[item.parent_id].children.push(map[item.id])
    } else {
      roots.push(map[item.id])
    }
  })

  return roots
}

const getAllCategories = async () => {
  const rows = await categoryModel.getAllCategories()
  return buildTree(rows)
}

export const categoryService = {
  getAllCategories
}