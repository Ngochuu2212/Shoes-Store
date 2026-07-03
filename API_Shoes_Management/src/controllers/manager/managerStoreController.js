import { managerStoreService } from '~/services/manager/managerStoreService'

const getStoresList = async (req, res) => {
  try {
    const result = await managerStoreService.getStoresList(req.query)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi tải danh sách cửa hàng: ${error.message}` })
  }
}

const getStoreDetail = async (req, res) => {
  try {
    const { id } = req.params
    const result = await managerStoreService.getStoreDetail(Number(id))
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi lấy chi tiết gian hàng: ${error.message}` })
  }
}

const approveStoresBulk = async (req, res) => {
  try {
    const { storeIds } = req.body
    const result = await managerStoreService.approveStoresBulk(storeIds)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi phê duyệt cửa hàng: ${error.message}` })
  }
}

const rejectStoresBulk = async (req, res) => {
  try {
    const { storeIds, reason } = req.body
    const result = await managerStoreService.rejectStoresBulk(storeIds, reason)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi từ chối đơn đăng ký hàng loạt: ${error.message}` })
  }
}

const banStoresBulk = async (req, res) => {
  try {
    const { storeIds, reason } = req.body
    const result = await managerStoreService.banStoresBulk(storeIds, reason)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi đình chỉ hoạt động cửa hàng hàng loạt: ${error.message}` })
  }
}

export const managerStoreController = {
  getStoresList,
  getStoreDetail,
  approveStoresBulk,
  rejectStoresBulk,
  banStoresBulk
}