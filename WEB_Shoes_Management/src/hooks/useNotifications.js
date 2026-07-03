import { useState, useEffect, useCallback } from 'react'
import { notificationApiService } from '~/services/notification/notificationApiService'

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedNotification, setSelectedNotification] = useState(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const fetchNotifications = async (pageNum = 1, append = false) => {
    try {
      if (append) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }
      const res = await notificationApiService.getNotifications(pageNum, 20)

      const unread = res.filter(n => !n.is_read).length
      setUnreadCount(unread)

      if (append) {
        setNotifications(prev => [...prev, ...res])
      } else {
        setNotifications(res)
        if (res.length > 0 && !selectedNotification) {
          setSelectedNotification(res[0])
        }
      }

      setHasMore(res.length === 20)
    } catch (error) {
      console.error('Lỗi tải thông báo:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  // Hàm refresh lại danh sách
  const refetch = useCallback(async () => {
    setPage(1)
    setHasMore(true)
    await fetchNotifications(1, false)
  }, [])

  useEffect(() => {
    fetchNotifications(1, false)
  }, [])

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchNotifications(nextPage, true)
    }
  }, [loadingMore, hasMore, page])

  const markAllAsRead = async () => {
    try {
      await notificationApiService.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Lỗi đánh dấu đã đọc:', error)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      await notificationApiService.markAsRead(notificationId)
      setNotifications(prev => prev.map(n =>
        n.id === notificationId ? { ...n, is_read: true } : n
      ))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Lỗi đánh dấu đã đọc:', error)
    }
  }

  const selectNotification = (notification) => {
    setSelectedNotification(notification)
    if (!notification.is_read) {
      markAsRead(notification.id)
    }
  }

  return {
    notifications,
    loading,
    selectedNotification,
    unreadCount,
    hasMore,
    loadingMore,
    loadMore,
    markAllAsRead,
    selectNotification,
    refetch
  }
}