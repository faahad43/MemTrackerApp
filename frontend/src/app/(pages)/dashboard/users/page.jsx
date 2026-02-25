'use client'
import React, { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff, FiX, FiUsers, FiGrid, FiList } from 'react-icons/fi'
import { showSuccessToast, showErrorToast, showLoadingToast, dismissToast } from '@/utils/toast'
import LoadingScreen from '@/components/LoadingScreen'

// Delete Confirmation Modal
function DeleteConfirmationModal({ isOpen, onClose, onConfirm, userName, isLoading }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <span className="font-semibold">{userName}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Add/Edit User Form
function AddUserForm({ onClose, onUserAdded, editingUser }) {
  const [formData, setFormData] = useState({
    firstName: editingUser?.firstName || '',
    lastName: editingUser?.lastName || '',
    username: editingUser?.username || '',
    email: editingUser?.email || '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (editingUser) {
      setFormData({
        firstName: editingUser.firstName,
        lastName: editingUser.lastName,
        username: editingUser.username,
        email: editingUser.email,
        password: '',
        confirmPassword: ''
      })
    }
  }, [editingUser])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.firstName) return showErrorToast('Enter first name')
    if (!formData.lastName) return showErrorToast('Enter last name')
    if (!formData.username) return showErrorToast('Enter username')
    if (!formData.email) return showErrorToast('Enter email')
    if (!editingUser && !formData.password) return showErrorToast('Enter password')
    if (formData.password && formData.password !== formData.confirmPassword) return showErrorToast('Passwords do not match')

    setIsLoading(true)
    const loadingToastId = showLoadingToast(editingUser ? 'Updating user...' : 'Adding user...')
    
    try {
      let res
      if (editingUser) {
        res = await fetch(`/api/user/add/${editingUser._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
      } else {
        res = await fetch('/api/user/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
      }
      const data = await res.json()
      dismissToast(loadingToastId)
      
      if (res.ok) {
        showSuccessToast(editingUser ? 'User updated successfully!' : 'User added successfully!')
        onUserAdded()
      } else {
        showErrorToast(data.error || 'Failed to save user')
      }
    } catch {
      dismissToast(loadingToastId)
      showErrorToast('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.form
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-lg shadow-xl p-8 space-y-6 w-full max-w-md max-h-[90vh] overflow-y-auto custom-scrollbar"
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">{editingUser ? 'Edit User' : 'Add User'}</h2>
          <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <FiX size={24} />
          </button>
        </div>
        
        <div>
          <label htmlFor="firstName" className="block font-bold text-slate-700 mb-2">First Name</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:outline-none transition-colors"
            placeholder="John"
          />
        </div>
        
        <div>
          <label htmlFor="lastName" className="block font-bold text-slate-700 mb-2">Last Name</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:outline-none transition-colors"
            placeholder="Doe"
          />
        </div>
        
        <div>
          <label htmlFor="username" className="block font-bold text-slate-700 mb-2">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:outline-none transition-colors"
            placeholder="johndoe"
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block font-bold text-slate-700 mb-2">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:outline-none transition-colors"
            placeholder="john@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block font-bold text-slate-700 mb-2">
            {editingUser ? 'New Password (optional)' : 'Password'}
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:outline-none transition-colors"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
          </div>
        </div>
        
        <div>
          <label htmlFor="confirmPassword" className="block font-bold text-slate-700 mb-2">Confirm Password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:outline-none transition-colors"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
          </div>
        </div>
        
        <div className="flex gap-4 justify-end pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 font-medium transition-all disabled:opacity-50"
          >
            {isLoading ? (editingUser ? 'Updating...' : 'Adding...') : (editingUser ? 'Update' : 'Add')}
          </button>
        </div>
      </motion.form>
    </motion.div>
  )
}

export default function UserManagementPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [viewMode, setViewMode] = useState('list')
  const [dateFilter, setDateFilter] = useState('Recently Added')
  const [filteredUsers, setFilteredUsers] = useState([])
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    userId: null,
    userName: '',
    isLoading: false
  })

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/user/getAllUsers')
      const data = await res.json()
      setUsers(data.data || [])
      setFilteredUsers(data.data || [])
    } catch {
      setUsers([])
      setFilteredUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    const sortedUsers = [...users]
    switch (dateFilter) {
      case 'Recently Added':
        sortedUsers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        break
      case 'Ascending':
        sortedUsers.sort((a, b) => a.firstName.localeCompare(b.firstName))
        break
      case 'Descending':
        sortedUsers.sort((a, b) => b.firstName.localeCompare(a.firstName))
        break
      default:
        break
    }
    setFilteredUsers(sortedUsers)
  }, [dateFilter, users])

  if (!isLoaded) {
    return <LoadingScreen isLoading={true} />
  }

  const role = user?.publicMetadata?.role || 'user'
  if (role !== 'admin') {
    router.push('/dashboard')
    return null
  }

  const handleUserAdded = () => {
    fetchUsers()
    setShowAddForm(false)
    setEditingUser(null)
  }

  const handleCloseForm = () => {
    setShowAddForm(false)
    setEditingUser(null)
  }

  const handleEditUser = (user) => {
    setEditingUser(user)
    setShowAddForm(true)
  }

  const handleDeleteClick = (userId, userName) => {
    setDeleteModal({
      isOpen: true,
      userId,
      userName,
      isLoading: false
    })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteModal.userId) return
    
    setDeleteModal(prev => ({ ...prev, isLoading: true }))
    const loadingToastId = showLoadingToast('Deleting user...')
    
    try {
      const res = await fetch(`/api/user/add/${deleteModal.userId}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      dismissToast(loadingToastId)
      
      if (res.ok) {
        showSuccessToast('User deleted successfully!')
        fetchUsers()
        setDeleteModal({ isOpen: false, userId: null, userName: '', isLoading: false })
      } else {
        showErrorToast(data.error || 'Failed to delete user')
        setDeleteModal(prev => ({ ...prev, isLoading: false }))
      }
    } catch {
      dismissToast(loadingToastId)
      showErrorToast('An unexpected error occurred')
      setDeleteModal(prev => ({ ...prev, isLoading: false }))
    }
  }

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, userId: null, userName: '', isLoading: false })
  }

  return (
    <div className="p-4 md:p-8">
      {loading ? (
        <LoadingScreen isLoading={loading} />
      ) : (
        <>
          {/* Header */}
          <div className="max-w-7xl mx-auto mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
                  <FiUsers className="text-white" size={28} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                  <p className="text-gray-600">{filteredUsers.length} total users</p>
                </div>
              </div>
              
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
              >
                <FiPlus size={20} />
                Add User
              </button>
            </div>
          </div>

          {/* Filters and View Toggle */}
          <div className="max-w-7xl mx-auto mb-6">
            <div className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-3">
                <label className="text-gray-700 font-medium">Sort by:</label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:outline-none"
                >
                  <option value="Recently Added">Recently Added</option>
                  <option value="Ascending">A-Z</option>
                  <option value="Descending">Z-A</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow' : 'hover:bg-gray-200'} transition-all`}
                >
                  <FiGrid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow' : 'hover:bg-gray-200'} transition-all`}
                >
                  <FiList size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Users Display */}
          <div className="max-w-7xl mx-auto">
            {viewMode === 'list' ? (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Username</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Created At</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-900">{user.firstName} {user.lastName}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{user.username}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => handleEditUser(user)}
                                className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                              >
                                <FiEdit2 size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(user._id, `${user.firstName} ${user.lastName}`)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <FiTrash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.map((user) => (
                  <motion.div
                    key={user._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(user._id, `${user.firstName} ${user.lastName}`)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {user.firstName} {user.lastName}
                    </h3>
                    <p className="text-sm text-gray-600 mb-1">{user.email}</p>
                    <p className="text-sm text-gray-500">@{user.username}</p>
                    <p className="text-xs text-gray-400 mt-3">
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <AnimatePresence>
            {showAddForm && (
              <AddUserForm
                onClose={handleCloseForm}
                onUserAdded={handleUserAdded}
                editingUser={editingUser}
              />
            )}
          </AnimatePresence>

          <DeleteConfirmationModal
            isOpen={deleteModal.isOpen}
            onClose={handleDeleteCancel}
            onConfirm={handleDeleteConfirm}
            userName={deleteModal.userName}
            isLoading={deleteModal.isLoading}
          />
        </>
      )}
    </div>
  )
}
