import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import { env } from '~/config/environment'
import { userModel } from '~/models/user/userModel'

const userSocketMap = {}
let io = null

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      credentials: true
    }
  })

  io.use((socket, next) => {
    let token = socket.handshake.auth?.token || socket.handshake.headers?.token

    if (!token) {
      const cookieHeader = socket.handshake.headers.cookie
      if (cookieHeader) {
        const match = cookieHeader.match(/accessToken=([^;]+)/)
        if (match) token = match[1]
      }
    }

    if (!token) {
      return next(new Error('Thao tac khong hop le. Token bi thieu.'))
    }

    try {
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET)
      socket.userId = decoded.id
      next()
    } catch (error) {
      return next(new Error('Xac thuc Socket that bai: Token da het han hoac khong dung.'))
    }
  })

  io.on('connection', async (socket) => {
    const userId = socket.userId
    userSocketMap[userId] = socket.id

    try {
      await userModel.setOnline(userId)
      io.emit('user_online_status', { userId, isOnline: true })
    } catch (err) {
      console.error('Loi DB khi cap nhat online status:', err.message)
    }

    socket.on('disconnect', async () => {
      delete userSocketMap[userId]
      try {
        await userModel.setOffline(userId)
        io.emit('user_online_status', { userId, isOnline: false, lastActive: new Date() })
      } catch (err) {
        console.error('Loi DB khi cap nhat offline status:', err.message)
      }
    })
  })

  return io
}

const emitToUser = (userId, event, data) => {
  const socketId = userSocketMap[userId]
  if (socketId && io) {
    io.to(socketId).emit(event, data)
  }
}

export const SocketProvider = {
  initSocket,
  emitToUser,
  userSocketMap
}