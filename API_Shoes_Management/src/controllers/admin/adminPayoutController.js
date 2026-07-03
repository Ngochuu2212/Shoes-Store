import { adminPayoutService } from '~/services/admin/adminPayoutService'

// 1. GET: Lấy danh sách lệnh rút tiền toàn sàn
const getPayoutList = async (req, res) => {
  try {
    const { page, limit, status, search } = req.query
    const result = await adminPayoutService.getPayoutList({ page, limit, status, search })
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi tải danh sách lệnh rút tiền: ${error.message}` })
  }
}

// 2. GET SINGLE: Lấy thông tin chi tiết của 1 lệnh rút tiền cụ thể dựa vào ID từ URL
const getPayoutDetail = async (req, res) => {
  try {
    const { id } = req.params
    const result = await adminPayoutService.getPayoutDetail(id)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi tải chi tiết lệnh rút tiền: ${error.message}` })
  }
}

// 3. PUT: Phê duyệt hoặc Từ chối lệnh rút tiền đơn lẻ
const processPayout = async (req, res) => {
  try {
    const { id } = req.params
    const { targetStatus, adminNote } = req.body

    const result = await adminPayoutService.processPayout(id, { targetStatus, adminNote })
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi thực thi phê duyệt lệnh rút: ${error.message}` })
  }
}

// 4. GET: Export Excel danh sách yêu cầu rút tiền
const exportPayoutList = async (req, res) => {
  try {
    const { status, search } = req.query
    const excelBuffer = await adminPayoutService.exportPayoutList({ status, search })

    const dateStr = new Date().toISOString().slice(0, 10)
    const fileName = `DanhSachRutTien_${dateStr}.xlsx`

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)

    return res.send(excelBuffer)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi xuất file Excel: ${error.message}` })
  }
}

export const adminPayoutController = {
  getPayoutList,
  getPayoutDetail,
  processPayout,
  exportPayoutList
}