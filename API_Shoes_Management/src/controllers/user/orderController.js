import { orderService } from '~/services/user/orderService'
import { env } from '~/config/environment'

const createOrderCOD = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const { recipientName, recipientPhone, shippingAddress, discountAmount, paymentMethod, storeDiscounts } = req.body
    const result = await orderService.createOrderCOD(userId, {
      recipientName,
      recipientPhone,
      shippingAddress,
      discountAmount: Number(discountAmount) || 0,
      paymentMethod,
      storeDiscounts
    })

    return res.status(201).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi xử lý đặt hàng: ${error.message}` })
  }
}

const createOrderOnline = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const { recipientName, recipientPhone, shippingAddress, discountAmount, paymentMethod, storeDiscounts } = req.body
    const ipAddr = req.headers['x-forwarded-for'] || req.socket.remoteAddress

    const result = await orderService.createOrderOnline(userId, {
      recipientName,
      recipientPhone,
      shippingAddress,
      discountAmount: Number(discountAmount) || 0,
      paymentMethod,
      storeDiscounts
    }, ipAddr)

    return res.status(201).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi đặt hàng Online: ${error.message}` })
  }
}

const vnpayReturn = async (req, res) => {
  try {

    const result = await orderService.vnpayIPN(req.query)
    const txnRef = req.query.vnp_TxnRef
    const vnp_ResponseCode = req.query.vnp_ResponseCode

    // Kiểm tra isSuccess và response code
    if (result.isSuccess && vnp_ResponseCode === '00') {
      const orderIds = txnRef.split('_').slice(0, -1).join(',')
      return res.redirect(`${env.FRONTEND_URL}/order-success?orderIds=${orderIds}&method=VNPAY&payment=success`)
    }

    // Thanh toán thất bại hoặc bị hủy
    let orderIds = ''
    if (txnRef) {
      orderIds = txnRef.split('_').slice(0, -1).join(',')
    }
    return res.redirect(`${env.FRONTEND_URL}/cart?payment=failed${orderIds ? `&orderIds=${orderIds}` : ''}`)
  } catch (error) {
    return res.redirect(`${env.FRONTEND_URL}/cart?payment=error`)
  }
}

const momoReturn = async (req, res) => {
  try {

    const result = await orderService.processMoMoReturn(req.query)
    const orderIdQuery = req.query.orderId
    const resultCode = req.query.resultCode

    // Kiểm tra isSuccess và resultCode
    if (result.isSuccess && resultCode === '0') {
      const orderIds = orderIdQuery.split('_').slice(0, -1).join(',')
      return res.redirect(`${env.FRONTEND_URL}/order-success?orderIds=${orderIds}&method=MOMO&payment=success`)
    }

    // Thanh toán thất bại hoặc bị hủy
    let orderIds = ''
    if (orderIdQuery) {
      orderIds = orderIdQuery.split('_').slice(0, -1).join(',')
    }
    return res.redirect(`${env.FRONTEND_URL}/cart?payment=failed${orderIds ? `&orderIds=${orderIds}` : ''}`)
  } catch (error) {
    return res.redirect(`${env.FRONTEND_URL}/cart?payment=error`)
  }
}

const momoReturnIPN = async (req, res) => {
  try {
    await orderService.momoIPN(req.body)
    return res.status(204).send()
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}

export const orderController = {
  createOrderCOD,
  createOrderOnline,
  vnpayReturn,
  momoReturn,
  momoReturnIPN
}