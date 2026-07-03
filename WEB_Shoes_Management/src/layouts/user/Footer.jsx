import { FaFacebook, FaInstagram, FaPhone } from 'react-icons/fa'
import { MdLocationOn } from 'react-icons/md'

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-10 w-full">
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
              {[FaFacebook, FaInstagram].map((Icon, i) => (
                <button
                  key={i}
                  className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center text-white
                             transition-all duration-300 ease-out hover:bg-brand-primary hover:text-white
                             hover:scale-110 hover:shadow-md hover:shadow-[#e94560]/30 active:scale-95 cursor-pointer"
                >
                  <Icon size={16} />
                </button>
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
                  123 Đường Nguyễn Trãi, Quận 1, TP. Hồ Chí Minh
                </p>
              </div>
              <div className="flex gap-2 items-center group cursor-pointer">
                <FaPhone
                  size={15}
                  className="text-brand-primary transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12"
                />
                <p className="transition-colors duration-200 group-hover:text-white">1900 1234 (1000đ/phút)</p>
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
                className="cursor-pointer transition-colors duration-200 hover:text-white"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

      </div>
    </footer>
  )
}