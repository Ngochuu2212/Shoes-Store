import { useState } from 'react'
import { FaFacebook, FaInstagram, FaPhone, FaEnvelope } from 'react-icons/fa'
import { MdLocationOn } from 'react-icons/md'
import { FiX } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'

const SOCIAL_LINKS = [
  { icon: FaFacebook, href: 'https://www.facebook.com/huu.phamngoc.52' },
  { icon: FaInstagram, href: 'https://www.instagram.com/nqochuuwx/' }
]

const MODAL_CONTENTS = {
  'Giới thiệu ShoesStore': {
    title: 'Giới thiệu ShoesStore',
    content: 'ShoesStore là nền tảng mua sắm giày dép trực tuyến hàng đầu tại Việt Nam, kết nối trực tiếp khách hàng với các cửa hàng uy tín. Chúng tôi cam kết cung cấp các sản phẩm chất lượng cao, dịch vụ vận chuyển nhanh chóng và hệ thống thanh toán an toàn, bảo mật tuyệt đối.'
  },
  'Tuyển dụng': {
    title: 'Cơ hội nghề nghiệp',
    content: 'ShoesStore luôn tìm kiếm những tài năng trẻ năng động, sáng tạo và nhiệt huyết. Chúng tôi cung cấp môi trường làm việc cởi mở, cơ hội thăng tiến rộng mở và mức lương cạnh tranh. Gửi CV của bạn về mail: phamngochuu3101@gmail.com để tham gia cùng chúng tôi!'
  },
  'Chính sách bảo mật': {
    title: 'Chính sách bảo mật',
    content: 'ShoesStore cam kết bảo vệ thông tin cá nhân của bạn. Mọi dữ liệu thu thập (như email, số điện thoại, địa chỉ) đều được mã hóa bằng công nghệ SSL tiên tiến và chỉ sử dụng cho mục đích vận hành đơn hàng, cải thiện dịch vụ. Chúng tôi không bao giờ chia sẻ thông tin của bạn với bên thứ ba mà không có sự đồng ý của bạn.'
  },
  'Trung tâm trợ giúp': {
    title: 'Trung tâm trợ giúp',
    content: 'Bạn gặp khó khăn trong quá trình mua sắm? Vui lòng liên hệ hotline hỗ trợ: 0939507217 hoặc gửi email đến phamngochuu3101@gmail.com. Đội ngũ CSKH của chúng tôi sẵn sàng giải đáp thắc mắc của bạn 24/7.'
  },
  'Hướng dẫn mua hàng': {
    title: 'Hướng dẫn mua hàng',
    content: `Các bước mua sắm tại ShoesStore:
1. Chọn sản phẩm yêu thích và kích cỡ phù hợp.
2. Thêm sản phẩm vào giỏ hàng.
3. Nhấp chọn "Thanh toán" tại trang Giỏ hàng.
4. Nhập đầy đủ thông tin giao nhận & chọn phương thức thanh toán tương ứng.
5. Xác nhận đặt hàng và theo dõi đơn hàng.`
  },
  'Chính sách đổi trả': {
    title: 'Chính sách đổi trả hàng',
    content: 'ShoesStore hỗ trợ đổi trả miễn phí trong vòng 7 ngày kể từ khi nhận hàng đối với sản phẩm còn nguyên tem mác, chưa qua sử dụng và bị lỗi do nhà sản xuất hoặc giao sai mẫu mã/kích thước.'
  },
  'Điều khoản sử dụng': {
    title: 'Điều khoản sử dụng',
    content: 'Chào mừng bạn đến với ShoesStore. Bằng việc truy cập và sử dụng dịch vụ của chúng tôi, bạn đồng ý tuân thủ các điều khoản, chính sách hoạt động của hệ thống. Nghiêm cấm mọi hành vi gian lận, spam hoặc can thiệp trái phép vào hệ thống.'
  },
  'Cookie': {
    title: 'Chính sách Cookie',
    content: 'Chúng tôi sử dụng cookie để lưu trữ phiên đăng nhập, cá nhân hóa trải nghiệm mua sắm và phân tích lưu lượng truy cập nhằm nâng cao chất lượng dịch vụ trên website ShoesStore.'
  }
}

export const Footer = () => {
  const [activeItem, setActiveItem] = useState(null)

  const handleOpenModal = (itemName) => {
    const data = MODAL_CONTENTS[itemName]
    if (data) setActiveItem(data)
  }

  return (
    <footer className="bg-gray-900 text-gray-300 py-10 w-full relative z-25">
      <div className="app-container">

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">

          {/* Cột 1: Logo */}
          <div className="space-y-4 sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 text-white">
              <div className="w-10 h-10 bg-brand-primary rounded-full flex items-center justify-center text-white font-bold text-xl
                              transition-transform duration-300 ease-out hover:scale-110 cursor-pointer">
                S
              </div>
              <span className="text-2xl font-extrabold">ShoesStore</span>
            </div>
            <p className="text-base leading-relaxed max-w-xs text-gray-400 text-justify">
              Nền tảng mua sắm giày dép trực tuyến hàng đầu, mang đến cho bạn những sản phẩm chất lượng với giá tốt nhất.
            </p>
            <div className="flex gap-2">
              {SOCIAL_LINKS.map(({ icon: Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center text-white
                             transition-all duration-300 ease-out hover:bg-brand-primary hover:text-white
                             hover:scale-110 hover:shadow-md hover:shadow-[#e94560]/30 active:scale-95 cursor-pointer"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Cột 2: Về chúng tôi */}
          <div className="space-y-4">
            <h3 className="font-bold text-white">Về Chúng Tôi</h3>
            <ul className="text-sm space-y-3">
              {['Giới thiệu ShoesStore', 'Tuyển dụng', 'Chính sách bảo mật'].map((item) => (
                <li
                  key={item}
                  onClick={() => handleOpenModal(item)}
                  className="text-base cursor-pointer transition-all duration-200 ease-out hover:text-brand-primary hover:translate-x-1"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Cột 3: Chăm sóc khách hàng */}
          <div className="space-y-4">
            <h3 className="font-bold text-white">Chăm Sóc Khách Hàng</h3>
            <ul className="text-base space-y-3">
              {['Trung tâm trợ giúp', 'Hướng dẫn mua hàng', 'Chính sách đổi trả'].map((item) => (
                <li
                  key={item}
                  onClick={() => handleOpenModal(item)}
                  className="cursor-pointer transition-all duration-200 ease-out hover:text-brand-primary hover:translate-x-1"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Cột 4: Liên hệ */}
          <div className="space-y-4">
            <h3 className="font-bold text-white">Liên Hệ</h3>
            <div className="text-base space-y-3">
              <div className="flex gap-2 items-start group cursor-pointer">
                <MdLocationOn
                  size={18}
                  className="text-brand-primary shrink-0 transition-transform duration-300 group-hover:scale-125"
                />
                <p className="transition-colors duration-200 group-hover:text-white">
                  47 đường số 3, Cát Lái, HCM.
                </p>
              </div>
              <div className="flex gap-2 items-center group cursor-pointer">
                <FaPhone
                  size={15}
                  className="text-brand-primary transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12"
                />
                <p className="transition-colors duration-200 group-hover:text-white">0939507217</p>
              </div>
              <div className="flex gap-2 items-center group cursor-pointer">
                <FaEnvelope
                  size={15}
                  className="text-brand-primary transition-transform duration-300 group-hover:scale-125"
                />
                <p className="transition-colors duration-200 group-hover:text-white break-all">
                  phamngochuu3101@gmail.com
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-base text-gray-500">
          <p>© 2026 ShoesStore. Tất cả quyền được bảo lưu.</p>
          <div className="flex gap-4">
            {['Điều khoản sử dụng', 'Chính sách bảo mật', 'Cookie'].map((item) => (
              <span
                key={item}
                onClick={() => handleOpenModal(item)}
                className="cursor-pointer transition-colors duration-200 hover:text-white"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* Reusable modal for footer contents */}
      <AnimatePresence>
        {activeItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setActiveItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white text-gray-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 to-amber-500" />
              
              <div className="flex items-center justify-between mb-4 mt-2">
                <h3 className="text-lg font-black text-gray-800">{activeItem.title}</h3>
                <button
                  onClick={() => setActiveItem(null)}
                  className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  <FiX size={18} />
                </button>
              </div>

              <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line mt-2 mb-4">
                {activeItem.content}
              </div>

              <button
                onClick={() => setActiveItem(null)}
                className="w-full mt-2 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-2xl font-bold text-sm shadow-md shadow-orange-100 transition-all duration-200 cursor-pointer"
              >
                Đóng
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </footer>
  )
}