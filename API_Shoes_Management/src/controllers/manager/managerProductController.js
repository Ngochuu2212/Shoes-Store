import { managerProductService } from '~/services/manager/managerProductService'

const getProductsList = async (req, res) => {
  try {
    const result = await managerProductService.getProductsList(req.query)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi tải danh sách sản phẩm kiểm duyệt: ${error.message}` })
  }
}

const toggleProductActive = async (req, res) => {
  try {
    const { id } = req.params
    const { targetStatus, reason } = req.body

    const result = await managerProductService.toggleProductActive(Number(id), targetStatus, reason)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi cập nhật trạng thái sản phẩm: ${error.message}` })
  }
}

const getProductDetail = async (req, res) => {
  try {
    const { id } = req.params
    const result = await managerProductService.getProductDetail(Number(id))
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi lấy chi tiết sản phẩm: ${error.message}` })
  }
}

const toggleProductsActiveBulk = async (req, res) => {
  try {
    const { productIds, targetStatus, reason } = req.body

    const result = await managerProductService.toggleProductsActiveBulk(productIds, targetStatus, reason)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi kiểm duyệt sản phẩm hàng loạt: ${error.message}` })
  }
}

export const managerProductController = {
  getProductsList,
  toggleProductActive,
  getProductDetail,
  toggleProductsActiveBulk
}