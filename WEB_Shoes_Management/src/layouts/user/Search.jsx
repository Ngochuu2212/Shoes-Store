import { FiSearch } from 'react-icons/fi'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '~/components/ui/tooltip'

export const Search = ({ searchTerm, setSearchTerm, handleSearch }) => {
  return (
    <form onSubmit={handleSearch} className="flex-1 max-w-xl relative hidden md:block">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Tìm kiếm sản phẩm..."
        className="w-full bg-gray-50 border border-gray-200 rounded-full py-2.5 pl-5 pr-12
                                 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-[#e94560]/20
                                 transition-all duration-300 ease-out text-sm"
      />
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-brand-primary rounded-full
                                       flex items-center justify-center text-white
                                       transition-all duration-200 ease-out hover:scale-110 hover:bg-[#c73652] cursor-pointer">
            <FiSearch size={14} />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Tìm kiếm</p>
        </TooltipContent>
      </Tooltip>

    </form>
  )
}