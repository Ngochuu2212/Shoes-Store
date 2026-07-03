import { attributeService } from '~/services/user/attributeService'

const getGlobalAttributes = async (req, res) => {
  try {
    const result = await attributeService.getGlobalAttributes()
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi lấy thuộc tính: ${error.message}` })
  }
}

export const attributeController = {
  getGlobalAttributes
}