"use client"
import React from 'react'
import { ClerkProvider } from '@clerk/nextjs'
import { ScreenSizeProvider } from '@/context/ScreenSizeContext'
import CustomToaster from '@/components/CustomToaster'

export default function Provider({ children }) {
  return (
    <ClerkProvider>
      <ScreenSizeProvider>
        {children}
        <CustomToaster />
      </ScreenSizeProvider>
    </ClerkProvider>
  )
}
