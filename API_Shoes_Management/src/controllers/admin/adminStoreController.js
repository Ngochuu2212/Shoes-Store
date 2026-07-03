import { adminStoreService } from '~/services/admin/adminStoreService'
import { managerProductService } from '~/services/manager/managerProductService'

const getStoresList = async (req, res) => {
  try {
    const { page, limit, search, isActive, sortBy, sortOrder } = req.query
    const result = await adminStoreService.getStoresList({ page, limit, search, isActive, sortBy, sortOrder })
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi tải danh sách cửa hàng: ${error.message}` })
  }
}

const getStoreDetail = async (req, res) => {
  try {
    const { id } = req.params
    const result = await adminStoreService.getStoreDetail(Number(id))
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi lấy chi tiết cửa hàng: ${error.message}` })
  }
}

const toggleStoreActiveBulk = async (req, res) => {
  try {
    const { storeIds, isActive, reason } = req.body
    const result = await adminStoreService.toggleStoreActiveBulk(storeIds, isActive, reason)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi đóng băng trạng thái cửa hàng loạt: ${error.message}` })
  }
}

const updateStoreCommissionBulk = async (req, res) => {
  try {
    const { storeIds, commissionRate } = req.body
    const result = await adminStoreService.updateStoreCommissionBulk(storeIds, commissionRate)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi cập nhật biểu phí chiết khấu sàn: ${error.message}` })
  }
}

const enforceStoreBalance = async (req, res) => {
  try {
    const { storeId, amount, type } = req.body
    const result = await adminStoreService.enforceStoreBalance({ storeId, amount, type })
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi cưỡng chế dòng tiền tài khoản cửa hàng: ${error.message}` })
  }
}

const createStore = async (req, res) => {
  try {
    const { ownerId, name, bio, address, commissionRate } = req.body

    const logoFile = req.files?.logo || null
    const bannerFile = req.files?.banner || null

    const result = await adminStoreService.createStoreByAdmin({
      ownerId, name, bio, address, commissionRate, logoFile, bannerFile
    })
    return res.status(201).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi khởi tạo cửa hàng: ${error.message}` })
  }
}

const deleteStoresBulk = async (req, res) => {
  try {
    const { storeIds } = req.body
    const result = await adminStoreService.deleteStoresBulk(storeIds)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi thực thi triệt tiêu cửa hàng loạt: ${error.message}` })
  }
}

const getStoreProducts = async (req, res) => {
  try {
    const { id } = req.params
    const result = await managerProductService.getProductsList({
      storeId: id,
      ...req.query
    })
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi tải sản phẩm của cửa hàng: ${error.message}` })
  }
}

export const adminStoreController = {
  getStoresList,
  getStoreDetail,
  toggleStoreActiveBulk,
  updateStoreCommissionBulk,
  enforceStoreBalance,
  createStore,
  deleteStoresBulk,
  getStoreProducts
}