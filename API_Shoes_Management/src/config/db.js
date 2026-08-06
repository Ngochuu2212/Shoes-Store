import mysql from 'mysql2/promise'
import { env } from './environment'

const pool = mysql.createPool({
  host: env.DB_HOST,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  port: env.DB_PORT || 3307,
  ssl: {
    rejectUnauthorized: false
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

// Hàm kiểm tra kết nối tới Database khi khởi động Server (hỗ trợ thử lại 5 lần nếu kết nối chậm/bị ngắt)
export const connectDB = async (retries = 5, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const connection = await pool.getConnection()
      console.log('✅ Kết nối MySQL Database thành công!')
      connection.release()
      return
    } catch (error) {
      console.log(`⚠️ Thử kết nối Database lần ${i + 1}/${retries} thất bại: ${error.message}`)
      if (i < retries - 1) {
        await new Promise(res => setTimeout(res, delay))
      } else {
        throw new Error(`Kết nối Database thất bại sau ${retries} lần thử: ${error.message}`)
      }
    }
  }
}

export default pool