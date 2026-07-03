import pool from '~/config/db'

const getAllSizes = async () => {
  const [rows] = await pool.execute('SELECT * FROM global_sizes ORDER BY id ASC')
  return rows
}

const checkSizeExist = async (value, excludeId = null) => {
  let query = 'SELECT id FROM global_sizes WHERE size_value = ?'
  const params = [value]
  if (excludeId) { query += ' AND id != ?'; params.push(excludeId) }
  const [rows] = await pool.execute(query, params)
  return rows.length > 0
}

const createSize = async (value) => {
  const [result] = await pool.execute('INSERT INTO global_sizes (size_value) VALUES (?)', [value])
  return result.insertId
}

const updateSize = async (id, value) => {
  const [result] = await pool.execute('UPDATE global_sizes SET size_value = ? WHERE id = ?', [value, id])
  return result.affectedRows
}

const checkSizeUsedInVariants = async (value) => {
  // Check xem chuỗi size này đã nằm trong biến thể sản phẩm nào chưa
  const [rows] = await pool.execute('SELECT id FROM product_variants WHERE size = ? LIMIT 1', [value])
  return rows.length > 0
}

const deleteSize = async (id) => {
  const [result] = await pool.execute('DELETE FROM global_sizes WHERE id = ?', [id])
  return result.affectedRows
}

const getSizeDetailById = async (id) => {
  const [rows] = await pool.execute('SELECT * FROM global_sizes WHERE id = ?', [id])
  return rows[0] || null
}

const getAllColors = async () => {
  const [rows] = await pool.execute('SELECT * FROM global_colors ORDER BY id ASC')
  return rows
}

const checkColorExist = async (name, excludeId = null) => {
  let query = 'SELECT id FROM global_colors WHERE color_name = ?'
  const params = [name]
  if (excludeId) { query += ' AND id != ?'; params.push(excludeId) }
  const [rows] = await pool.execute(query, params)
  return rows.length > 0
}

const createColor = async (name, code) => {
  const [result] = await pool.execute('INSERT INTO global_colors (color_name, color_code) VALUES (?, ?)', [name, code])
  return result.insertId
}

const updateColor = async (id, name, code) => {
  const [result] = await pool.execute('UPDATE global_colors SET color_name = ?, color_code = ? WHERE id = ?', [name, code, id])
  return result.affectedRows
}

const checkColorUsedInVariants = async (name) => {
  const [rows] = await pool.execute('SELECT id FROM product_variants WHERE color = ? LIMIT 1', [name])
  return rows.length > 0
}

const deleteColor = async (id) => {
  const [result] = await pool.execute('DELETE FROM global_colors WHERE id = ?', [id])
  return result.affectedRows
}

const getColorDetailById = async (id) => {
  const [rows] = await pool.execute('SELECT * FROM global_colors WHERE id = ?', [id])
  return rows[0] || null
}

export const adminAttributeModel = {
  getAllSizes, checkSizeExist, createSize, updateSize, checkSizeUsedInVariants, deleteSize, getSizeDetailById,
  getAllColors, checkColorExist, createColor, updateColor, checkColorUsedInVariants, deleteColor, getColorDetailById
}