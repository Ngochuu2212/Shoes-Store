import { Link } from 'react-router-dom'

export const Nav = () => {
  return (
    <nav className="flex items-center gap-8 text-base font-semibold text-gray-600">
      {[
        { name: 'Trang chủ', path: '/' },
        { name: 'Sản phẩm', path: '/products' },
        { name: 'Đơn hàng', path: '/orders' }
      ].map((item) => {
        const isActive = location.pathname === item.path || (item.path === '/products' && location.pathname.startsWith('/product/'))

        return (
          <Link
            key={item.name}
            to={item.path}
            className={`relative py-2 transition-colors duration-300 ease-out
                            ${isActive ? 'text-brand-primary' : 'hover:text-brand-primary'}
                            after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-brand-primary
                            after:transition-all after:duration-300 after:ease-out
                            ${isActive ? 'after:w-full' : 'after:w-0 hover:after:w-full'}`}
          >
            {item.name}
          </Link>
        )
      })}
    </nav>
  )
}