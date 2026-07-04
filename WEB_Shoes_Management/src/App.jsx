import { Routes, Route } from 'react-router-dom'

// USER PAGES
import { HomePage } from '~/pages/user/HomePage/HomePage'
import { ProductDetailPage } from '~/pages/user/ProductDetail/ProductDetailPage'
import { ProductsPage } from '~/pages/user/Products/ProductsPage'
import { ProfilePage } from '~/pages/user/Profile/ProfilePage'
import { CartPage } from '~/pages/user/Cart/CartPage'
import { OrderSuccessPage } from '~/pages/user/OrderSuccess/OrderSuccessPage'
import { OrderTrackingPage } from '~/pages/user/OrderHistory/OrderTrackingPage'
import { OrderDetailPage } from '~/pages/user/OrderDetail/OrderDetailPage'
import { StoreDetailPage } from '~/pages/user/StoreDetail/StoreDetailPage'
import { ReviewOrderPage } from '~/pages/user/Review/ReviewOrderPage'

// VENDOR PAGES
import { RegisterStorePage } from '~/pages/vendor/RegisterStore/RegisterStorePage'
import { VendorDashboardPage } from '~/pages/vendor/Dashboard/VendorDashboardPage'
import { VendorProductsPage } from '~/pages/vendor/Products/VendorProductsPage'
import { ProductFormPage } from '~/pages/vendor/Products/ProductForm/ProductFormPage'
import { VendorProductDetailPage } from '~/pages/vendor/Products/ProductDetail/VendorProductDetailPage'
import { VendorFavoritesPage } from '~/pages/vendor/Favorites/VendorFavoritesPage'
import { VendorPromotionsPage } from '~/pages/vendor/Promotions/VendorPromotionsPage'
import { PromotionFormPage } from '~/pages/vendor/Promotions/PromotionForm/PromotionFormPage'
import { PromotionDetailPage } from '~/pages/vendor/Promotions/PromotionDetail/PromotionDetailPage'
import { VendorReviewsPage } from '~/pages/vendor/Reviews/VendorReviewsPage'
import { ReviewDetailPage } from '~/pages/vendor/Reviews/ReviewDetail/ReviewDetailPage'
import { VendorPayoutPage } from '~/pages/vendor/Payout/VendorPayoutPage'
import { VendorOrdersPage } from '~/pages/vendor/Orders/VendorOrdersPage'
import { VendorOrderDetailPage } from '~/pages/vendor/Orders/OrderDetail/VendorOrderDetailPage'
import { VendorProfileAccount } from '~/pages/vendor/Profile/Account/VendorProfileAccount'
import { VendorProfileStore } from '~/pages/vendor/Profile/Store/VendorProfileStore'
import { VendorChatPage } from '~/pages/vendor/Chat/VendorChatPage'
import { AllNotificationsPage } from '~/pages/common/AllNotificationsPage'
import { VendorAppealDetailPage } from '~/pages/vendor/Appeals/VendorAppealDetailPage'
import { VendorLayout } from '~/layouts/vendor/VendorLayout'

// MANAGER PAGES
import { ManagerLayout } from '~/layouts/manager/ManagerLayout'
import { ManagerStoresPage } from '~/pages/manager/Store/ManagerStoresPage'
import { ManagerStoreDetailPage } from '~/pages/manager/Store/StoreDetail/ManagerStoreDetailPage'
import { ManagerProductDetailPage } from '~/pages/manager/Store/StoreDetail/ProductDetail/ManagerProductDetailPage'
import { ManagerProductsPage } from '~/pages/manager/Products/ManagerProductsPage'
import { ManagerReviewsPage } from '~/pages/manager/Reviews/ManagerReviewsPage'
import { ManagerReviewDetailPage } from '~/pages/manager/Reviews/ReviewDetail/ManagerReviewDetailPage'
import { ManagerAppealsPage } from '~/pages/manager/Appeals/ManagerAppealsPage'
import { ManagerAppealDetailPage } from '~/pages/manager/Appeals/AppealDetail/ManagerAppealDetailPage'
import { ManagerProfileAccount } from '~/pages/manager/Profile/ManagerProfileAccount'
import { ManagerPromotionsPage } from '~/pages/manager/Promotions/ManagerPromotionsPage'
import { ManagerPromotionFormPage } from '~/pages/manager/Promotions/PromotionForm/ManagerPromotionFormPage'
import { ManagerPromotionDetailPage } from '~/pages/manager/Promotions/PromotionDetail/ManagerPromotionDetailPage'

// ADMIN PAGES
import { AdminLayout } from '~/layouts/admin/AdminLayout'
import { AdminDashboardPage } from '~/pages/admin/Dashboard/AdminDashboardPage'
import { AdminUsersPage } from '~/pages/admin/Users/AdminUsersPage'
import { AdminUserDetailPage } from '~/pages/admin/Users/UserDetail/AdminUserDetailPage'
import { UserFormPage } from '~/pages/admin/Users/UserForm/UserFormPage'
import { AdminStoresPage } from '~/pages/admin/Stores/AdminStoresPage'
import { AdminStoreDetailPage } from '~/pages/admin/Stores/StoreDetail/AdminStoreDetailPage'
import { AdminStoreFormPage } from '~/pages/admin/Stores/StoreForm/AdminStoreFormPage'
import { AdminCategoriesPage } from '~/pages/admin/Categories/AdminCategoriesPage'
import { CategoryFormPage } from '~/pages/admin/Categories/CategoryForm/CategoryFormPage'
import { AdminCategoryDetailPage } from '~/pages/admin/Categories/CategoryDetail/AdminCategoryDetailPage'
import { AdminAttributesPage } from '~/pages/admin/Attributes/AdminAttributesPage'
import { AdminOrdersPage } from '~/pages/admin/Orders/AdminOrdersPage'
import { AdminOrderDetailPage } from '~/pages/admin/Orders/OrderDetail/AdminOrderDetailPage'
import { AdminPayoutsPage } from '~/pages/admin/Payouts/AdminPayoutsPage'
import { AdminPayoutDetailPage } from '~/pages/admin/Payouts/PayoutDetail/AdminPayoutDetailPage'
import { AdminSystemSettingsPage } from '~/pages/admin/SystemSettings/AdminSystemSettingsPage'
import { AdminProfilePage } from '~/pages/admin/Profile/AdminProfilePage'

// SHIPPER PAGES
import { ShipperLayout } from '~/layouts/shipper/ShipperLayout'
import { ShipperDashboardPage } from '~/pages/shipper/Dashboard/ShipperDashboardPage'
import { ShipperAvailableOrdersPage } from '~/pages/shipper/Orders/ShipperAvailableOrdersPage'
import { ShipperMyDeliveriesPage } from '~/pages/shipper/Orders/ShipperMyDeliveriesPage'
import { ShipperHistoryPage } from '~/pages/shipper/Orders/ShipperHistoryPage'

// AUTH PAGES
import { RegisterPage } from '~/pages/auth/RegisterPage/RegisterPage'
import { VerifyOtpPage } from '~/pages/auth/VerifyOtpPage/VerifyOtpPage'
import { LoginPage } from '~/pages/auth/LoginPage/LoginPage'
import { ForgotPasswordPage } from '~/pages/auth/ForgotPasswordPage/ForgotPasswordPage'
import { ResetPasswordPage } from '~/pages/auth/ResetPasswordPage/ResetPasswordPage'

// LAYOUTS & COMPONENTS
import { MainLayout } from '~/layouts/user/MainLayout'
import { ProtectedRoute, RejectedRoute } from '~/components/common/ProtectedRoute'
import { PageTransition } from '~/components/common/PageTransition'
import { ChatWidget } from '~/components/chat/ChatWidget'
import 'react-toastify/dist/ReactToastify.css'

const App = () => {
  return (
    <div className="app-wrapper">
      <Routes>

        {/* KHU VỰC CỦA NGƯỜI DÙNG */}
        <Route element={<MainLayout />}>

          {/* Các trang ai cũng xem được */}
          <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
          <Route path="/product/:slug" element={<PageTransition><ProductDetailPage /></PageTransition>} />
          <Route path="/products" element={<PageTransition><ProductsPage /></PageTransition>} />
          <Route path="/store/:id" element={<PageTransition><StoreDetailPage /></PageTransition>} />

          {/* Các trang bắt buộc Đăng nhập */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<PageTransition><ProfilePage /></PageTransition>} />
            <Route path="/cart" element={<PageTransition><CartPage /></PageTransition>} />
            <Route path="/order-success" element={<PageTransition><OrderSuccessPage /></PageTransition>} />
            <Route path="/orders" element={<PageTransition><OrderTrackingPage /></PageTransition>} />
            <Route path="/orders/:orderId" element={<PageTransition><OrderDetailPage /></PageTransition>} />
            <Route path="/orders/:orderId/review" element={<PageTransition><ReviewOrderPage /></PageTransition>} />
            <Route path="/register-store" element={<PageTransition><RegisterStorePage /></PageTransition>} />
            <Route path="/notifications" element={<AllNotificationsPage />} />
          </Route>

        </Route>

        {/* KHU VỰC CỦA NGƯỜI BÁN*/}
        <Route element={<ProtectedRoute />}>
          <Route path="/vendor" element={<VendorLayout />}>
            {/* Dashboard */}
            <Route path="dashboard" element={<VendorDashboardPage />} />

            {/* Profile */}
            <Route path="profile-account" element={<VendorProfileAccount />} />
            <Route path="profile-store" element={<VendorProfileStore />} />

            {/* Promotion */}
            <Route path="products" element={<VendorProductsPage />} />
            <Route path="products/add" element={<ProductFormPage />} />
            <Route path="products/edit/:id" element={<ProductFormPage />} />
            <Route path="products/detail/:id" element={<VendorProductDetailPage />} />

            {/* Favorite */}
            <Route path="favorites" element={<VendorFavoritesPage />} />

            {/* Order */}
            <Route path="orders" element={<VendorOrdersPage />} />
            <Route path="orders/detail/:id" element={<VendorOrderDetailPage />} />

            {/* Promotion */}
            <Route path="promotions" element={<VendorPromotionsPage />} />
            <Route path="promotions/add" element={<PromotionFormPage />} />
            <Route path="promotions/edit/:id" element={<PromotionFormPage />} />
            <Route path="promotions/detail/:id" element={<PromotionDetailPage />} />

            {/* Review */}
            <Route path="reviews" element={<VendorReviewsPage />} />
            <Route path="reviews/detail/:id" element={<ReviewDetailPage />} />

            {/* Payout */}
            <Route path="payouts" element={<VendorPayoutPage />} />

            {/* Chat */}
            <Route path="chat" element={<VendorChatPage />}
            />
            {/* Notification */}
            <Route path="notifications" element={<AllNotificationsPage />} />

            {/* Appeal */}
            <Route path="appeals/:id" element={<VendorAppealDetailPage />} />
          </Route>
        </Route>

        {/* MANAGER*/}
        <Route path="/manager" element={<ManagerLayout />}>
          <Route path="profile" element={<ManagerProfileAccount />} />
          {/* Quản lý Cửa hàng */}
          <Route path="stores" element={<ManagerStoresPage />} />
          <Route path="stores/:id" element={<ManagerStoreDetailPage />} />

          {/* Quản lý sản phẩm */}
          <Route path="products" element={<ManagerProductsPage />} />
          <Route path="products/detail/:id" element={<ManagerProductDetailPage />} />

          {/* Quản lý đánh giá */}
          <Route path="reviews" element={<ManagerReviewsPage />} />
          <Route path="reviews/:id" element={<ManagerReviewDetailPage />} />

          {/* Quản lý appeal */}
          <Route path="appeals" element={<ManagerAppealsPage />} />
          <Route path="appeals/:id" element={<ManagerAppealDetailPage />} />

          {/* Quản lý mã giảm giá hệ thống */}
          <Route path="promotions" element={<ManagerPromotionsPage />} />
          <Route path="promotions/add" element={<ManagerPromotionFormPage />} />
          <Route path="promotions/edit/:id" element={<ManagerPromotionFormPage />} />
          <Route path="promotions/detail/:id" element={<ManagerPromotionDetailPage />} />

          {/* Thông báo */}
          <Route path="notifications" element={<AllNotificationsPage />} />
        </Route>

        {/* Admin */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="profile" element={<AdminProfilePage />} />

          {/* Dashboard */}
          <Route path="dashboard" element={<AdminDashboardPage />} />

          {/* Người dùng */}
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="users/add" element={<UserFormPage />} />
          <Route path="users/edit/:id" element={<UserFormPage />} />
          <Route path="users/:id" element={<AdminUserDetailPage />} />

          {/* Cửa hàng */}
          <Route path="stores" element={<AdminStoresPage />} />
          <Route path="stores/add" element={<AdminStoreFormPage />} />
          <Route path="stores/:id" element={<AdminStoreDetailPage />} />

          {/* Danh mục */}
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="categories/add" element={<CategoryFormPage />} />
          <Route path="categories/edit/:id" element={<CategoryFormPage />} />
          <Route path="categories/:id" element={<AdminCategoryDetailPage />} />

          {/* Attributes (Sizes & Colors) */}
          <Route path="attributes" element={<AdminAttributesPage />} />

          {/* Đơn hàng */}
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="orders/:orderId" element={<AdminOrderDetailPage />} />

          {/* Tài chính */}
          <Route path="payouts" element={<AdminPayoutsPage />} />
          <Route path="payouts/:id" element={<AdminPayoutDetailPage />} />

          {/* Cài đặt */}
          <Route path="settings" element={<AdminSystemSettingsPage />} />

          {/* Thông báo */}
          <Route path="notifications" element={<AllNotificationsPage />} />
        </Route>

        {/* SHIPPER */}
        <Route element={<ProtectedRoute />}>
          <Route path="/shipper" element={<ShipperLayout />}>
            <Route path="dashboard" element={<ShipperDashboardPage />} />
            <Route path="available-orders" element={<ShipperAvailableOrdersPage />} />
            <Route path="my-deliveries" element={<ShipperMyDeliveriesPage />} />
            <Route path="history" element={<ShipperHistoryPage />} />
            <Route path="notifications" element={<AllNotificationsPage />} />
          </Route>
        </Route>

        {/* KHU VỰC XÁC THỰC (CHẶN KHI ĐÃ ĐĂNG NHẬP) */}
        <Route element={<RejectedRoute />}>
          <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
          <Route path="/verify-otp" element={<PageTransition><VerifyOtpPage /></PageTransition>} />
          <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
          <Route path="/forgot-password" element={<PageTransition><ForgotPasswordPage /></PageTransition>} />
          <Route path="/reset-password" element={<PageTransition><ResetPasswordPage /></PageTransition>} />
        </Route>

      </Routes>

      {/* Widget chat */}
      <ChatWidget />
    </div>
  )
}

export default App