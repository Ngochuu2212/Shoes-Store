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

// Hàm kiểm tra kết nối tới Database khi khởi động Server
export const connectDB = async () => {
  try {
    const connection = await pool.getConnection()
    connection.release()
  } catch (error) {
    throw new Error(`Kết nối Database thất bại: ${error.message}`)
  }
}

export default pool