import { adminFinancialService } from '~/services/admin/adminFinancialService'

const getPlatformFinancialAnalytics = async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query

    const result = await adminFinancialService.getPlatformFinancialAnalytics({
      type,
      customStartDate: startDate,
      customEndDate: endDate
    })

    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi tính toán doanh thu tài chính vĩ mô: ${error.message}` })
  }
}

export const adminFinancialController = {
  getPlatformFinancialAnalytics
}