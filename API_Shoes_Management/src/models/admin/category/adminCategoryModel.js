import pool from '~/config/db'

// 1. Lấy toàn bộ danh mục phẳng từ DB
const getAllCategoriesFlat = async () => {
  const query = `
    SELECT c1.id, c1.parent_id, c1.name, c1.description, c1.slug, c1.image, c1.is_active,
           c2.name AS parent_name
    FROM categories c1
    LEFT JOIN categories c2 ON c1.parent_id = c2.id
    ORDER BY c1.id ASC
  `
  const [rows] = await pool.execute(query)
  return rows
}

// 2. Kiểm tra xem Slug danh mục có bị trùng lặp dưới DB không (Bảo đảm tính độc nhất)
const checkSlugExist = async (slug, excludeId = null) => {
  let query = 'SELECT id FROM categories WHERE slug = ?'
  const params = [slug]

  if (excludeId) {
    query += ' AND id != ?'
    params.push(excludeId)
  }

  const [rows] = await pool.execute(query, params)
  return rows.length > 0
}

// 3. Admin tạo mới một danh mục (Hỗ trợ parent_id đa cấp)
const createCategory = async ({ parentId, name, description, slug, image }) => {
  const query = `
    INSERT INTO categories (parent_id, name, description, slug, image, is_active)
    VALUES (?, ?, ?, ?, ?, TRUE)
  `
  const [result] = await pool.execute(query, [parentId || null, name, description, slug, image])
  return result.insertId
}

// 4. Lấy thông tin chi tiết một danh mục cụ thể
const getCategoryDetailById = async (id) => {
  const query = `
    SELECT c1.id, c1.parent_id, c1.name, c1.description, c1.slug, c1.image, c1.is_active, c1.created_at,
           c2.name AS parent_name,
           COUNT(p.id) AS total_products
    FROM categories c1
    LEFT JOIN categories c2 ON c1.parent_id = c2.id
    LEFT JOIN products p ON c1.id = p.category_id
    WHERE c1.id = ?
    GROUP BY c1.id
  `
  const [rows] = await pool.execute(query, [id])
  return rows[0] || null
}

// 5. Admin cập nhật danh mục đa cấp
const updateCategory = async (id, { parentId, name, description, slug, image }) => {
  const query = `
    UPDATE categories 
    SET parent_id = ?, name = ?, description = ?, slug = ?, image = ?
    WHERE id = ?
  `
  const [result] = await pool.execute(query, [parentId || null, name, description, slug, image, id])
  return result.affectedRows
}

// 6. Xử lý đẩy các danh mục con lên làm danh mục gốc (parent_id = NULL) trước khi xóa danh mục cha
const detachChildCategories = async (parentId) => {
  const query = 'UPDATE categories SET parent_id = NULL WHERE parent_id = ?'
  const [result] = await pool.execute(query, [parentId])
  return result.affectedRows
}

// 7. Thực thi xóa hẳn danh mục khỏi MySQL DB
const deleteCategoryHard = async (id) => {
  const query = 'DELETE FROM categories WHERE id = ?'
  const [result] = await pool.execute(query, [id])
  return result.affectedRows
}

// 8. Lấy danh sách danh mục phẳng kèm thông tin tên cha và ĐẾM TỔNG SỐ SẢN PHẨM (Phục vụ phân trang + tìm kiếm)
const getCategoriesForAdmin = async ({ search, limit, offset }) => {
  let query = `
    SELECT c1.id, c1.parent_id, c1.name, c1.description, c1.slug, c1.image, c1.is_active, c1.created_at,
           c2.name AS parent_name,
           COUNT(p.id) AS total_products
    FROM categories c1
    LEFT JOIN categories c2 ON c1.parent_id = c2.id
    LEFT JOIN products p ON c1.id = p.category_id
    WHERE 1=1
  `
  const queryParams = []

  if (search) {
    query += ' AND (c1.name LIKE ? OR c1.description LIKE ?)'
    queryParams.push(`%${search}%`, `%${search}%`)
  }

  query += ' GROUP BY c1.id ORDER BY c1.id DESC LIMIT ? OFFSET ?'
  queryParams.push(limit, offset)

  const [rows] = await pool.execute(query, queryParams)
  return rows
}

// 9. Đếm tổng số lượng phục vụ phân trang
const countCategoriesForAdmin = async ({ search }) => {
  let query = 'SELECT COUNT(*) AS total FROM categories WHERE 1=1'
  const queryParams = []

  if (search) {
    query += ' AND (name LIKE ? OR description LIKE ?)'
    queryParams.push(`%${search}%`, `%${search}%`)
  }

  const [rows] = await pool.execute(query, queryParams)
  return rows[0].total
}

// 10. Bốc số liệu Widgets tổng quan đầu trang danh mục
const getCategoriesOverviewStats = async () => {
  const query = `
    SELECT 
      COUNT(*) AS totalCategories,
      SUM(CASE WHEN parent_id IS NULL THEN 1 ELSE 0 END) AS rootCategories,
      SUM(CASE WHEN parent_id IS NOT NULL THEN 1 ELSE 0 END) AS childCategories,
      SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) AS activeCategories
    FROM categories
  `
  const [rows] = await pool.execute(query)
  return {
    totalCategories: Number(rows[0].totalCategories) || 0,
    rootCategories: Number(rows[0].rootCategories) || 0,
    childCategories: Number(rows[0].childCategories) || 0,
    activeCategories: Number(rows[0].activeCategories) || 0
  }
}

// 11. Cập nhật trạng thái danh mục (kèm cập nhật sản phẩm)
const updateCategoryStatus = async (id, isActive) => {
  const query = 'UPDATE categories SET is_active = ? WHERE id = ?'
  const [result] = await pool.execute(query, [isActive, id])
  return result.affectedRows
}

// 12. Cập nhật trạng thái sản phẩm theo category_id
const updateProductsStatusByCategory = async (categoryId, isActive) => {
  const query = 'UPDATE products SET is_active = ? WHERE category_id = ?'
  const [result] = await pool.execute(query, [isActive, categoryId])
  return result.affectedRows
}

// 13. Lấy tất cả category con (đệ quy) - hỗ trợ cập nhật cascade
const getAllChildCategoryIds = async (parentId) => {
  const query = `
    WITH RECURSIVE category_tree AS (
      SELECT id FROM categories WHERE id = ?
      UNION ALL
      SELECT c.id FROM categories c
      INNER JOIN category_tree ct ON c.parent_id = ct.id
    )
    SELECT id FROM category_tree
  `
  const [rows] = await pool.execute(query, [parentId])
  return rows.map(row => row.id)
}

// 14. Cập nhật trạng thái danh mục và tất cả danh mục con (cascade)
const updateCategoryAndChildrenStatus = async (categoryId, isActive) => {
  // Lấy tất cả ID danh mục con (bao gồm cả chính nó)
  const childIds = await getAllChildCategoryIds(categoryId)

  if (childIds.length === 0) return { categoryUpdated: 0, productsUpdated: 0 }

  // Cập nhật trạng thái cho tất cả danh mục con
  const placeholders = childIds.map(() => '?').join(', ')
  const updateCategoryQuery = `UPDATE categories SET is_active = ? WHERE id IN (${placeholders})`
  const [categoryResult] = await pool.execute(updateCategoryQuery, [isActive, ...childIds])

  // Cập nhật trạng thái cho tất cả sản phẩm thuộc các danh mục con
  const updateProductQuery = `UPDATE products SET is_active = ? WHERE category_id IN (${placeholders})`
  const [productResult] = await pool.execute(updateProductQuery, [isActive, ...childIds])

  return {
    categoryUpdated: categoryResult.affectedRows,
    productsUpdated: productResult.affectedRows
  }
}

export const adminCategoryModel = {
  getAllCategoriesFlat,
  checkSlugExist,
  createCategory,
  getCategoryDetailById,
  updateCategory,
  detachChildCategories,
  deleteCategoryHard,
  getCategoriesForAdmin,
  countCategoriesForAdmin,
  getCategoriesOverviewStats,
  updateCategoryStatus,
  updateProductsStatusByCategory,
  getAllChildCategoryIds,
  updateCategoryAndChildrenStatus
}