import { vendorPayoutService } from '~/services/vendor/vendorPayoutService'

// 1. POST: Tạo mới một yêu cầu rút tiền
const createPayoutRequest = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const result = await vendorPayoutService.createPayoutRequest(userId, req.body)
    return res.status(201).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi phát sinh khi tạo lệnh rút tiền: ${error.message}` })
  }
}

// 2. GET: Tải danh sách lịch sử rút tiền kèm số dư ví hiện tại của shop
const getPayoutHistory = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const result = await vendorPayoutService.getPayoutHistory(userId, req.query)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi tải lịch sử rút tiền: ${error.message}` })
  }
}

// 3. GET: Export Excel lịch sử rút tiền
const exportPayoutHistory = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const excelBuffer = await vendorPayoutService.exportPayoutHistory(userId)

    // Tên file theo ngày hiện tại
    const dateStr = new Date().toISOString().slice(0, 10)
    const fileName = `LichSuRutTien_${dateStr}.xlsx`

    // Set header để download file
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)

    return res.send(excelBuffer)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi xuất file Excel: ${error.message}` })
  }
}

export const vendorPayoutController = {
  createPayoutRequest,
  getPayoutHistory,
  exportPayoutHistory
}