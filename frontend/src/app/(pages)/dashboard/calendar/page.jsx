'use client'
import React, { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FiCalendar, FiChevronLeft, FiChevronRight, FiClock, FiLoader, FiX } from 'react-icons/fi'
import { showErrorToast } from '@/utils/toast'
import { fetchActivityLogs, fetchDailyActivityCounts, normalizeLog } from '@/utils/backendApi'

function formatDateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function monthRangeUtc(date) {
  const y = date.getFullYear()
  const m = date.getMonth()
  const start = new Date(Date.UTC(y, m, 1)).toISOString()
  const end = new Date(Date.UTC(y, m + 1, 0, 23, 59, 59)).toISOString()
  return { start, end }
}

export default function CalendarViewPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [isLoadingDays, setIsLoadingDays] = useState(true)
  const [isLoadingDayLogs, setIsLoadingDayLogs] = useState(false)
  const [dailyMap, setDailyMap] = useState({})
  const [selectedDayLogs, setSelectedDayLogs] = useState([])
  const [error, setError] = useState('')

  const monthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`

  useEffect(() => {
    let mounted = true

    async function loadMonthData() {
      setIsLoadingDays(true)
      setError('')

      try {
        const { start, end } = monthRangeUtc(currentDate)
        const response = await fetchDailyActivityCounts({ from: start, to: end })
        if (!mounted) return

        const byDate = {}
        ;(response.days || []).forEach((entry) => {
          byDate[entry.date] = entry
        })
        setDailyMap(byDate)
      } catch (err) {
        if (!mounted) return
        const message = err?.response?.data?.error || 'Failed to load calendar activity data'
        setError(message)
        showErrorToast(message)
      } finally {
        if (mounted) setIsLoadingDays(false)
      }
    }

    loadMonthData()
    return () => {
      mounted = false
    }
  }, [monthKey, currentDate])

  const daysMeta = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    return { firstDay, daysInMonth }
  }, [currentDate])

  const handleDateClick = async (day) => {
    const dateKey = formatDateKey(currentDate.getFullYear(), currentDate.getMonth(), day)
    if (!dailyMap[dateKey]) return

    setSelectedDate(dateKey)
    setShowModal(true)
    setIsLoadingDayLogs(true)

    try {
      const response = await fetchActivityLogs({
        from: `${dateKey}T00:00:00Z`,
        to: `${dateKey}T23:59:59Z`,
        limit: 300,
      })
      setSelectedDayLogs((response.items || []).map(normalizeLog))
    } catch (err) {
      const message = err?.response?.data?.error || 'Failed to load selected day logs'
      showErrorToast(message)
      setSelectedDayLogs([])
    } finally {
      setIsLoadingDayLogs(false)
    }
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
              <FiCalendar className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Calendar View</h1>
              <p className="text-gray-600">Daily activity heatmap from MongoDB logs</p>
            </div>
          </div>
        </div>

        {error && <div className="mb-4 text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-6">
            <div className="flex items-center justify-between">
              <button onClick={previousMonth} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <FiChevronLeft size={24} />
              </button>
              <h2 className="text-2xl font-bold">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <button onClick={nextMonth} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <FiChevronRight size={24} />
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="text-center font-semibold text-gray-600 text-sm py-2">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: daysMeta.firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {Array.from({ length: daysMeta.daysInMonth }).map((_, index) => {
                const day = index + 1
                const dateKey = formatDateKey(currentDate.getFullYear(), currentDate.getMonth(), day)
                const entry = dailyMap[dateKey]
                const count = entry?.count || 0
                const hasActivity = count > 0

                return (
                  <motion.button
                    key={dateKey}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleDateClick(day)}
                    className={`aspect-square relative rounded-lg border-2 transition-all ${
                      hasActivity
                        ? 'border-cyan-500 bg-cyan-50 hover:bg-cyan-100 cursor-pointer'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center h-full">
                      <span className={`text-lg font-semibold ${hasActivity ? 'text-cyan-700' : 'text-gray-900'}`}>{day}</span>
                      {hasActivity && (
                        <>
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full" />
                          <span className="absolute top-1 right-1 min-w-5 h-5 px-1 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                            {count}
                          </span>
                        </>
                      )}
                    </div>
                  </motion.button>
                )
              })}
            </div>

            {isLoadingDays && (
              <div className="mt-5 text-gray-600 text-sm inline-flex items-center gap-2">
                <FiLoader className="animate-spin" size={16} />
                Loading daily counts...
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">Activities on {selectedDate}</h3>
                  <p className="text-cyan-100 mt-1">{selectedDayLogs.length} events</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                  <FiX size={24} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)] custom-scrollbar">
                {isLoadingDayLogs ? (
                  <div className="py-10 text-center text-gray-600 inline-flex items-center gap-2">
                    <FiLoader className="animate-spin" size={18} />
                    Loading day events...
                  </div>
                ) : selectedDayLogs.length > 0 ? (
                  <div className="space-y-3">
                    {selectedDayLogs.map((log) => (
                      <div key={log._id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-gray-900 capitalize">{String(log.activity || 'unknown').replace(/_/g, ' ')}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              Track #{log.track_id ?? 'N/A'} • Confidence {((log.confidence || 0) * 100).toFixed(1)}%
                            </p>
                            <p className="text-sm text-gray-500 mt-1">Frame: {log.frame_number ?? 'N/A'}</p>
                          </div>
                          <span className="text-sm text-gray-600 inline-flex items-center gap-1">
                            <FiClock size={14} />
                            {log.timestamp_date ? log.timestamp_date.toLocaleTimeString() : 'Unknown'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-600">No activities found on this day.</div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
