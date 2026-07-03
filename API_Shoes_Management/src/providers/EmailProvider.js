import nodemailer from 'nodemailer'
import { env } from '~/config/environment'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: env.BREVO_SMTP_USER, // Tận dụng biến môi trường hiện tại
    pass: env.BREVO_API_KEY    // để không cần đổi tên biến trên Render
  }
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