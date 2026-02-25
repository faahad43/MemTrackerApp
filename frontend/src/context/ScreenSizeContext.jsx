"use client"
import React, { createContext, useContext, useState, useEffect } from 'react'

const ScreenSizeContext = createContext(undefined)

export function ScreenSizeProvider({ children }) {
  const [isXs, setIsXs] = useState(false)
  const [isSm, setIsSm] = useState(false)
  const [isMd, setIsMd] = useState(false)
  const [isLg, setIsLg] = useState(false)
  const [isXl, setIsXl] = useState(false)
  const [is2Xl, setIs2Xl] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      setIsXs(width < 640)
      setIsSm(width >= 640 && width < 768)
      setIsMd(width >= 768 && width < 1024)
      setIsLg(width >= 1024)
      setIsXl(width >= 1280 && width < 1536)
      setIs2Xl(width >= 1536)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <ScreenSizeContext.Provider value={{ isXs, isSm, isMd, isLg, isXl, is2Xl }}>
      {children}
    </ScreenSizeContext.Provider>
  )
}

export function useScreenSize() {
  const context = useContext(ScreenSizeContext)
  if (context === undefined) {
    throw new Error('useScreenSize must be used within a ScreenSizeProvider')
  }
  return context
}
