'use client'
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiCalendar, FiChevronLeft, FiChevronRight, FiX, FiClock } from 'react-icons/fi'
import { MdPerson, MdPersonOff, MdLocalFireDepartment, MdWarning } from 'react-icons/md'
import { BsBox } from 'react-icons/bs'

export default function CalendarViewPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 1)) // February 2026
  const [selectedDate, setSelectedDate] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [timeFilter, setTimeFilter] = useState('all')

  // Dummy activities for different dates
  const activityData = {
    '2026-02-24': [
      { id: 1, type: 'person_entry', description: 'Person entered room', time: '14:30:22', location: 'Room 201' },
      { id: 2, type: 'person_exit', description: 'Person left room', time: '14:45:10', location: 'Room 201' },
      { id: 3, type: 'object_left', description: 'Belonging left behind', time: '14:50:55', location: 'Room 201' },
      { id: 4, type: 'fighting', description: 'Fighting detected', time: '15:35:40', location: 'Hallway A' },
      { id: 5, type: 'fire', description: 'Fire hazard detected', time: '16:05:22', location: 'Kitchen' }
    ],
    '2026-02-23': [
      { id: 6, type: 'person_entry', description: 'Person entered room', time: '10:15:30', location: 'Room 101' },
      { id: 7, type: 'person_exit', description: 'Person left room', time: '11:05:20', location: 'Room 101' },
      { id: 8, type: 'object_pickup', description: 'Object picked up', time: '15:20:18', location: 'Room 201' }
    ],
    '2026-02-20': [
      { id: 9, type: 'person_entry', description: 'Person entered room', time: '09:00:00', location: 'Room 305' },
      { id: 10, type: 'object_left', description: 'Laptop left behind', time: '17:00:00', location: 'Conference Room' }
    ],
    '2026-02-18': [
      { id: 11, type: 'person_entry', description: 'Person entered room', time: '08:30:15', location: 'Office' },
      { id: 12, type: 'person_exit', description: 'Person left room', time: '18:45:30', location: 'Office' }
    ],
    '2026-02-15': [
      { id: 13, type: 'fire', description: 'Smoke detected', time: '12:15:00', location: 'Storage' }
    ],
    '2026-02-10': [
      { id: 14, type: 'person_entry', description: 'Multiple entries', time: '14:00:00', location: 'Lobby' },
      { id: 15, type: 'person_exit', description: 'Multiple exits', time: '16:30:00', location: 'Lobby' }
    ],
    '2026-02-05': [
      { id: 16, type: 'object_left', description: 'Bag left unattended', time: '13:45:00', location: 'Waiting Area' }
    ]
  }

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    return { firstDay, daysInMonth }
  }

  const { firstDay, daysInMonth } = getDaysInMonth(currentDate)

  const hasActivities = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return activityData[dateStr] && activityData[dateStr].length > 0
  }

  const getActivityCount = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return activityData[dateStr]?.length || 0
  }

  const handleDateClick = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    setSelectedDate(dateStr)
    setShowModal(true)
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const getActivitiesForSelectedDate = () => {
    if (!selectedDate) return []
    const activities = activityData[selectedDate] || []
    
    if (timeFilter === 'all') return activities
    
    return activities.filter(activity => {
      const hour = parseInt(activity.time.split(':')[0])
      if (timeFilter === 'morning') return hour >= 0 && hour < 12
      if (timeFilter === 'afternoon') return hour >= 12 && hour < 18
      if (timeFilter === 'evening') return hour >= 18 && hour < 24
      return true
    })
  }

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

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
              <FiCalendar className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Calendar View</h1>
              <p className="text-gray-600">View activities by date with detailed timeline</p>
            </div>
          </div>
        </div>

        {/* Calendar Card */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Calendar Header */}
          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-6">
            <div className="flex items-center justify-between">
              <button
                onClick={previousMonth}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <FiChevronLeft size={24} />
              </button>
              <h2 className="text-2xl font-bold">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <FiChevronRight size={24} />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="p-6">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center font-semibold text-gray-600 text-sm py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {/* Empty cells for days before month starts */}
              {Array.from({ length: firstDay }).map((_, index) => (
                <div key={`empty-${index}`} className="aspect-square" />
              ))}

              {/* Actual days */}
              {Array.from({ length: daysInMonth }).map((_, index) => {
                const day = index + 1
                const hasActivity = hasActivities(day)
                const activityCount = getActivityCount(day)

                return (
                  <motion.button
                    key={day}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => hasActivity && handleDateClick(day)}
                    className={`aspect-square relative rounded-lg border-2 transition-all ${
                      hasActivity
                        ? 'border-cyan-500 bg-cyan-50 hover:bg-cyan-100 cursor-pointer'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center h-full">
                      <span className={`text-lg font-semibold ${hasActivity ? 'text-cyan-700' : 'text-gray-900'}`}>
                        {day}
                      </span>
                      {hasActivity && (
                        <>
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full" />
                          <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                            {activityCount}
                          </span>
                        </>
                      )}
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="border-t border-gray-200 p-6">
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full" />
                <span className="text-sm text-gray-600">Has Activities</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-200 rounded border-2 border-gray-300" />
                <span className="text-sm text-gray-600">No Activities</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  5
                </div>
                <span className="text-sm text-gray-600">Activity Count</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">Activities on {selectedDate}</h3>
                  <p className="text-cyan-100 mt-1">{getActivitiesForSelectedDate().length} activities found</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <FiX size={24} />
                </button>
              </div>

              {/* Time Filter */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-2">
                  <FiClock className="text-gray-500" size={20} />
                  <select
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value)}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="all">All Day</option>
                    <option value="morning">Morning (00:00 - 11:59)</option>
                    <option value="afternoon">Afternoon (12:00 - 17:59)</option>
                    <option value="evening">Evening (18:00 - 23:59)</option>
                  </select>
                </div>
              </div>

              {/* Activities List */}
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-200px)] custom-scrollbar">
                {getActivitiesForSelectedDate().length > 0 ? (
                  <div className="space-y-4">
                    {getActivitiesForSelectedDate().map((activity) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-4 border-2 border-gray-200 rounded-lg hover:border-cyan-500 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-semibold text-gray-900">{activity.description}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getActivityBadgeColor(activity.type)}`}>
                                    {activity.type.replace('_', ' ')}
                                  </span>
                                  <span className="text-sm text-gray-600">{activity.location}</span>
                                </div>
                              </div>
                              <span className="text-sm font-semibold text-cyan-600">{activity.time}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FiClock className="mx-auto mb-4 text-gray-400" size={48} />
                    <p className="text-gray-600">No activities found for the selected time range</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
