import { systemSettingService } from '~/services/admin/systemSettingService'

// Lấy cấu hình
const getSystemSettings = async (req, res) => {
  try {
    const result = await systemSettingService.getSystemSettings()
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi lấy cấu hình hệ thống: ${error.message}` })
  }
}

// Cập nhật cấu hình
const updateSystemSettings = async (req, res) => {
  try {
    const result = await systemSettingService.updateSystemSettings(req.body)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi cập nhật cấu hình hệ thống: ${error.message}` })
  }
}

export const systemSettingController = {
  getSystemSettings,
  updateSystemSettings
}