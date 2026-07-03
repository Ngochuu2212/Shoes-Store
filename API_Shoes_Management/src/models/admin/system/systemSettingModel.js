import pool from '~/config/db'

// 1. Lấy thông tin cấu hình hệ thống hiện tại (Dòng id = 1)
const getSettings = async () => {
  const query = 'SELECT * FROM system_settings WHERE id = 1'
  const [rows] = await pool.execute(query)
  return rows[0]
}

// 2. Cập nhật cấu hình hệ thống
const updateSettings = async ({ isMaintenance, maintenanceMessage, globalCommissionRate, hotline, supportEmail }) => {
  const query = `
    UPDATE system_settings 
    SET is_maintenance = ?, 
        maintenance_message = ?, 
        global_commission_rate = ?, 
        hotline = ?, 
        support_email = ?
    WHERE id = 1
  `
  const [result] = await pool.execute(query, [
    isMaintenance,
    maintenanceMessage || null,
    globalCommissionRate,
    hotline,
    supportEmail
  ])
  return result
}

export const systemSettingModel = {
  getSettings,
  updateSettings
}