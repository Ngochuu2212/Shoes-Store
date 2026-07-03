import pool from '~/config/db'

const getAllCategories = async () => {
  const query = `
    SELECT id, parent_id, name, slug, description, image
    FROM categories
    WHERE is_active = TRUE
    ORDER BY parent_id ASC, id ASC
  `
  const [rows] = await pool.execute(query)
  return rows
}

export const categoryModel = {
  getAllCategories
}