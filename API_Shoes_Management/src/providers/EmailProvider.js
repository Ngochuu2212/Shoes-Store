import nodemailer from 'nodemailer'
import { env } from '~/config/environment'

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Sử dụng STARTTLS ở cổng 587
  auth: {
    user: env.BREVO_SMTP_USER,
    pass: env.BREVO_API_KEY
  },
  family: 4 // Bắt buộc sử dụng kết nối IPv4 để tránh lỗi mạng IPv6 ENETUNREACH trên Render
})

const sendEmail = async (to, subject, htmlContent) => {
  try {
    const mailOptions = {
      from: `"Shoes Store" <${env.BREVO_SMTP_USER}>`,
      to: to,
      subject: subject,
      html: htmlContent
    }

    const info = await transporter.sendMail(mailOptions)
    return info
  } catch (error) {
    throw new Error(`Lỗi gửi Email: ${error.message}`)
  }
}

export const EmailProvider = { sendEmail }