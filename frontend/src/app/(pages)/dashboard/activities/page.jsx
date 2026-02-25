'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { FiActivity } from 'react-icons/fi'
import { MdPerson, MdPersonOff, MdWarning } from 'react-icons/md'
import { BsBox } from 'react-icons/bs'

export default function ActivitiesPage() {
  const activityStats = [
    {
      icon: <MdPerson size={32} />,
      title: 'Person Entry',
      count: 127,
      change: '+12%',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: <MdPersonOff size={32} />,
      title: 'Person Exit',
      count: 119,
      change: '+8%',
      color: 'from-orange-500 to-orange-600'
    },
    {
      icon: <BsBox size={28} />,
      title: 'Object Interactions',
      count: 45,
      change: '+5%',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: <MdWarning size={32} />,
      title: 'Alerts',
      count: 8,
      change: '-15%',
      color: 'from-red-500 to-red-600'
    }
  ]

  const recentActivities = [
    { type: 'person_entry', desc: 'Person entered Room 201', time: '2 mins ago' },
    { type: 'object_left', desc: 'Bag left in Conference Room', time: '15 mins ago' },
    { type: 'person_exit', desc: 'Person left Room 305', time: '23 mins ago' },
    { type: 'fighting', desc: 'Unusual activity in Hallway A', time: '1 hour ago' },
    { type: 'person_entry', desc: 'Person entered Office', time: '2 hours ago' }
  ]

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
              <FiActivity className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Activities Overview</h1>
              <p className="text-gray-600">Monitor all detected activities in real-time</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {activityStats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center text-white`}>
                  {stat.icon}
                </div>
                <span className={`text-sm font-semibold ${
                  stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-gray-600 text-sm mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold text-gray-900">{stat.count}</p>
            </motion.div>
          ))}
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Recent Activities</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {recentActivities.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center text-white">
                    <FiActivity size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{activity.desc}</p>
                    <p className="text-sm text-gray-600">{activity.time}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Chart Placeholder */}
        <div className="mt-8 bg-white rounded-lg shadow p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Activity Timeline</h2>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-gray-200">
            <div className="text-center">
              <FiActivity className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-gray-600">Activity timeline chart will be displayed here</p>
              <p className="text-sm text-gray-500 mt-2">Connect backend to see real-time data</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
