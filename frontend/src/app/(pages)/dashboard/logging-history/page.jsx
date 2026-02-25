'use client'
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FiClock, FiFilter, FiDownload, FiSearch } from 'react-icons/fi'
import { MdPerson, MdPersonOff, MdLocalFireDepartment, MdWarning } from 'react-icons/md'
import { BsBox } from 'react-icons/bs'

export default function LoggingHistoryPage() {
  const [dateFilter, setDateFilter] = useState('all')
  const [activityFilter, setActivityFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Dummy activity data
  const activities = [
    {
      id: 1,
      type: 'person_entry',
      description: 'Person entered room',
      timestamp: '2026-02-24 14:30:22',
      location: 'Room 201',
      features: { dress: 'Blue shirt', hat: 'No', accessories: 'Glasses' },
      confidence: 0.95
    },
    {
      id: 2,
      type: 'person_exit',
      description: 'Person left room',
      timestamp: '2026-02-24 14:45:10',
      location: 'Room 201',
      features: { dress: 'Blue shirt', hat: 'No', accessories: 'Glasses' },
      confidence: 0.92
    },
    {
      id: 3,
      type: 'object_left',
      description: 'Belonging left behind',
      timestamp: '2026-02-24 14:50:55',
      location: 'Room 201',
      features: { object: 'Backpack', color: 'Black', duration: '15 mins' },
      confidence: 0.88
    },
    {
      id: 4,
      type: 'person_entry',
      description: 'Person entered room',
      timestamp: '2026-02-24 15:10:33',
      location: 'Room 102',
      features: { dress: 'Red jacket', hat: 'Baseball cap', accessories: 'None' },
      confidence: 0.94
    },
    {
      id: 5,
      type: 'object_pickup',
      description: 'Object picked up',
      timestamp: '2026-02-24 15:20:18',
      location: 'Room 201',
      features: { object: 'Backpack', color: 'Black', action: 'Retrieved' },
      confidence: 0.91
    },
    {
      id: 6,
      type: 'fighting',
      description: 'Unusual activity - Fighting detected',
      timestamp: '2026-02-24 15:35:40',
      location: 'Hallway A',
      features: { persons: 2, severity: 'Medium', duration: '2 mins' },
      confidence: 0.87
    },
    {
      id: 7,
      type: 'fire',
      description: 'Fire hazard detected',
      timestamp: '2026-02-24 16:05:22',
      location: 'Kitchen',
      features: { size: 'Small', type: 'Smoke', status: 'Monitored' },
      confidence: 0.96
    },
    {
      id: 8,
      type: 'person_entry',
      description: 'Person entered room',
      timestamp: '2026-02-24 16:25:44',
      location: 'Room 305',
      features: { dress: 'White shirt', hat: 'No', accessories: 'Watch' },
      confidence: 0.93
    },
    {
      id: 9,
      type: 'person_exit',
      description: 'Person left room',
      timestamp: '2026-02-24 16:40:15',
      location: 'Room 305',
      features: { dress: 'White shirt', hat: 'No', accessories: 'Watch' },
      confidence: 0.90
    },
    {
      id: 10,
      type: 'object_left',
      description: 'Belonging left behind',
      timestamp: '2026-02-24 17:00:00',
      location: 'Conference Room',
      features: { object: 'Laptop', color: 'Silver', duration: '10 mins' },
      confidence: 0.89
    },
    {
      id: 11,
      type: 'person_entry',
      description: 'Person entered room',
      timestamp: '2026-02-23 10:15:30',
      location: 'Room 101',
      features: { dress: 'Green sweater', hat: 'Beanie', accessories: 'Bag' },
      confidence: 0.91
    },
    {
      id: 12,
      type: 'person_exit',
      description: 'Person left room',
      timestamp: '2026-02-23 11:05:20',
      location: 'Room 101',
      features: { dress: 'Green sweater', hat: 'Beanie', accessories: 'Bag' },
      confidence: 0.92
    }
  ]

  const getActivityIcon = (type) => {
    switch (type) {
      case 'person_entry':
        return <MdPerson size={20} className="text-green-600" />
      case 'person_exit':
        return <MdPersonOff size={20} className="text-orange-600" />
      case 'object_left':
      case 'object_pickup':
        return <BsBox size={18} className="text-blue-600" />
      case 'fighting':
        return <MdWarning size={20} className="text-red-600" />
      case 'fire':
        return <MdLocalFireDepartment size={20} className="text-red-600" />
      default:
        return <FiClock size={18} className="text-gray-600" />
    }
  }

  const getActivityBadgeColor = (type) => {
    switch (type) {
      case 'person_entry':
        return 'bg-green-100 text-green-700'
      case 'person_exit':
        return 'bg-orange-100 text-orange-700'
      case 'object_left':
      case 'object_pickup':
        return 'bg-blue-100 text-blue-700'
      case 'fighting':
      case 'fire':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const filteredActivities = activities.filter(activity => {
    const matchesDate = dateFilter === 'all' || activity.timestamp.startsWith(dateFilter)
    const matchesType = activityFilter === 'all' || activity.type === activityFilter
    const matchesSearch = searchQuery === '' ||
      activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.location.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesDate && matchesType && matchesSearch
  })

  const exportToCSV = () => {
    const headers = ['ID', 'Type', 'Description', 'Timestamp', 'Location', 'Confidence', 'Features']
    const csvData = filteredActivities.map(activity => [
      activity.id,
      activity.type,
      activity.description,
      activity.timestamp,
      activity.location,
      activity.confidence,
      JSON.stringify(activity.features)
    ])

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'activity_logs.csv'
    link.click()
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
                <FiClock className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Logging History</h1>
                <p className="text-gray-600">{filteredActivities.length} activities logged</p>
              </div>
            </div>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-cyan-500 hover:text-cyan-600 transition-all"
            >
              <FiDownload size={20} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <FiFilter className="text-gray-500" size={20} />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:outline-none"
              >
                <option value="all">All Dates</option>
                <option value="2026-02-24">Today (2026-02-24)</option>
                <option value="2026-02-23">Yesterday (2026-02-23)</option>
                <option value="2026-02-22">2026-02-22</option>
              </select>
            </div>

            <div>
              <select
                value={activityFilter}
                onChange={(e) => setActivityFilter(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:outline-none"
              >
                <option value="all">All Activities</option>
                <option value="person_entry">Person Entry</option>
                <option value="person_exit">Person Exit</option>
                <option value="object_left">Object Left</option>
                <option value="object_pickup">Object Pickup</option>
                <option value="fighting">Fighting</option>
                <option value="fire">Fire</option>
              </select>
            </div>

            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search activities..."
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Activity Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full min-w-[1200px]">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Description</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Timestamp</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Location</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Features</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredActivities.map((activity, index) => (
                  <motion.tr
                    key={activity.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900">#{activity.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getActivityIcon(activity.type)}
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getActivityBadgeColor(activity.type)}`}>
                          {activity.type.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{activity.description}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{activity.timestamp}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{activity.location}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(activity.features).map(([key, value]) => (
                          <span
                            key={key}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                          >
                            <span className="font-semibold">{key}:</span> {value}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[80px]">
                          <div
                            className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full"
                            style={{ width: `${activity.confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">{(activity.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredActivities.length === 0 && (
            <div className="text-center py-12">
              <FiClock className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-gray-600">No activities found matching your filters</p>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Activities</p>
                <p className="text-2xl font-bold text-gray-900">{filteredActivities.length}</p>
              </div>
              <FiClock className="text-cyan-600" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Person Events</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredActivities.filter(a => a.type.startsWith('person')).length}
                </p>
              </div>
              <MdPerson className="text-green-600" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Object Events</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredActivities.filter(a => a.type.startsWith('object')).length}
                </p>
              </div>
              <BsBox className="text-blue-600" size={28} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Alerts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredActivities.filter(a => a.type === 'fighting' || a.type === 'fire').length}
                </p>
              </div>
              <MdWarning className="text-red-600" size={32} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
