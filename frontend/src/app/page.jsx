"use client"
import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  FiVideo, 
  FiActivity, 
  FiEye, 
  FiClock, 
  FiShield, 
  FiZap,
  FiMail,
  FiArrowRight 
} from 'react-icons/fi'
import { MdLocationPin, MdPerson } from 'react-icons/md'
import { BsCameraVideo } from 'react-icons/bs'

export default function LandingPage() {
  const features = [
    {
      icon: <FiEye size={32} />,
      title: "Real-Time Detection",
      description: "Advanced AI-powered computer vision for instant activity recognition"
    },
    {
      icon: <FiActivity size={32} />,
      title: "Activity Tracking",
      description: "Monitor and log all activities including movement, object interaction, and more"
    },
    {
      icon: <BsCameraVideo size={32} />,
      title: "RTSP & Video Upload",
      description: "Connect live RTSP streams or upload recorded videos for analysis"
    },
    {
      icon: <MdPerson size={32} />,
      title: "Person Recognition",
      description: "Track individuals with detailed feature logging like clothing, accessories"
    },
    {
      icon: <FiClock size={32} />,
      title: "Timeline Analysis",
      description: "Review activities with calendar and timeline views for easy navigation"
    },
    {
      icon: <FiShield size={32} />,
      title: "Security Alerts",
      description: "Detect unusual activities like fights, fires, or unauthorized access"
    }
  ]

  const activities = [
    "Person entering/leaving rooms",
    "Object pickup and placement",
    "Unusual behavior detection",
    "Fire and safety hazards",
    "Belongings left behind",
    "Multiple person interactions"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-cyan-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                <FiVideo className="text-white" size={24} />
              </div>
              <span className="text-2xl font-bold text-white">
                Mem<span className="text-cyan-400">Tracker</span>
              </span>
            </div>
            <Link 
              href="/login"
              className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300"
            >
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              AI-Powered
              <span className="block mt-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Activity Monitoring
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto">
              Advanced computer vision system for real-time detection, tracking, and logging of activities
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="mailto:fahadshah1060@gmail.com"
                className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold text-lg hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 flex items-center gap-2"
              >
                <FiMail size={20} />
                Contact for Access
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </a>
              <Link
                href="/login"
                className="px-8 py-4 border-2 border-cyan-500 text-cyan-400 rounded-lg font-semibold text-lg hover:bg-cyan-500/10 transition-all duration-300"
              >
                Explore Demo
              </Link>
            </div>
          </motion.div>

          {/* Hero Image/Video Placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-16 relative"
          >
            <div className="relative w-full h-[400px] md:h-[500px] bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border-2 border-cyan-500/30 overflow-hidden shadow-2xl shadow-cyan-500/20">
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <FiZap className="mx-auto mb-4 text-cyan-400" size={80} />
                  <p className="text-2xl font-semibold text-white">Real-Time Monitoring Dashboard</p>
                  <p className="text-slate-400 mt-2">[ Preview Image Here ]</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-slate-300">
              Everything you need for comprehensive activity monitoring
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="p-6 bg-slate-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-xl hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center mb-4 text-white">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Activities Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Track Every Activity
              </h2>
              <p className="text-xl text-slate-300 mb-8">
                Our advanced AI models detect and log various activities with precision and detail
              </p>
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                    <span className="text-slate-200 text-lg">{activity}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative h-[500px] bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border-2 border-cyan-500/30 overflow-hidden shadow-2xl shadow-cyan-500/20"
            >
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <MdLocationPin className="mx-auto mb-4 text-cyan-400" size={80} />
                  <p className="text-2xl font-semibold text-white">Activity Detection</p>
                  <p className="text-slate-400 mt-2">[ Demo Image Here ]</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-slate-300">
              Simple setup, powerful results
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Connect Source",
                description: "Upload a video or connect to your RTSP stream"
              },
              {
                step: "02",
                title: "AI Analysis",
                description: "Our models detect, track, and recognize activities in real-time"
              },
              {
                step: "03",
                title: "Review & Monitor",
                description: "View logs, analyze timelines, and get insights from your dashboard"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative"
              >
                <div className="text-8xl font-bold text-cyan-500/10 absolute -top-8 -left-4">
                  {item.step}
                </div>
                <div className="relative p-6 bg-slate-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-xl">
                  <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-slate-300">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center p-12 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 backdrop-blur-sm border-2 border-cyan-500/30 rounded-2xl"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-slate-300 mb-8">
              Contact us to get access to MemTracker and start monitoring activities with AI precision
            </p>
            <a
              href="mailto:fahadshah1060@gmail.com"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold text-lg hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300"
            >
              <FiMail size={24} />
              fahadshah1060@gmail.com
            </a>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-cyan-500/20 bg-slate-900/80">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-slate-400">
            © {new Date().getFullYear()} MemTracker. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
