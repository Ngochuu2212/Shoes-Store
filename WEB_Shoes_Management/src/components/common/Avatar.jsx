import { getImageUrl } from '~/utils/formatters'

// Danh sách màu nền đẹp cho avatar
const AVATAR_COLORS = [
  'bg-red-500',
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-teal-500',
  'bg-orange-500',
  'bg-cyan-500',
  'bg-rose-500',
  'bg-violet-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-lime-500',
  'bg-fuchsia-500',
  'bg-sky-500',
  'bg-amber-600',
  'bg-rose-600',
  'bg-emerald-600'
]

// Hàm tạo màu ngẫu nhiên dựa trên tên (ổn định, không đổi khi re-render)
const getColorFromName = (name) => {
  if (!name) return AVATAR_COLORS[0]

  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length
  return AVATAR_COLORS[index]
}

const getInitials = (fullname) => {
  if (!fullname) return '?'

  const words = fullname.trim().split(' ')
  if (words.length === 0) return '?'
  if (words.length === 1) {
    return fullname.substring(0, 2).toUpperCase()
  }
  const first = words[0].charAt(0)
  const last = words[words.length - 1].charAt(0)
  return (first + last).toUpperCase()
}

export const Avatar = ({
  user,
  src,
  alt = 'Avatar',
  size = 'w-14 h-14',
  textSize = 'text-lg',
  className = '',
  rounded = 'rounded-full',
  bgColor = null // Có thể truyền màu tùy chỉnh
}) => {
  const avatarSrc = src || getImageUrl(user?.avatar)
  const fullname = user?.fullname || alt || 'User'
  const initials = getInitials(fullname)

  const hasValidAvatar = avatarSrc &&
    avatarSrc !== 'https://placehold.co/100x100?text=User' &&
    !avatarSrc.includes('placehold')

  if (hasValidAvatar) {
    return (
      <img
        src={avatarSrc}
        alt={fullname}
        className={`${size} ${rounded} object-cover ${className}`}
      />
    )
  }

  // Lấy màu ngẫu nhiên dựa trên tên
  const randomColor = getColorFromName(fullname)
  const finalBgColor = bgColor || randomColor

  return (
    <div className={`${size} ${rounded} flex items-center justify-center ${finalBgColor} text-white font-bold ${textSize} ${className}`}>
      {initials}
    </div>
  )
}