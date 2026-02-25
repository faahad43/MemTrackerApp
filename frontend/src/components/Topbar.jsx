"use client"
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useScreenSize } from '@/context/ScreenSizeContext'
import { UserButton } from '@clerk/nextjs'
import {
  FiSearch,
  FiMessageSquare,
  FiMail,
  FiBell
} from 'react-icons/fi'
import { LuArrowLeftToLine, LuArrowRightFromLine } from 'react-icons/lu'
import { FiVideo } from 'react-icons/fi'

export default function Topbar({ setToggleSideBar, setIconBar, iconBar, isHovered }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const { isLg } = useScreenSize()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`fixed top-0 right-0 left-0 ${isLg ? (iconBar ? (isHovered ? 'lg:left-64' : 'lg:left-20') : 'lg:left-64') : null} h-16 z-20 bg-white border-b border-gray-200 transition-all duration-300 ${isScrolled ? 'shadow-sm' : ''}`}>
      {!isLg ? (
        <div className="lg:hidden h-full flex items-center justify-between px-4">
          {/* Hamburger menu */}
          <div
            className='flex flex-col gap-2 cursor-pointer'
            onClick={() => setToggleSideBar(prev => !prev)}
          >
            <div className='w-10 h-1 rounded-xs bg-cyan-600'></div>
            <div className='w-5 h-1 rounded-xs bg-cyan-600'></div>
            <div className='w-10 h-1 rounded-xs bg-cyan-600'></div>
          </div>

          {/* Center - Logo */}
          <div className="flex items-center gap-2">
            <Link href={'/dashboard'}>
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                <FiVideo className="text-white" size={20} />
              </div>
            </Link>
          </div>

          <div className='relative'>
            <UserButton userProfileUrl='/dashboard/profile' />
          </div>
        </div>
      ) : (
        <div className='flex items-center justify-between h-full px-4'>
          {/* Left Side - Toggle and Search */}
          <div className='flex gap-2'>
            <div
              className='bg-gray-200 rounded-lg flex items-center justify-center h-10 w-10 cursor-pointer hover:bg-gray-300 transition-colors'
              onClick={() => setIconBar(prev => !prev)}
            >
              {!iconBar ?
                <LuArrowLeftToLine size={20} />
                :
                <LuArrowRightFromLine size={20} />
              }
            </div>
            <div className='border border-gray-200 flex items-center justify-center h-10 px-4 gap-2 rounded-md hover:border-cyan-500 transition-colors'>
              <FiSearch size={20} className='text-gray-400' />
              <input
                type="text"
                placeholder='Search'
                className='focus:outline-none bg-transparent w-48'
              />
            </div>
          </div>

          {/* Right side - Icons and user */}
          <div className="flex items-center space-x-4">
            <button className="text-gray-600 hover:text-cyan-600 transition-colors">
              <FiMessageSquare size={20} />
            </button>
            <button className="text-gray-600 hover:text-cyan-600 transition-colors">
              <FiMail size={20} />
            </button>
            <button className="text-gray-600 hover:text-cyan-600 transition-colors">
              <FiBell size={20} />
            </button>

            <UserButton userProfileUrl='/dashboard/profile' />
          </div>
        </div>
      )}
    </header>
  )
}
