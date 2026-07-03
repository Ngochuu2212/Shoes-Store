import { vendorAppealService } from '~/services/vendor/vendorAppealService'

const submitStoreAppeal = async (req, res) => {
  try {
    const userId = req.jwtDecoded.id
    const { appealReason } = req.body
    const evidenceFiles = req.files || []

    const result = await vendorAppealService.submitStoreAppeal({
      userId,
      appealReason,
      evidenceFiles
    })
    return res.status(201).json(result)
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}

const getMyAppeals = async (req, res) => {
  try {
    const userId = req.jwtDecoded.id
    const result = await vendorAppealService.getMyAppeals(userId, req.query)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi tải danh sách đơn cứu xét: ${error.message}` })
  }
}

const getAppealDetail = async (req, res) => {
  try {
    const userId = req.jwtDecoded.id
    const { id } = req.params
    const result = await vendorAppealService.getAppealDetail(userId, Number(id))
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi lấy chi tiết đơn cứu xét: ${error.message}` })
  }
}

export const vendorAppealController = {
  submitStoreAppeal,
  getMyAppeals,
  getAppealDetail
}