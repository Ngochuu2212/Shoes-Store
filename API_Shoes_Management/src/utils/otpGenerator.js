import crypto from 'crypto'

// crypto.randomInt an toàn về mặt mật mã, khác với Math.random có thể bị đoán trước
const generateOTP = () => {
  return crypto.randomInt(100000, 1000000).toString()
}

export default generateOTP
