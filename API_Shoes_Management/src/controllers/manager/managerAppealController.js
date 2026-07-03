import { managerAppealService } from '~/services/manager/managerAppealService'

const getAppealsList = async (req, res) => {
  try {
    const result = await managerAppealService.getAppealsList(req.query)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi tải danh sách đơn cứu xét: ${error.message}` })
  }
}

const getAppealDetail = async (req, res) => {
  try {
    const { id } = req.params
    const result = await managerAppealService.getAppealDetail(Number(id))
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi lấy chi tiết đơn cứu xét: ${error.message}` })
  }
}

const processStoreAppeal = async (req, res) => {
  try {
    const { id } = req.params
    const { status, managerNote } = req.body

    const result = await managerAppealService.processStoreAppeal(Number(id), { status, managerNote })
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi thực thi duyệt đơn cứu xét: ${error.message}` })
  }
}

export const managerAppealController = {
  getAppealsList,
  getAppealDetail,
  processStoreAppeal
}