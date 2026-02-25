"use client"
import React from 'react'
import { motion } from 'framer-motion'

export default function LoadingScreen({ isLoading }) {
  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="flex flex-col items-center gap-4 bg-white rounded-lg shadow-2xl p-8"
      >
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-cyan-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-cyan-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-slate-700 font-medium">Loading...</p>
      </motion.div>
    </div>
  )
}
