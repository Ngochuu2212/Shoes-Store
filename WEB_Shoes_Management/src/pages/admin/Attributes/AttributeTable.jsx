import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiEdit2, FiTrash2, FiPlus, FiX, FiCheck } from 'react-icons/fi'
import { Input } from '~/components/ui/input'
import { toast } from 'react-toastify'

export const AttributeTable = ({
  type,
  data,
  onCreate,
  onUpdate,
  onDelete,
  isLoading
}) => {
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [editCode, setEditCode] = useState('')
  const [newValue, setNewValue] = useState('')
  const [newCode, setNewCode] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const isColor = type === 'color'

  const handleEdit = (item) => {
    setEditingId(item.id)
    setEditValue(isColor ? item.color_name : item.size_value)
    if (isColor) {
      setEditCode(item.color_code || '#000000')
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditValue('')
    setEditCode('')
  }

  const handleSaveEdit = async (id) => {
    if (!editValue.trim()) {
      toast.error(`Vui lòng nhập ${isColor ? 'tên màu sắc' : 'kích cỡ'}`)
      return
    }
    try {
      if (isColor) {
        await onUpdate(id, editValue.trim(), editCode)
      } else {
        await onUpdate(id, editValue.trim())
      }
      setEditingId(null)
      setEditValue('')
      setEditCode('')
    } catch (error) {
      // Error handled in parent
    }
  }

  const handleCreate = async () => {
    if (!newValue.trim()) {
      toast.error(`Vui lòng nhập ${isColor ? 'tên màu sắc' : 'kích cỡ'}`)
      return
    }
    try {
      if (isColor) {
        await onCreate(newValue.trim(), newCode)
      } else {
        await onCreate(newValue.trim())
      }
      setNewValue('')
      setNewCode('')
      setIsCreating(false)
    } catch (error) {
      // Error handled in parent
    }
  }

  const getColorDisplay = (colorCode) => {
    if (!colorCode) return null
    return (
      <div
        className="w-6 h-6 rounded-full border border-gray-200 shadow-sm"
        style={{ backgroundColor: colorCode }}
      />
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
    >
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">
          {isColor ? 'Danh sách màu sắc' : 'Danh sách kích cỡ'}
        </h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-lg transition-all duration-200 cursor-pointer shadow-sm"
        >
          <FiPlus size={16} />
          Thêm mới
        </motion.button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100 text-xs font-bold text-brand-secondary uppercase tracking-wider">
              <th className="py-3 px-4">ID</th>
              <th className="py-3 px-4">
                {isColor ? 'Tên màu sắc' : 'Kích cỡ'}
              </th>
              {isColor && (
                <th className="py-3 px-4">Mã màu</th>
              )}
              <th className="py-3 px-4 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm font-semibold text-gray-700">
            {/* Row tạo mới */}
            <AnimatePresence>
              {isCreating && (
                <motion.tr
                  initial={{ opacity: 0, y: -20, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -20, height: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="bg-emerald-50/30"
                >
                  <td className="py-3 px-4">
                    <span className="text-gray-400">#</span>
                  </td>
                  <td className="py-3 px-4">
                    <Input
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      placeholder={isColor ? 'Nhập tên màu...' : 'Nhập kích cỡ...'}
                      className="rounded-lg border-gray-200 py-2 text-sm focus-visible:ring-emerald-500/20"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCreate()
                        if (e.key === 'Escape') {
                          setIsCreating(false)
                          setNewValue('')
                          setNewCode('')
                        }
                      }}
                    />
                  </td>
                  {isColor && (
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Input
                          value={newCode}
                          onChange={(e) => setNewCode(e.target.value)}
                          placeholder="#000000"
                          className="rounded-lg border-gray-200 py-2 text-sm focus-visible:ring-emerald-500/20 w-28"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCreate()
                            if (e.key === 'Escape') {
                              setIsCreating(false)
                              setNewValue('')
                              setNewCode('')
                            }
                          }}
                        />
                        <input
                          type="color"
                          value={newCode || '#000000'}
                          onChange={(e) => setNewCode(e.target.value)}
                          className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer p-0"
                        />
                      </div>
                    </td>
                  )}
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleCreate}
                        disabled={isLoading}
                        className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-50 shadow-sm"
                      >
                        <FiCheck size={18} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          setIsCreating(false)
                          setNewValue('')
                          setNewCode('')
                        }}
                        className="p-2 bg-gray-200 hover:bg-gray-300 text-gray-600 rounded-lg transition-all duration-200 cursor-pointer shadow-sm"
                      >
                        <FiX size={18} />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              )}
            </AnimatePresence>

            {/* Danh sách items */}
            {data.length === 0 ? (
              <tr>
                <td colSpan={isColor ? 4 : 3} className="text-center py-8 text-gray-400 font-medium">
                  Chưa có {isColor ? 'màu sắc' : 'kích cỡ'} nào.
                </td>
              </tr>
            ) : (
              data.map((item, index) => {
                const isEditing = editingId === item.id
                const displayValue = isColor ? item.color_name : item.size_value

                return (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    whileHover={{
                      backgroundColor: 'rgba(243, 244, 246, 0.4)',
                      transition: { duration: 0.2 }
                    }}
                    className="transition-colors duration-200"
                  >
                    <td className="py-3 px-4">
                      <span className="text-gray-400">#{item.id}</span>
                    </td>
                    <td className="py-3 px-4">
                      {isEditing ? (
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="rounded-lg border-gray-200 py-2 text-sm focus-visible:ring-emerald-500/20"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(item.id)
                            if (e.key === 'Escape') handleCancelEdit()
                          }}
                        />
                      ) : (
                        <span className="font-bold text-gray-800">{displayValue}</span>
                      )}
                    </td>
                    {isColor && (
                      <td className="py-3 px-4">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={editCode}
                              onChange={(e) => setEditCode(e.target.value)}
                              placeholder="#000000"
                              className="rounded-lg border-gray-200 py-2 text-sm focus-visible:ring-emerald-500/20 w-28"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveEdit(item.id)
                                if (e.key === 'Escape') handleCancelEdit()
                              }}
                            />
                            <input
                              type="color"
                              value={editCode || '#000000'}
                              onChange={(e) => setEditCode(e.target.value)}
                              className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer p-0"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            {getColorDisplay(item.color_code)}
                            <span className="text-xs text-gray-400 font-mono">{item.color_code}</span>
                          </div>
                        )}
                      </td>
                    )}
                    <td className="py-3 px-4 text-center">
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleSaveEdit(item.id)}
                            disabled={isLoading}
                            className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-50 shadow-sm"
                          >
                            <FiCheck size={18} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleCancelEdit}
                            className="p-2 bg-gray-200 hover:bg-gray-300 text-gray-600 rounded-lg transition-all duration-200 cursor-pointer shadow-sm"
                          >
                            <FiX size={18} />
                          </motion.button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1, backgroundColor: '#3b82f6', color: '#fff' }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEdit(item)}
                            className="p-2 bg-blue-50 text-blue-600 rounded-lg transition-all duration-200 cursor-pointer shadow-sm"
                          >
                            <FiEdit2 size={18} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1, backgroundColor: '#ef4444', color: '#fff' }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onDelete(item.id)}
                            className="p-2 bg-red-50 text-red-600 rounded-lg transition-all duration-200 cursor-pointer shadow-sm"
                          >
                            <FiTrash2 size={18} />
                          </motion.button>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}