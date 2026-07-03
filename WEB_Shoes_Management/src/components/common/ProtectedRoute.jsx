import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'

// 1. Chỉ cho phép truy cập ĐÃ ĐĂNG NHẬP. Chưa đăng nhập đá về /login
export const ProtectedRoute = () => {
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated)

  // Nếu đã xác thực thành công, cho phép đi tiếp vào các Route con (qua thẻ <Outlet />)
  // Nếu chưa đăng nhập, điều hướng ép buộc người dùng quay lại trang Đăng nhập
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

// 2. Chặn người dùng quay lại các trang Auth khi ĐÃ ĐĂNG NHẬP (Chặn Login/Register lặp lại)
export const RejectedRoute = () => {
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated)

  // Nếu đã đăng nhập rồi mà cố vào /login, /register -> Đá bay về trang chủ /
  return !isAuthenticated ? <Outlet /> : <Navigate to="/" replace />
}