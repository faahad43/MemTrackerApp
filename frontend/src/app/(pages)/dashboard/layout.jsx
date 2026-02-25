"use client"
import React, { useState } from 'react'
import { useScreenSize } from '@/context/ScreenSizeContext'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'

export default function DashboardLayout({ children }) {
  const [toggleSideBar, setToggleSideBar] = useState(false)
  const [iconBar, setIconBar] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const { isLg } = useScreenSize()

  return (
    <div className="relative flex h-screen">
      <Sidebar
        toggleSideBar={toggleSideBar}
        setToggleSideBar={setToggleSideBar}
        iconBar={iconBar}
        isHovered={isHovered}
        setIsHovered={setIsHovered}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar
          setToggleSideBar={setToggleSideBar}
          setIconBar={setIconBar}
          iconBar={iconBar}
          isHovered={isHovered}
        />
        <main className={`flex-1 bg-gray-50 overflow-y-auto mt-16 transition-all duration-300 ${!isLg ? 'ml-0' : (iconBar ? 'ml-20' : 'ml-64')}`}>
          {children}
        </main>
      </div>
    </div>
  )
}
