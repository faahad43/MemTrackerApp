"use client"
import React, { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSignIn, useClerk } from '@clerk/nextjs'
import { FiEye, FiEyeOff, FiVideo, FiMail, FiLock } from 'react-icons/fi'
import { showSuccessToast, showErrorToast, showLoadingToast, dismissToast, isClerkAPIResponseError } from '@/utils/toast'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get('redirect_url') || '/dashboard'
  
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    code: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const { signIn } = useSignIn()
  const { setActive } = useClerk()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!signIn) return

    setIsLoading(true)
    const loadingToastId = showLoadingToast('Processing Request')
    
    try {
      const response = await signIn?.create({
        identifier: formData.email,
        password: formData.password,
      })
      
      console.log("Clerk response:", response)
      
      if (response?.status === 'complete') {
        await setActive({ session: response.createdSessionId })
        dismissToast(loadingToastId)
        showSuccessToast("Login Successful.")
        router.push(redirectUrl)
      } else if (response?.status === 'needs_second_factor') {
        dismissToast(loadingToastId)
        await response?.prepareSecondFactor({ strategy: "email_code" })
        setVerifying(true)
        showSuccessToast("Please check your email for the code.")
      }
    } catch (error) {
      console.log("Clerk error:", error)
      dismissToast(loadingToastId)
      if (isClerkAPIResponseError(error)) {
        const errorMessage = error.errors?.[0]?.longMessage || "Failed Login"
        showErrorToast(errorMessage)
      }
    }
    setIsLoading(false)
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    if (!signIn) return

    setIsLoading(true)
    const loadingToastId = showLoadingToast('Verifying Code')

    try {
      const response = await signIn.attemptSecondFactor({
        strategy: "email_code",
        code: formData.code,
      })

      if (response.status === 'complete') {
        await setActive({ session: response.createdSessionId })
        dismissToast(loadingToastId)
        showSuccessToast("Verification Successful.")
        router.push(redirectUrl)
      } else {
        console.log(response)
        showErrorToast("Verification incomplete.")
      }
    } catch (error) {
      console.log("Verification Error:", error)
      dismissToast(loadingToastId)
      if (isClerkAPIResponseError(error)) {
        const errorMessage = error.errors?.[0]?.longMessage || "Invalid Code"
        showErrorToast(errorMessage)
      }
    }
    setIsLoading(false)
  }

  return (
    <div className="h-screen w-full flex">
      {/* Left Banner Side */}
      <div className='hidden lg:flex flex-[3] items-center justify-center p-[5%] bg-gradient-to-br from-blue-900 via-slate-900 to-cyan-900'>
        <div className='flex flex-col h-[85%] p-10 gap-4 w-full border border-cyan-400/30 rounded-md bg-white/10 backdrop-blur-lg'>
          <h1 className='text-white text-4xl font-bold'>
            AI-Powered Activity<br/>
            Monitoring System<br/>
            in Real-Time.
          </h1>
          <div className='flex flex-col items-center justify-center gap-4 flex-1'>
            <div className='relative w-full h-full max-h-[300px] bg-slate-800/50 rounded-lg border border-cyan-500/30 flex items-center justify-center'>
              <div className="text-center">
                <FiVideo className="mx-auto mb-4 text-cyan-400" size={80} />
                <p className="text-white text-lg">[ Auth Image Here ]</p>
              </div>
            </div>
            <p className='text-white text-xl text-center font-bold p-2'>
              Track, detect, and analyze activities with computer vision precision.
            </p>
          </div>
        </div>
      </div>

      {/* Right Login Side */}
      <div className='flex flex-1 lg:flex-[5] flex-col items-center justify-between px-6 md:p-4'>
        {/* Logo */}
        <div className='relative flex items-center mt-8'>
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
            <FiVideo className="text-white" size={32} />
          </div>
          <label className='font-bold text-2xl ml-3'>
            Mem<span className='text-cyan-600'>Tracker</span>
          </label>
        </div>

        {/* Login Form */}
        <div className="flex flex-1 flex-col w-full justify-center items-center">
          <div className='flex flex-col gap-3 -mt-20'>
            <h2 className="text-center text-2xl font-bold text-gray-900">
              {verifying ? "Verify Identity" : "Sign In"}
            </h2>
            <p className='text-slate-600 text-center'>
              {verifying ? "Enter the code sent to your email" : "Please enter your details to sign in"}
            </p>
          </div>

          <div className="mt-10 w-full md:w-[60%]">
            {verifying ? (
              /* OTP VERIFICATION FORM */
              <form className="space-y-6" onSubmit={handleVerify}>
                <div>
                  <label htmlFor="code" className="block text-md font-bold text-slate-700">
                    Enter Code
                  </label>
                  <div className="mt-2 relative">
                    <input
                      id="code"
                      name="code"
                      type="text"
                      value={formData.code}
                      onChange={handleChange}
                      placeholder='123456'
                      className="block w-full rounded-lg bg-white px-4 py-3 text-base text-gray-900 border-2 border-gray-300 focus:border-cyan-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full cursor-pointer justify-center rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 text-base font-semibold text-white shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Verifying...' : 'Verify Login'}
                </button>
              </form>
            ) : (
              /* STANDARD LOGIN FORM */
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="email" className="block text-md font-bold text-slate-700">
                    Email address
                  </label>
                  <div className="mt-2 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMail className="text-gray-400" size={20} />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder='example@email.com'
                      className="block w-full rounded-lg bg-white pl-10 pr-4 py-3 text-base text-gray-900 border-2 border-gray-300 focus:border-cyan-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-md font-bold text-slate-700">
                    Password
                  </label>
                  <div className="mt-2 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className="text-gray-400" size={20} />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder='Enter your password'
                      className="block w-full rounded-lg bg-white pl-10 pr-12 py-3 text-base text-gray-900 border-2 border-gray-300 focus:border-cyan-500 focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full cursor-pointer justify-center rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 text-base font-semibold text-white shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="mb-4 text-center text-sm">
          Copyright © {new Date().getFullYear()} Mem<span className='text-cyan-600'>Tracker.</span> All rights reserved.
        </footer>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}
