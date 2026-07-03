import nodemailer from 'nodemailer'
import { env } from '~/config/environment'

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: 'b0c064001@smtp-brevo.com',
    pass: env.BREVO_API_KEY
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