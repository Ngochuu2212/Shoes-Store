import axios from 'axios'
import { env } from '~/config/environment'

const sendEmail = async (to, subject, htmlContent) => {
  try {
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: {
          email: env.BREVO_SMTP_USER,
          name: 'Shoes Store'
        },
        to: [{ email: to }],
        subject: subject,
        htmlContent: htmlContent
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'api-key': env.BREVO_API_KEY
        }
      }
    )
    return response.data
  } catch (error) {
    throw new Error(`Lỗi gửi Email: ${error.response?.data?.message || error.message}`)
  }
}

export const EmailProvider = { sendEmail }