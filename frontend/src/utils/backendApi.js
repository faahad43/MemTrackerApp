import axios from 'axios'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: BACKEND_URL,
  timeout: 120000,
})

function toQuery(params = {}) {
  const qp = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    qp.append(key, String(value))
  })
  const query = qp.toString()
  return query ? `?${query}` : ''
}

export async function fetchPipelineStatus() {
  const { data } = await api.get('/api/pipeline/status')
  return data
}

export async function processVideoFile(file, onUploadProgress) {
  const formData = new FormData()
  formData.append('video', file)

  const { data } = await api.post('/api/pipeline/process-video', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 600000,
    onUploadProgress,
  })
  return data
}

export async function fetchActivityLogs(params = {}) {
  const { data } = await api.get(`/api/logs${toQuery(params)}`)
  return data
}

export async function fetchActivitySummary(params = {}) {
  const { data } = await api.get(`/api/logs/summary${toQuery(params)}`)
  return data
}

export async function fetchDailyActivityCounts(params = {}) {
  const { data } = await api.get(`/api/logs/daily${toQuery(params)}`)
  return data
}

export function normalizeLog(log) {
  const timestampEpoch =
    typeof log.timestamp_epoch === 'number'
      ? log.timestamp_epoch
      : typeof log.timestamp === 'number'
      ? log.timestamp
      : Number(log.timestamp) || null

  return {
    ...log,
    timestamp_epoch: timestampEpoch,
    timestamp_date: timestampEpoch ? new Date(timestampEpoch * 1000) : null,
  }
}

export { BACKEND_URL }
