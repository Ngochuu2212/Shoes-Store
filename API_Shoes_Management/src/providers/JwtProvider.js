import jwt from 'jsonwebtoken'

const generateToken = (userInfo, secretKey, tokenLife) => {
  try {
    return jwt.sign(userInfo, secretKey, { algorithm: 'HS256', expiresIn: tokenLife })
  } catch (error) {
    throw new Error(`Lỗi ký Token: ${error.message}`)
  }
}

const verifyToken = (token, secretKey) => {
  try {
    return jwt.verify(token, secretKey)
  } catch (error) {
    throw new Error(`Lỗi xác thực Token: ${error.message}`)
  }
}

export const JwtProvider = {
  generateToken,
  verifyToken
}