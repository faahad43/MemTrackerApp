'use client'
import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMessageSquare, FiSend, FiPlus, FiMenu, FiX } from 'react-icons/fi'
import { MdSmartToy } from 'react-icons/md'

export default function ChatbotPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'Hello! I\'m your MemTracker AI assistant. I can help you analyze activity data, answer questions about detected events, and provide insights. How can I assist you today?',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const messagesEndRef = useRef(null)

  // Dummy previous chats
  const [previousChats] = useState([
    { id: 1, title: 'Activity Analysis - Today', date: '2026-02-24', preview: 'Can you show me all activities from today?' },
    { id: 2, title: 'Person Detection Query', date: '2026-02-23', preview: 'How many people were detected yesterday?' },
    { id: 3, title: 'Fire Safety Incident', date: '2026-02-22', preview: 'Were there any fire incidents detected?' },
    { id: 4, title: 'Daily Activity Summary', date: '2026-02-21', preview: 'Give me a summary of activities' },
    { id: 5, title: 'Room Entry Tracking', date: '2026-02-20', preview: 'Track all room entries for last week' },
    { id: 6, title: 'Object Detection Report', date: '2026-02-19', preview: 'Objects left in room 201' },
    { id: 7, title: 'Security Alert Review', date: '2026-02-18', preview: 'Show me all security alerts' },
    { id: 8, title: 'Weekly Statistics', date: '2026-02-17', preview: 'Generate weekly activity statistics' }
  ])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage = {
      id: messages.length + 1,
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const aiMessage = {
        id: messages.length + 2,
        role: 'assistant',
        content: generateDummyResponse(inputMessage),
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiMessage])
      setIsLoading(false)
    }, 1500)
  }

  const generateDummyResponse = () => {
    const responses = [
      'Based on the activity logs, I found 15 detected events matching your criteria. Would you like me to provide more details?',
      'I\'ve analyzed the video footage from the specified time period. There were 3 person entries and 2 exits detected.',
      'The system detected unusual activity at 14:32. A person was seen leaving belongings in the monitored area.',
      'No fire or safety hazards were detected in the last 24 hours. All monitoring systems are functioning normally.',
      'Here\'s a summary: 23 person detections, 5 object interactions, 0 security alerts. Everything appears normal.',
      'I found activity data for the requested period. The busiest time was between 2 PM and 4 PM with 12 detections.',
      'Based on the detected features, the person was wearing a blue shirt and dark pants. No hat was detected.',
      'The object was left unattended for approximately 25 minutes before being retrieved.'
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const loadPreviousChat = (chat) => {
    // In a real app, this would load the chat from database
    setMessages([
      {
        id: 1,
        role: 'user',
        content: chat.preview,
        timestamp: new Date(chat.date)
      },
      {
        id: 2,
        role: 'assistant',
        content: 'This is a previously saved conversation. The actual messages would be loaded from the database.',
        timestamp: new Date(chat.date)
      }
    ])
  }

  const startNewChat = () => {
    setMessages([
      {
        id: 1,
        role: 'assistant',
        content: 'Hello! I\'m your MemTracker AI assistant. How can I help you today?',
        timestamp: new Date()
      }
    ])
  }

  return (
    <div className="h-[calc(100vh-4rem)] bg-gray-50 flex">
      {/* Sidebar for Previous Chats */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="w-80 bg-white border-r border-gray-200 flex flex-col"
          >
            <div className="p-4 border-b border-gray-200">
              <button
                onClick={startNewChat}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
              >
                <FiPlus size={20} />
                New Chat
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Previous Chats</h3>
              <div className="space-y-2">
                {previousChats.map((chat) => (
                  <motion.button
                    key={chat.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => loadPreviousChat(chat)}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-100 transition-colors group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FiMessageSquare className="text-white" size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{chat.title}</p>
                        <p className="text-xs text-gray-500 truncate">{chat.preview}</p>
                        <p className="text-xs text-gray-400 mt-1">{chat.date}</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
            >
              {showSidebar ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
              <MdSmartToy className="text-white" size={24} />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">MemTracker AI Assistant</h2>
              <p className="text-sm text-gray-600">Ask me anything about your activity data</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user'
                      ? 'bg-gray-200'
                      : 'bg-gradient-to-br from-cyan-500 to-blue-600'
                  }`}>
                    {message.role === 'user' ? (
                      <span className="text-gray-700 font-bold">U</span>
                    ) : (
                      <MdSmartToy className="text-white" size={20} />
                    )}
                  </div>
                  <div className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-900'
                    }`}>
                      <p className="text-sm md:text-base whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <span className="text-xs text-gray-400 mt-1 px-2">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}

            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="flex gap-3 max-w-[80%]">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MdSmartToy className="text-white" size={20} />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about activities, detections, or any analysis..."
                rows={1}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:outline-none resize-none"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <FiSend size={20} />
                Send
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              AI can make mistakes. Verify important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
