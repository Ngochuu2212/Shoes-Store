import { walletService } from '~/services/user/walletService'

const getWallet = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const result = await walletService.getWallet(userId, page, limit)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi tải thông tin ví: ${error.message}` })
  }
}

export const walletController = { getWallet }
