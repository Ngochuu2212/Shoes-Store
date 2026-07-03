import { systemSettingModel } from '~/models/admin/system/systemSettingModel'

// 1. Lấy cấu hình hệ thống
const getSystemSettings = async () => {
  const settings = await systemSettingModel.getSettings()
  if (!settings) {
    throw new Error('Không tìm thấy cấu hình hệ thống gốc.')
  }
  return settings
}

// 2. Cập nhật cấu hình hệ thống (Bẫy chặn giữ lại giá trị cũ nếu Admin không truyền đủ trường)
const updateSystemSettings = async (updateData) => {
  const currentSettings = await systemSettingModel.getSettings()
  if (!currentSettings) {
    throw new Error('Cấu hình hệ thống gốc không tồn tại.')
  }

  // Nếu trường nào undefined (không truyền từ body), bốc lại giá trị cũ trong DB đắp vào
  const finalData = {
    isMaintenance: updateData.isMaintenance !== undefined ? updateData.isMaintenance : currentSettings.is_maintenance,
    maintenanceMessage: updateData.maintenanceMessage !== undefined ? updateData.maintenanceMessage : currentSettings.maintenance_message,
    globalCommissionRate: updateData.globalCommissionRate !== undefined ? Number(updateData.globalCommissionRate) : Number(currentSettings.global_commission_rate),
    hotline: updateData.hotline !== undefined ? updateData.hotline : currentSettings.hotline,
    supportEmail: updateData.supportEmail !== undefined ? updateData.supportEmail : currentSettings.support_email
  }

  await systemSettingModel.updateSettings(finalData)

  return {
    message: 'Cập nhật cấu hình hệ thống thành công!',
    updatedSettings: finalData
  }
}

export const systemSettingService = {
  getSystemSettings,
  updateSystemSettings
}