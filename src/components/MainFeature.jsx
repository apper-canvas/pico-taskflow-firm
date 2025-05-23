import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { format, isToday, isTomorrow, isPast } from 'date-fns'
import ApperIcon from './ApperIcon'

const MainFeature = () => {
  const [tasks, setTasks] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    status: 'pending'
  })

  const priorityColors = {
    low: 'bg-blue-100 text-blue-800 border-blue-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    urgent: 'bg-red-100 text-red-800 border-red-200'
  }

  const statusColors = {
    pending: 'bg-gray-100 text-gray-800 border-gray-200',
    'in-progress': 'bg-blue-100 text-blue-800 border-blue-200',
    completed: 'bg-green-100 text-green-800 border-green-200'
  }

  useEffect(() => {
    const savedTasks = localStorage.getItem('taskflow-tasks')
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('taskflow-tasks', JSON.stringify(tasks))
    // Make tasks available for other components
    window.taskFlowData = { tasks, setTasks }
  }, [tasks])

  useEffect(() => {
    window.taskFlowData = { tasks, setTasks }
  }, [tasks, setTasks])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast.error('Please enter a task title')
      return
    }

    if (editingTask) {
      setTasks(tasks.map(task => 
        task.id === editingTask.id 
          ? { ...task, ...formData, updatedAt: new Date().toISOString() }
          : task
      ))
      toast.success('Task updated successfully!')
      setEditingTask(null)
    } else {
      const newTask = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setTasks([newTask, ...tasks])
      toast.success('Task created successfully!')
    }

    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
      status: 'pending'
    })
    setShowForm(false)
  }

  const handleEdit = (task) => {
    setEditingTask(task)
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate,
      status: task.status
    })
    setShowForm(true)
  }

  const handleDelete = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId))
    toast.success('Task deleted successfully!')
  }

  const toggleStatus = (taskId) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const newStatus = task.status === 'completed' ? 'pending' : 'completed'
        return { ...task, status: newStatus, updatedAt: new Date().toISOString() }
      }
      return task
    }))
  }

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = filter === 'all' || task.status === filter
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const getDateDisplay = (dateString) => {
    if (!dateString) return null
    const date = new Date(dateString)
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    if (isPast(date)) return `Overdue - ${format(date, 'MMM d')}`
    return format(date, 'MMM d, yyyy')
  }

  const getTasksForExport = () => {
    return tasks
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
      status: 'pending'
    })
    setEditingTask(null)
    setShowForm(false)
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header Controls */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl border border-white/20 dark:border-gray-700/30 p-4 md:p-6 mb-6 md:mb-8"
      >
        <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
              />
            </div>
          </div>

          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-3 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 sm:w-auto"
          >
            <option value="all">All Tasks</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          {/* Add Task Button */}
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2 sm:w-auto"
          >
            <ApperIcon name="Plus" className="w-5 h-5" />
            <span className="hidden sm:inline">Add Task</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </motion.div>

      {/* Task Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && resetForm()}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingTask ? 'Edit Task' : 'Create New Task'}
                </h3>
                <button
                  onClick={resetForm}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <ApperIcon name="X" className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                    placeholder="Enter task title..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200 resize-none"
                    placeholder="Add task description..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-6 py-3 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    {editingTask ? 'Update Task' : 'Create Task'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <AnimatePresence>
          {filteredTasks.map((task) => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl border border-white/20 dark:border-gray-700/30 p-4 md:p-6 hover:shadow-soft transition-all duration-300"
            >
              {/* Task Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h4 className={`text-lg font-semibold mb-2 ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                    {task.title}
                  </h4>
                  {task.description && (
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-2">
                      {task.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => toggleStatus(task.id)}
                  className={`ml-3 p-2 rounded-lg transition-all duration-200 ${
                    task.status === 'completed'
                      ? 'bg-green-100 text-green-600 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  <ApperIcon name="Check" className="w-5 h-5" />
                </button>
              </div>

              {/* Task Meta */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${priorityColors[task.priority]}`}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[task.status]}`}>
                  {task.status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </span>
              </div>

              {/* Due Date */}
              {task.dueDate && (
                <div className="flex items-center space-x-2 mb-4">
                  <ApperIcon name="Calendar" className="w-4 h-4 text-gray-400" />
                  <span className={`text-sm ${
                    isPast(new Date(task.dueDate)) && task.status !== 'completed'
                      ? 'text-red-500 font-medium'
                      : 'text-gray-600 dark:text-gray-300'
                  }`}>
                    {getDateDisplay(task.dueDate)}
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(task)}
                    className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-200"
                  >
                    <ApperIcon name="Edit2" className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                  >
                    <ApperIcon name="Trash2" className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-xs text-gray-400">
                  {format(new Date(task.createdAt), 'MMM d')}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredTasks.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12 md:py-16"
        >
          <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ApperIcon name="CheckSquare" className="w-12 h-12 md:w-16 md:h-16 text-white" />
          </div>
          <h3 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            {searchQuery || filter !== 'all' ? 'No tasks found' : 'No tasks yet'}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            {searchQuery || filter !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Create your first task to get started with TaskFlow'
            }
          </p>
          {!searchQuery && filter === 'all' && (
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Create Your First Task
            </button>
          )}
        </motion.div>
      )}
    </div>
  )
}

export default MainFeature