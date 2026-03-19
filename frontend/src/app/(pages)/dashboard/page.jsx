'use client'
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiUpload, FiVideo, FiPlay, FiX, FiCheck, FiClock, FiUsers, FiActivity, FiAlertCircle } from 'react-icons/fi'
import { MdVideoLibrary } from 'react-icons/md'
import { showSuccessToast, showErrorToast, showLoadingToast, dismissToast } from '@/utils/toast'
import { processVideoFile } from '@/utils/backendApi'

export default function UploadVideoPage() {
  const [activeTab, setActiveTab] = useState('upload')
  const [uploadedFile, setUploadedFile] = useState(null)
  const [rtspUrl, setRtspUrl] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [results, setResults] = useState(null)
  const [progress, setProgress] = useState(0)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('video/')) {
        showErrorToast('Please upload a valid video file')
        return
      }
      // 500MB limit
      if (file.size > 500 * 1024 * 1024) {
        showErrorToast('File too large. Maximum size is 500MB')
        return
      }
      setUploadedFile(file)
      setResults(null)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      showSuccessToast('Video uploaded successfully')
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      if (!file.type.startsWith('video/')) {
        showErrorToast('Please upload a valid video file')
        return
      }
      if (file.size > 500 * 1024 * 1024) {
        showErrorToast('File too large. Maximum size is 500MB')
        return
      }
      setUploadedFile(file)
      setResults(null)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      showSuccessToast('Video uploaded successfully')
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleRemoveFile = () => {
    setUploadedFile(null)
    setResults(null)
    setProgress(0)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
  }

  const handleStartProcessing = async () => {
    if (activeTab === 'upload' && !uploadedFile) {
      showErrorToast('Please upload a video first')
      return
    }
    if (activeTab === 'rtsp' && !rtspUrl) {
      showErrorToast('Please enter RTSP URL')
      return
    }

    setIsProcessing(true)
    setResults(null)
    setProgress(10)
    const loadingToastId = showLoadingToast('Uploading video & starting analysis...')

    try {
      if (activeTab === 'upload') {
        setProgress(30)

        const data = await processVideoFile(uploadedFile, (progressEvent) => {
          const pct = Math.round((progressEvent.loaded * 30) / progressEvent.total) + 30
          setProgress(Math.min(pct, 60))
        })

        setProgress(100)
        dismissToast(loadingToastId)

        if (data.status === 'completed') {
          setResults(data)
          showSuccessToast(`Analysis complete! Found ${data.stats.total_activities} activities`)
        } else if (data.error) {
          showErrorToast(data.error)
        }
      } else {
        // RTSP - not yet implemented in backend
        dismissToast(loadingToastId)
        showErrorToast('RTSP stream processing is coming soon')
      }
    } catch (err) {
      dismissToast(loadingToastId)
      if (err.response?.status === 413) {
        showErrorToast('File too large. Maximum size is 500MB')
      } else {
        showErrorToast(err.response?.data?.error || 'Failed to process video')
      }
    } finally {
      setIsProcessing(false)
    }
  }

  // Group activities by track_id for summary
  const getActivitySummary = () => {
    if (!results?.activities) return {}
    const summary = {}
    for (const act of results.activities) {
      const label = act.activity
      if (!summary[label]) summary[label] = { count: 0, totalConf: 0 }
      summary[label].count++
      summary[label].totalConf += act.confidence
    }
    // Calculate average confidence
    for (const key of Object.keys(summary)) {
      summary[key].avgConfidence = (summary[key].totalConf / summary[key].count * 100).toFixed(1)
    }
    return summary
  }

  // Get unique tracked persons
  const getUniquePersons = () => {
    if (!results?.activities) return 0
    return new Set(results.activities.map(a => a.track_id)).size
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
              <FiVideo className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Video Analysis</h1>
              <p className="text-gray-600">Upload a video or connect to RTSP stream for activity monitoring</p>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="bg-white rounded-lg shadow p-2 mb-6 flex gap-2">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'upload'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FiUpload size={20} />
            Upload Video
          </button>
          <button
            onClick={() => setActiveTab('rtsp')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'rtsp'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <MdVideoLibrary size={20} />
            RTSP Stream
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow p-8">
          {activeTab === 'upload' ? (
            <div>
              {!uploadedFile ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-cyan-500 transition-colors cursor-pointer"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => document.getElementById('fileInput')?.click()}
                >
                  <FiUpload className="mx-auto mb-4 text-gray-400" size={64} />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Video</h3>
                  <p className="text-gray-600 mb-4">
                    Drag and drop your video file here, or click to browse
                  </p>
                  <p className="text-sm text-gray-500">Supported formats: MP4, AVI, MOV, MKV</p>
                  <input
                    id="fileInput"
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <FiCheck className="text-white" size={24} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{uploadedFile.name}</p>
                        <p className="text-sm text-gray-600">
                          {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveFile}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FiX size={24} />
                    </button>
                  </div>

                  {previewUrl && (
                    <div className="rounded-lg overflow-hidden bg-black">
                      <video
                        src={previewUrl}
                        controls
                        className="w-full max-h-[400px] object-contain"
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}

                  <button
                    onClick={handleStartProcessing}
                    disabled={isProcessing}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiPlay size={20} />
                    {isProcessing ? 'Processing...' : 'Start Analysis'}
                  </button>

                  {/* Progress Bar */}
                  {isProcessing && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Processing video...</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Connect to RTSP Stream</h3>
                <p className="text-gray-600 mb-6">
                  Enter the RTSP URL of your IP camera or video stream
                </p>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="rtspUrl" className="block text-sm font-semibold text-gray-700 mb-2">
                      RTSP URL
                    </label>
                    <input
                      id="rtspUrl"
                      type="text"
                      value={rtspUrl}
                      onChange={(e) => setRtspUrl(e.target.value)}
                      placeholder="rtsp://username:password@ip:port/stream"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:outline-none transition-colors"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Example: rtsp://admin:password@192.168.1.100:554/stream1
                    </p>
                  </div>

                  {/* Connection Details */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Connection Tips:</h4>
                    <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                      <li>Ensure your camera is accessible from this network</li>
                      <li>Check if the RTSP port (usually 554) is not blocked</li>
                      <li>Verify your username and password are correct</li>
                      <li>Use the camera&apos;s IP address, not hostname</li>
                    </ul>
                  </div>

                  <button
                    onClick={handleStartProcessing}
                    disabled={isProcessing || !rtspUrl}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiPlay size={20} />
                    {isProcessing ? 'Connecting...' : 'Connect & Analyze'}
                  </button>
                </div>
              </div>

              {/* Stream Preview Placeholder */}
              <div className="border-2 border-gray-300 rounded-lg p-12 bg-gray-50">
                <div className="text-center">
                  <MdVideoLibrary className="mx-auto mb-4 text-gray-400" size={64} />
                  <p className="text-gray-600">Stream preview will appear here once connected</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Results Panel */}
        <AnimatePresence>
          {results && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-8 space-y-6"
            >
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                      <FiClock className="text-cyan-600" size={20} />
                    </div>
                    <span className="text-sm text-gray-500">Processing Time</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{results.stats.processing_time}s</p>
                </div>
                <div className="bg-white rounded-lg shadow p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FiVideo className="text-blue-600" size={20} />
                    </div>
                    <span className="text-sm text-gray-500">Frames Processed</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{results.stats.processed_frames}<span className="text-sm text-gray-400 font-normal"> / {results.stats.total_frames}</span></p>
                </div>
                <div className="bg-white rounded-lg shadow p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FiUsers className="text-purple-600" size={20} />
                    </div>
                    <span className="text-sm text-gray-500">Persons Tracked</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{getUniquePersons()}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <FiActivity className="text-green-600" size={20} />
                    </div>
                    <span className="text-sm text-gray-500">Activities Found</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{results.stats.total_activities}</p>
                </div>
              </div>

              {/* Activity Summary */}
              {Object.keys(getActivitySummary()).length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {Object.entries(getActivitySummary()).map(([label, data]) => (
                      <div key={label} className="bg-gray-50 rounded-lg p-3 text-center">
                        <p className="text-sm font-medium text-gray-700 capitalize">{label}</p>
                        <p className="text-xl font-bold text-gray-900">{data.count}</p>
                        <p className="text-xs text-gray-500">{data.avgConfidence}% conf</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Activity Log Table */}
              {results.activities?.length > 0 && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Activity Log</h3>
                    <p className="text-sm text-gray-500 mt-1">Detailed list of all detected activities</p>
                  </div>
                  <div className="overflow-x-auto max-h-96 overflow-y-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Track ID</th>
                          <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Activity</th>
                          <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Confidence</th>
                          <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Frame</th>
                          <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {results.activities.map((act, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-3 text-sm text-gray-900 font-medium">#{act.track_id}</td>
                            <td className="px-6 py-3">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800 capitalize">
                                {act.activity}
                              </span>
                            </td>
                            <td className="px-6 py-3 text-sm text-gray-600">{(act.confidence * 100).toFixed(1)}%</td>
                            <td className="px-6 py-3 text-sm text-gray-600">{act.frame_number}</td>
                            <td className="px-6 py-3 text-sm text-gray-600">{act.video_time}s</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* No activities found */}
              {results.activities?.length === 0 && (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <FiAlertCircle className="mx-auto mb-3 text-yellow-500" size={40} />
                  <p className="text-gray-700 font-medium">No activities detected</p>
                  <p className="text-sm text-gray-500 mt-1">Try a video with people performing visible activities</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
              <FiVideo className="text-cyan-600" size={24} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Real-Time Detection</h3>
            <p className="text-sm text-gray-600">
              AI models analyze video in real-time to detect activities
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <FiCheck className="text-blue-600" size={24} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Automatic Logging</h3>
            <p className="text-sm text-gray-600">
              All detected activities are logged to database automatically
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <FiPlay className="text-purple-600" size={24} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Instant Playback</h3>
            <p className="text-sm text-gray-600">
              Review detected events with timestamped playback
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
