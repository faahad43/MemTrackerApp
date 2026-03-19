'use client'
import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { FiActivity, FiAlertTriangle, FiLoader } from 'react-icons/fi'
import { showErrorToast } from '@/utils/toast'
import { fetchActivityLogs, fetchActivitySummary, normalizeLog } from '@/utils/backendApi'

function getRelativeTime(timestampDate) {
  if (!timestampDate) return 'Unknown time'

  const diffMs = Date.now() - timestampDate.getTime()
  const diffMin = Math.floor(diffMs / 60000)

  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`

  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour}h ago`

  const diffDay = Math.floor(diffHour / 24)
  return `${diffDay}d ago`
}

function labelForActivity(activity) {
  return String(activity || 'unknown').replace(/_/g, ' ')
}

export default function ActivitiesPage() {
  const [summary, setSummary] = useState(null)
  const [recentLogs, setRecentLogs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    async function loadData() {
      setIsLoading(true)
      setError('')

      try {
        const [summaryResponse, logsResponse] = await Promise.all([
          fetchActivitySummary(),
          fetchActivityLogs({ limit: 10 }),
        ])

        if (!mounted) return

        setSummary(summaryResponse)
        setRecentLogs((logsResponse.items || []).map(normalizeLog))
      } catch (err) {
        if (!mounted) return
        const message = err?.response?.data?.error || 'Failed to load activity overview'
        setError(message)
        showErrorToast(message)
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    loadData()
    return () => {
      mounted = false
    }
  }, [])

  const topActivityCards = useMemo(() => {
    const items = summary?.by_activity || []
    return items.slice(0, 4)
  }, [summary])

  const alertsCount = useMemo(() => {
    const alertKeywords = ['fall', 'fire', 'fight', 'alert', 'hazard', 'intrusion']
    return (summary?.by_activity || []).reduce((acc, item) => {
      const text = String(item.activity || '').toLowerCase()
      const isAlert = alertKeywords.some((word) => text.includes(word))
      return acc + (isAlert ? item.count : 0)
    }, 0)
  }, [summary])

  if (isLoading) {
    return (
      <div className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto bg-white rounded-lg shadow p-8 flex items-center justify-center gap-3 text-gray-600">
          <FiLoader className="animate-spin" size={22} />
          Loading activity overview...
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
              <FiActivity className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Activities Overview</h1>
              <p className="text-gray-600">Live activity metrics from MongoDB logs</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 flex items-center gap-2">
            <FiAlertTriangle size={18} />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Total Logged Events</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{summary?.total_logs ?? 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Unique Tracked IDs</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{summary?.unique_tracks ?? 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Average Confidence</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {summary ? `${((summary.average_confidence || 0) * 100).toFixed(1)}%` : '0.0%'}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Alerts</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{alertsCount}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Top Activity Types</h2>
            {topActivityCards.length > 0 ? (
              <div className="space-y-3">
                {topActivityCards.map((item, index) => (
                  <motion.div
                    key={item.activity}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    className="p-4 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-900 capitalize">{labelForActivity(item.activity)}</p>
                      <span className="text-cyan-700 font-bold">{item.count}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Avg confidence: {((item.average_confidence || 0) * 100).toFixed(1)}%
                    </p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No activities logged yet.</p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Recent Activities</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {recentLogs.length > 0 ? (
                recentLogs.map((log, index) => (
                  <motion.div
                    key={log._id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-5 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-gray-900 capitalize">{labelForActivity(log.activity)}</p>
                        <p className="text-sm text-gray-600">
                          Track #{log.track_id ?? 'N/A'} • Confidence {((log.confidence || 0) * 100).toFixed(1)}%
                        </p>
                      </div>
                      <span className="text-sm text-gray-500">{getRelativeTime(log.timestamp_date)}</span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="p-6 text-gray-600">No recent activities found.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
