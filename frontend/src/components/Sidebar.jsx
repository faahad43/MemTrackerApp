"use client"
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useScreenSize } from '@/context/ScreenSizeContext'
import { motion, AnimatePresence } from "framer-motion"
import { useUser } from '@clerk/nextjs'
import {
  FiVideo,
  FiUpload,
  FiMessageSquare,
  FiClock,
  FiCalendar,
  FiUsers,
  FiActivity
} from 'react-icons/fi'

export default function Sidebar({ toggleSideBar = false, setToggleSideBar, iconBar, isHovered, setIsHovered }) {
  const { user } = useUser()
  const { isLg } = useScreenSize()
  console.log("is the screen large: ", isLg)
  const pathname = usePathname()
  const shouldShowSideBar = isLg || (!isLg && toggleSideBar)

  const commonNavigationItems = [
    { name: 'Upload Video/RTSP', icon: <FiUpload size={20} />, path: '/dashboard' },
    { name: 'Chatbot', icon: <FiMessageSquare size={20} />, path: '/dashboard/chatbot' },
    { name: 'Logging History', icon: <FiClock size={20} />, path: '/dashboard/logging-history' },
    { name: 'Calendar View', icon: <FiCalendar size={20} />, path: '/dashboard/calendar' },
    { name: 'Activities', icon: <FiActivity size={20} />, path: '/dashboard/activities' },
  ]

  const adminNavigationItems = [
    { name: 'Users', icon: <FiUsers size={20} />, path: '/dashboard/users' },
  ]

  const role = user?.publicMetadata?.role || 'user'
  const navItems = [
    ...commonNavigationItems,
    ...(role === 'admin' ? adminNavigationItems : []),
  ]

  const handleOverlayClick = () => {
    if (setToggleSideBar) {
      setToggleSideBar(false)
    }
  }

  const handleMouseEnter = () => {
    if (setIsHovered) {
      setIsHovered(true)
    }
  }

  const handleMouseLeave = () => {
    if (setIsHovered) {
      setIsHovered(false)
    }
  }

  const sidebarWidth = isLg && iconBar ? (isHovered ? 'w-64' : 'w-20') : 'w-64'

  return (
    <AnimatePresence>
      {shouldShowSideBar && (
        <>
          {/* Black overlay - only shown on mobile */}
          {!isLg && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black z-[9]"
              onClick={handleOverlayClick}
            />
          )}
          <motion.div
            initial={!isLg ? { opacity: 0, x: -300 } : false}
            animate={{ opacity: 1, x: 0 }}
            exit={!isLg ? { opacity: 0, x: -300 } : {}}
            transition={{ type: "tween", duration: 0.2 }}
            className={`flex flex-col h-full bg-white border-r border-gray-200 ${sidebarWidth} fixed left-0 top-0 bottom-0 z-10 transition-all duration-300`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* Logo */}
            {isLg ? (
              <Link href='/dashboard'>
                <div className={`relative flex items-center ${iconBar ? (isHovered ? 'px-6 py-4' : ' px-2 py-4 justify-center') : 'px-6 py-4'}`}>
                  <div className={`${iconBar && !isHovered ? 'w-10 h-10' : 'w-12 h-12'} bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center transition-all duration-300`}>
                    <FiVideo className="text-white" size={iconBar && !isHovered ? 20 : 24} />
                  </div>
                  {(!iconBar || isHovered) &&
                    <span className="ml-3 text-xl text-gray-700 font-bold">
                      Mem<span className="text-cyan-600">Tracker</span>
                    </span>
                  }
                </div>
              </Link>
            ) : null}

            {/* Navigation Items */}
            <div className={`flex-1 overflow-y-auto py-2 custom-scrollbar ${!isLg ? 'mt-[80px]' : ''}`}>
              <nav className="flex flex-col space-y-1 px-2">
                {navItems.map((item) => {
                  const isActive = pathname === item.path
                  return (
                    <Link
                      key={item.name}
                      href={item.path}
                      className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="mr-3">{item.icon}</span>
                      {(!iconBar || isHovered || !isLg) && <span className="font-medium">{item.name}</span>}
                    </Link>
                  )
                })}
              </nav>
            </div>

            {/* Footer Logo */}
            {isLg && (
              <div className={`border-t border-gray-200 ${iconBar ? (isHovered ? 'px-6 py-4' : ' px-2 py-4 justify-center') : 'px-6 py-4'}`}>
                <div className="flex items-center">
                  {(!iconBar || isHovered) && (
                    <span className="text-sm text-gray-500">
                      © 2026 MemTracker
                    </span>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
