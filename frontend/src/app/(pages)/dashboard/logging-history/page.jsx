'use client'
import React, { useEffect, useMemo, useState } from 'react'
import { FiClock, FiDownload, FiLoader, FiRefreshCw, FiSearch } from 'react-icons/fi'
import { showErrorToast } from '@/utils/toast'
import { fetchActivityLogs, fetchActivitySummary, normalizeLog } from '@/utils/backendApi'

const PAGE_SIZE = 25

function formatDateTime(log) {
  if (log.timestamp_date) {
    return log.timestamp_date.toLocaleString()
  }
  if (typeof log.timestamp === 'string') {
    return log.timestamp
  }
  return 'Unknown'
}

function buildCsv(rows) {
  const headers = ['id', 'activity', 'track_id', 'confidence', 'frame_number', 'timestamp', 'bbox']
  const lines = [headers.join(',')]

  rows.forEach((row) => {
    const values = [
      row._id,
      row.activity,
      row.track_id,
      row.confidence,
      row.frame_number,
      row.timestamp_epoch || row.timestamp,
      JSON.stringify(row.bbox || []),
    ].map((item) => `"${String(item ?? '').replace(/"/g, '""')}"`)

    lines.push(values.join(','))
  })

  return lines.join('\n')
}

export default function LoggingHistoryPage() {
  const [logs, setLogs] = useState([])
  const [summary, setSummary] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const [searchText, setSearchText] = useState('')
  const [activityFilter, setActivityFilter] = useState('all')
  const [trackIdFilter, setTrackIdFilter] = useState('')
  const [minConfidence, setMinConfidence] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [skip, setSkip] = useState(0)
  const [pagination, setPagination] = useState({ total: 0, has_more: false, skip: 0, limit: PAGE_SIZE })

  const uniqueActivityTypes = useMemo(() => {
    return (summary?.by_activity || []).map((item) => item.activity)
  }, [summary])

  const queryParams = useMemo(() => {
    const params = { limit: PAGE_SIZE, skip }

    if (activityFilter !== 'all') params.activity = activityFilter
    if (trackIdFilter.trim()) params.track_id = trackIdFilter.trim()
    if (minConfidence !== '') params.min_confidence = minConfidence
    if (fromDate) params.from = `${fromDate}T00:00:00Z`
    if (toDate) params.to = `${toDate}T23:59:59Z`

    return params
  }, [activityFilter, trackIdFilter, minConfidence, fromDate, toDate, skip])

  useEffect(() => {
    let mounted = true

    async function loadSummary() {
      try {
        const response = await fetchActivitySummary()
        if (mounted) setSummary(response)
      } catch {
        // Page can still work without summary metadata.
      }
    }

    loadSummary()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    let mounted = true

    async function loadLogs() {
      setIsLoading(true)
      setError('')

      try {
        const response = await fetchActivityLogs(queryParams)
        if (!mounted) return

        setLogs((response.items || []).map(normalizeLog))
        setPagination(response.pagination || { total: 0, has_more: false, skip, limit: PAGE_SIZE })
      } catch (err) {
        if (!mounted) return
        const message = err?.response?.data?.error || 'Failed to load logs'
        setError(message)
        showErrorToast(message)
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    loadLogs()
    return () => {
      mounted = false
    }
  }, [queryParams, skip])

  const filteredLogs = useMemo(() => {
    if (!searchText.trim()) return logs
    const q = searchText.toLowerCase()

    return logs.filter((log) => {
      const activity = String(log.activity || '').toLowerCase()
      const track = String(log.track_id || '').toLowerCase()
      const id = String(log._id || '').toLowerCase()
      return activity.includes(q) || track.includes(q) || id.includes(q)
    })
  }, [logs, searchText])

  const handleRefresh = async () => {
    setSkip(0)
    setIsLoading(true)
    try {
      const [summaryResponse, logsResponse] = await Promise.all([
        fetchActivitySummary(),
        fetchActivityLogs({ ...queryParams, skip: 0 }),
      ])
      setSummary(summaryResponse)
      setLogs((logsResponse.items || []).map(normalizeLog))
      setPagination(logsResponse.pagination || { total: 0, has_more: false, skip: 0, limit: PAGE_SIZE })
      setError('')
    } catch (err) {
      const message = err?.response?.data?.error || 'Failed to refresh logs'
      setError(message)
      showErrorToast(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = () => {
    const csv = buildCsv(filteredLogs)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `activity_logs_${Date.now()}.csv`
    link.click()

    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
              <FiClock className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Logging History</h1>
              <p className="text-gray-600">{pagination.total || 0} total events in MongoDB</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white hover:border-cyan-500 transition-colors"
            >
              <FiRefreshCw size={16} />
              Refresh
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
              disabled={filteredLogs.length === 0}
            >
              <FiDownload size={16} />
              Export CSV
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
          <div className="relative lg:col-span-2">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search id/activity/track"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-500"
            />
          </div>

          <select
            value={activityFilter}
            onChange={(e) => {
              setSkip(0)
              setActivityFilter(e.target.value)
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All activities</option>
            {uniqueActivityTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <input
            type="text"
            value={trackIdFilter}
            onChange={(e) => {
              setSkip(0)
              setTrackIdFilter(e.target.value)
            }}
            placeholder="Track ID"
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-500"
          />

          <input
            type="number"
            min="0"
            max="1"
            step="0.01"
            value={minConfidence}
            onChange={(e) => {
              setSkip(0)
              setMinConfidence(e.target.value)
            }}
            placeholder="Min confidence"
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-500"
          />

          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setSkip(0)
                setFromDate(e.target.value)
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-500"
            />
            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setSkip(0)
                setToDate(e.target.value)
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-700 border border-red-200 bg-red-50 rounded-lg p-3">{error}</div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left text-xs uppercase text-gray-500 px-4 py-3">Activity</th>
                  <th className="text-left text-xs uppercase text-gray-500 px-4 py-3">Track ID</th>
                  <th className="text-left text-xs uppercase text-gray-500 px-4 py-3">Confidence</th>
                  <th className="text-left text-xs uppercase text-gray-500 px-4 py-3">Frame</th>
                  <th className="text-left text-xs uppercase text-gray-500 px-4 py-3">Timestamp</th>
                  <th className="text-left text-xs uppercase text-gray-500 px-4 py-3">BBox</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-600">
                      <div className="inline-flex items-center gap-2">
                        <FiLoader className="animate-spin" size={18} />
                        Loading logs...
                      </div>
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-600">No logs found for selected filters.</td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 capitalize text-gray-900">{String(log.activity || 'unknown').replace(/_/g, ' ')}</td>
                      <td className="px-4 py-3 text-gray-700">#{log.track_id ?? 'N/A'}</td>
                      <td className="px-4 py-3 text-gray-700">{((log.confidence || 0) * 100).toFixed(1)}%</td>
                      <td className="px-4 py-3 text-gray-700">{log.frame_number ?? 'N/A'}</td>
                      <td className="px-4 py-3 text-gray-700">{formatDateTime(log)}</td>
                      <td className="px-4 py-3 text-gray-700">{Array.isArray(log.bbox) ? log.bbox.join(', ') : 'N/A'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {logs.length} of {pagination.total || 0} logs
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSkip(Math.max(0, skip - PAGE_SIZE))}
              disabled={skip === 0 || isLoading}
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setSkip(skip + PAGE_SIZE)}
              disabled={!pagination.has_more || isLoading}
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
