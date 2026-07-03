import crypto from 'crypto'
import qs from 'qs'
import moment from 'moment'
import axios from 'axios'
import { env } from '~/config/environment'

const createVNPayUrl = (txnRef, amount, ipAddr) => {
  let date = new Date()
  let createDate = moment(date).format('YYYYMMDDHHmmss')
  let vnpUrl = env.VNP_URL

  let vnp_Params = {
    'vnp_Version': '2.1.0',
    'vnp_Command': 'pay',
    'vnp_TmnCode': env.VNP_TMN_CODE,
    'vnp_Locale': 'vn',
    'vnp_CurrCode': 'VND',
    'vnp_TxnRef': txnRef,
    'vnp_OrderInfo': `Thanh toan don hang giay mã ${txnRef}`,
    'vnp_OrderType': 'other',
    'vnp_Amount': amount * 100,
    'vnp_ReturnUrl': `${env.VNP_BACKEND_RETURN_URL}/api/orders/vnpay-return`,
    'vnp_IpAddr': ipAddr,
    'vnp_CreateDate': createDate
  }

  // Bắt buộc phải sắp xếp các key theo bảng chữ cái trước khi tạo chữ ký
  vnp_Params = sortObject(vnp_Params)

  const signData = qs.stringify(vnp_Params, { encode: false })
  const hmac = crypto.createHmac('sha512', env.VNP_HASH_SECRET)
  const signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest('hex')

  vnp_Params['vnp_SecureHash'] = signed
  vnpUrl += '?' + qs.stringify(vnp_Params, { encode: false })

  return vnpUrl
}

const createMoMoUrl = async (txnRef, amount) => {
  try {
    const validAmount = String(Math.round(amount))

    const orderInfo = `Thanh toan don hang ${txnRef}`
    const requestId = txnRef
    const orderId = txnRef
    const requestType = 'payWithMethod'
    const extraData = ''

    const redirectUrl = `${env.MOMO_BACKEND_RETURN_URL}/api/orders/momo-return`
    const ipnUrl = `${env.MOMO_BACKEND_RETURN_URL}/api/orders/momo-ipn`

    const rawSignature = `accessKey=${env.MOMO_ACCESS_KEY}&amount=${validAmount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${env.MOMO_PARTNER_CODE}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`

    const signature = crypto.createHmac('sha256', env.MOMO_SECRET_KEY).update(rawSignature).digest('hex')

    const requestBody = {
      partnerCode: env.MOMO_PARTNER_CODE,
      partnerName: 'Shoes Store',
      storeId: 'ShoesStoreId',
      requestId: requestId,
      amount: validAmount,
      orderId: orderId,
      orderInfo: orderInfo,
      redirectUrl: redirectUrl,
      ipnUrl: ipnUrl,
      lang: 'vi',
      requestType: requestType,
      autoCapture: true,
      extraData: extraData,
      signature: signature
    }

    const response = await axios.post(env.MOMO_API_URL, requestBody)

    return response.data.payUrl

  } catch (error) {
    throw new Error(`Giao dịch MoMo thất bại: ${error.message}`)
  }
}

// Hàm hỗ trợ thuật toán sắp xếp (Bắt buộc dùng y xì đúc hàm này của VNPAY)
function sortObject(obj) {
  let sorted = {}
  let str = []
  let key

  for (key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      str.push(encodeURIComponent(key))
    }
  }

  str.sort()
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+')
  }

  return sorted
}

export const PaymentProvider = { createVNPayUrl, sortObject, createMoMoUrl }