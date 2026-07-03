import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { FiBox, FiGrid } from 'react-icons/fi'

import { adminAttributeApiService } from '~/services/admin/adminAttributeApiService'
import { AttributeOverviewWidgets } from './AttributeOverviewWidgets'
import { AttributeTable } from './AttributeTable'
import { usePageTitle } from '~/hooks/usePageTitle'

export const AdminAttributesPage = () => {
  usePageTitle(
    'Quản lý Biến thể',
    'Quản lý kích cỡ và màu sắc toàn hệ thống'
  )
  const [sizes, setSizes] = useState([])
  const [colors, setColors] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('sizes')

  const fetchData = async () => {
    try {
      setLoading(true)
      const [sizesRes, colorsRes] = await Promise.all([
        adminAttributeApiService.getSizes(),
        adminAttributeApiService.getColors()
      ])
      setSizes(sizesRes)
      setColors(colorsRes)
    } catch (error) {
      toast.error(error.message || 'Lỗi tải dữ liệu biến thể')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // SIZES
  const handleCreateSize = async (value) => {
    setIsSubmitting(true)
    try {
      const res = await adminAttributeApiService.createSize(value)
      toast.success(res.message)
      await fetchData()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateSize = async (id, value) => {
    setIsSubmitting(true)
    try {
      const res = await adminAttributeApiService.updateSize(id, value)
      toast.success(res.message)
      await fetchData()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteSize = async (id) => {
    try {
      const res = await adminAttributeApiService.deleteSize(id)
      toast.success(res.message)
      await fetchData()
    } catch (error) {
      toast.error(error.message)
    }
  }

  // COLORS
  const handleCreateColor = async (name, code) => {
    setIsSubmitting(true)
    try {
      const res = await adminAttributeApiService.createColor(name, code)
      toast.success(res.message)
      await fetchData()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateColor = async (id, name, code) => {
    setIsSubmitting(true)
    try {
      const res = await adminAttributeApiService.updateColor(id, name, code)
      toast.success(res.message)
      await fetchData()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteColor = async (id) => {
    try {
      const res = await adminAttributeApiService.deleteColor(id)
      toast.success(res.message)
      await fetchData()
    } catch (error) {
      toast.error(error.message)
    }
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-[50vh] gap-4"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full"
        />
        <motion.span
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-sm font-semibold text-gray-400"
        >
          Đang tải dữ liệu biến thể...
        </motion.span>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="space-y-6 pb-10"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="flex items-center gap-4"
      >
        <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
          <FiBox className="text-emerald-500" size={20} />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Quản lý Biến thể</h2>
          <p className="text-xs text-gray-400 font-semibold mt-0.5">Quản lý kích cỡ và màu sắc toàn hệ thống</p>
        </div>
      </motion.div>

      {/* Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
      >
        <AttributeOverviewWidgets sizes={sizes} colors={colors} />
      </motion.div>

      {/* Tabs - Style giống ReviewFilters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="w-full border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('sizes')}
              className={`cursor-pointer flex-1 px-5 py-3.5 text-base font-bold transition-all duration-300 relative flex items-center justify-center gap-2
                ${activeTab === 'sizes'
      ? 'text-emerald-600 font-extrabold'
      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50/50'
    }`}
            >
              <FiBox size={18} />
              Kích cỡ
              <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all duration-300 ${
                activeTab === 'sizes'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {sizes.length}
              </span>
              <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 transition-all duration-300 ${
                activeTab === 'sizes' ? 'scale-x-100' : 'scale-x-0'
              }`} />
            </button>
            <button
              onClick={() => setActiveTab('colors')}
              className={`cursor-pointer flex-1 px-5 py-3.5 text-base font-bold transition-all duration-300 relative flex items-center justify-center gap-2
                ${activeTab === 'colors'
      ? 'text-emerald-600 font-extrabold'
      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50/50'
    }`}
            >
              <FiGrid size={18} />
              Màu sắc
              <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all duration-300 ${
                activeTab === 'colors'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {colors.length}
              </span>
              <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 transition-all duration-300 ${
                activeTab === 'colors' ? 'scale-x-100' : 'scale-x-0'
              }`} />
            </button>
          </div>
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="p-4"
        >
          {activeTab === 'sizes' ? (
            <AttributeTable
              type="size"
              data={sizes}
              onCreate={handleCreateSize}
              onUpdate={handleUpdateSize}
              onDelete={handleDeleteSize}
              isLoading={isSubmitting}
            />
          ) : (
            <AttributeTable
              type="color"
              data={colors}
              onCreate={handleCreateColor}
              onUpdate={handleUpdateColor}
              onDelete={handleDeleteColor}
              isLoading={isSubmitting}
            />
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  )
}