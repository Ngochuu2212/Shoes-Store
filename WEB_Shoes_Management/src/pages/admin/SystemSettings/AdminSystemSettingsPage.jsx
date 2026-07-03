import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { FiSettings } from 'react-icons/fi'

import { adminSystemSettingApiService } from '~/services/admin/adminSystemSettingApiService'
import { SystemSettingsOverview } from './SystemSettingsOverview'
import { SystemSettingsForm } from './SystemSettingsForm'
import { usePageTitle } from '~/hooks/usePageTitle'

export const AdminSystemSettingsPage = () => {
  usePageTitle(
    'Cài đặt hệ thống',
    'Quản lý cấu hình vận hành toàn hệ thống'
  )
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const res = await adminSystemSettingApiService.getSystemSettings()
      setSettings(res)
    } catch (error) {
      toast.error(error.message || 'Lỗi tải cấu hình hệ thống')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
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
          Đang tải cấu hình hệ thống...
        </motion.span>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
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
          <FiSettings className="text-emerald-500" size={20} />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Cài đặt hệ thống</h2>
          <p className="text-xs text-gray-400 font-semibold mt-0.5">Quản lý cấu hình vận hành toàn hệ thống</p>
        </div>
      </motion.div>

      {/* Overview Widgets */}
      <SystemSettingsOverview settings={settings} />

      {/* Form */}
      <SystemSettingsForm settings={settings} onUpdate={fetchSettings} />
    </motion.div>
  )
}