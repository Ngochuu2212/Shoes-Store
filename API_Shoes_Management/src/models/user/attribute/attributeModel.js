import pool from '~/config/db'

const getAllSizes = async () => {
  const query = 'SELECT id, size_value FROM global_sizes ORDER BY id ASC'
  const [rows] = await pool.execute(query)
  return rows
}

const getAllColors = async () => {
  const query = 'SELECT id, color_name, color_code FROM global_colors ORDER BY id ASC'
  const [rows] = await pool.execute(query)
  return rows
}

export const attributeModel = {
  getAllSizes,
  getAllColors
}