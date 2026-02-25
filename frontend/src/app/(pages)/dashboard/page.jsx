'use client'
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FiUpload, FiVideo, FiPlay, FiX, FiCheck } from 'react-icons/fi'
import { MdVideoLibrary } from 'react-icons/md'
import { showSuccessToast, showErrorToast, showLoadingToast, dismissToast } from '@/utils/toast'

export default function UploadVideoPage() {
  const [activeTab, setActiveTab] = useState('upload') // 'upload' or 'rtsp'
  const [uploadedFile, setUploadedFile] = useState(null)
  const [rtspUrl, setRtspUrl] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('video/')) {
        showErrorToast('Please upload a valid video file')
        return
      }
      setUploadedFile(file)
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
      setUploadedFile(file)
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
    const loadingToastId = showLoadingToast('Starting analysis...')

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      dismissToast(loadingToastId)
      showSuccessToast('Analysis started successfully!')
      
      // Here you would send the video/RTSP URL to the backend
      // For now, just simulating
    } catch {
      dismissToast(loadingToastId)
      showErrorToast('Failed to start analysis')
    } finally {
      setIsProcessing(false)
    }
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
