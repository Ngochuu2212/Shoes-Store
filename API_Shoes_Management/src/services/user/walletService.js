import { walletModel } from '~/models/user/wallet/walletModel'

const getWallet = async (userId, page = 1, limit = 10) => {
  const balance = await walletModel.getWalletBalance(userId)
  const { transactions, total } = await walletModel.getWalletTransactions(userId, page, limit)
  return {
    balance,
    transactions,
    pagination: {
      totalItems: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      limit
    }
  }
}

export const walletService = { getWallet }
