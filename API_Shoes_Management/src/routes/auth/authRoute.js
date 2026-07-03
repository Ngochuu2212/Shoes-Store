import express from 'express'
import { authController } from '~/controllers/auth/authController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const router = express.Router()

router.post('/register',
  authMiddleware.registerLimiter,
  authMiddleware.validateRegister,
  authController.register
)

router.post('/verify-otp',
  authMiddleware.validateVerifyOtp,
  authController.verifyOtp
)

router.post('/login',
  authMiddleware.loginLimiter,
  authMiddleware.validateLogin,
  authController.login
)

router.post('/google-login', authController.googleLogin)

router.post('/forgot-password',
  authMiddleware.registerLimiter,
  authController.forgotPassword
)

router.post('/reset-password',
  authMiddleware.validateResetPassword,
  authController.resetPassword
)

router.post('/logout', authController.logout)

router.post('/refresh-token', authController.refreshAccessToken)

export const authRouter = router