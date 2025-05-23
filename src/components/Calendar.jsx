import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  addWeeks, 
  addMonths, 
  subDays, 
  subWeeks, 
  subMonths, 
  isSameDay, 
  isSameMonth, 
  isToday,
  parseISO
} from 'date-fns'
import ApperIcon from './ApperIcon'

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState('monthly') // daily, weekly, monthly
  const [tasks, setTasks] = useState([])
  const [selectedTask, setSelectedTask] = useState(null)

  // Task status colors for calendar display
  const statusColors = {
    'pending': 'bg-yellow-400 border-yellow-500',
    'in-progress': 'bg-blue-400 border-blue-500', 
    'completed': 'bg-green-400 border-green-500'
  }

  // Load tasks from localStorage
  useEffect(() => {
    const loadTasks = () => {
      const savedTasks = localStorage.getItem('taskflow-tasks')
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks))
      }
      // Also check for tasks from MainFeature component
      if (window.taskFlowData?.tasks) {
        setTasks(window.taskFlowData.tasks)
      }
    }

    loadTasks()
    
    // Listen for storage changes
    window.addEventListener('storage', loadTasks)
    
    // Poll for updates from MainFeature
    const interval = setInterval(loadTasks, 1000)
    
    return () => {
      window.removeEventListener('storage', loadTasks)
      clearInterval(interval)
    }
  }, [])

  // Navigation functions
  const navigatePrevious = () => {
    switch (view) {
      case 'daily':
        setCurrentDate(subDays(currentDate, 1))
        break
      case 'weekly':
        setCurrentDate(subWeeks(currentDate, 1))
        break
      case 'monthly':
        setCurrentDate(subMonths(currentDate, 1))
        break
    }
  }

  const navigateNext = () => {
    switch (view) {
      case 'daily':
        setCurrentDate(addDays(currentDate, 1))
        break
      case 'weekly':
        setCurrentDate(addWeeks(currentDate, 1))
        break
      case 'monthly':
        setCurrentDate(addMonths(currentDate, 1))
        break
    }
  }

  const navigateToday = () => {
    setCurrentDate(new Date())
  }

  // Get tasks for a specific date
  const getTasksForDate = (date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false
      try {
        const taskDate = new Date(task.dueDate)
        return isSameDay(taskDate, date)
      } catch {
        return false
      }
    })
  }

  // Handle task click
  const handleTaskClick = (task) => {
    setSelectedTask(task)
  }

  // Edit task function
  const editTask = (task) => {
    // Update tasks in localStorage and notify MainFeature
    const updatedTask = { ...task, status: task.status === 'completed' ? 'pending' : 'completed' }
    const updatedTasks = tasks.map(t => t.id === task.id ? updatedTask : t)
    
    setTasks(updatedTasks)
    localStorage.setItem('taskflow-tasks', JSON.stringify(updatedTasks))
    
    // Update MainFeature data if available
    if (window.taskFlowData?.setTasks) {
      window.taskFlowData.setTasks(updatedTasks)
    }
    
    toast.success('Task updated successfully!')
    setSelectedTask(null)
  }

  // Render daily view
  const renderDailyView = () => {
    const dayTasks = getTasksForDate(currentDate)
    
    return (
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl border border-white/20 dark:border-gray-700/30 p-6">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {format(currentDate, 'EEEE, MMMM d, yyyy')}
          </h3>
          {isToday(currentDate) && (
            <span className="inline-block mt-2 px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium">
              Today
            </span>
          )}
        </div>
        
        <div className="space-y-3">
          {dayTasks.length > 0 ? (
            dayTasks.map(task => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-4 rounded-xl border-l-4 cursor-pointer hover:shadow-md transition-all duration-200 ${statusColors[task.status]} bg-white dark:bg-gray-700`}
                onClick={() => handleTaskClick(task)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className={`font-semibold ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {task.description}
                      </p>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    task.status === 'completed' ? 'bg-green-100 text-green-800' :
                    task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {task.status.replace('-', ' ').toUpperCase()}
                  </span>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <ApperIcon name="Calendar" className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No tasks scheduled for this day</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Render weekly view
  const renderWeeklyView = () => {
    const weekStart = startOfWeek(currentDate)
    const weekEnd = endOfWeek(currentDate)
    const days = []
    
    for (let day = weekStart; day <= weekEnd; day = addDays(day, 1)) {
      days.push(day)
    }
    
    return (
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl border border-white/20 dark:border-gray-700/30 p-6">
        <div className="grid grid-cols-7 gap-4">
          {days.map(day => {
            const dayTasks = getTasksForDate(day)
            return (
              <div key={day.toISOString()} className="min-h-32">
                <div className={`text-center p-2 rounded-lg mb-2 ${
                  isToday(day) ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700'
                }`}>
                  <div className="text-xs font-medium">
                    {format(day, 'EEE')}
                  </div>
                  <div className="text-lg font-bold">
                    {format(day, 'd')}
                  </div>
                </div>
                
                <div className="space-y-1">
                  {dayTasks.slice(0, 3).map(task => (
                    <div
                      key={task.id}
                      className={`text-xs p-1 rounded cursor-pointer ${statusColors[task.status]} text-white`}
                      onClick={() => handleTaskClick(task)}
                    >
                      {task.title.length > 15 ? task.title.substring(0, 15) + '...' : task.title}
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{dayTasks.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Render monthly view
  const renderMonthlyView = () => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calendarStart = startOfWeek(monthStart)
    const calendarEnd = endOfWeek(monthEnd)
    
    const days = []
    for (let day = calendarStart; day <= calendarEnd; day = addDays(day, 1)) {
      days.push(day)
    }
    
    return (
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl border border-white/20 dark:border-gray-700/30 p-6">
        {/* Month header */}
        <div className="grid grid-cols-7 gap-4 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-semibold text-gray-600 dark:text-gray-400 py-2">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-4">
          {days.map(day => {
            const dayTasks = getTasksForDate(day)
            const isCurrentMonth = isSameMonth(day, currentDate)
            
            return (
              <div key={day.toISOString()} className={`min-h-24 p-2 rounded-lg border ${
                isCurrentMonth ? 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600' : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700'
              } ${isToday(day) ? 'ring-2 ring-primary' : ''}`}>
                <div className={`text-sm font-medium mb-1 ${
                  isToday(day) ? 'text-primary font-bold' : 
                  isCurrentMonth ? 'text-gray-900 dark:text-white' : 'text-gray-400'
                }`}>
                  {format(day, 'd')}
                </div>
                
                <div className="space-y-1">
                  {dayTasks.slice(0, 2).map(task => (
                    <div
                      key={task.id}
                      className={`text-xs p-1 rounded cursor-pointer ${statusColors[task.status]} text-white`}
                      onClick={() => handleTaskClick(task)}
                    >
                      {task.title.length > 10 ? task.title.substring(0, 10) + '...' : task.title}
                    </div>
                  ))}
                  {dayTasks.length > 2 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{dayTasks.length - 2}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Get current view title
  const getViewTitle = () => {
    switch (view) {
      case 'daily':
        return format(currentDate, 'MMMM d, yyyy')
      case 'weekly':
        return `${format(startOfWeek(currentDate), 'MMM d')} - ${format(endOfWeek(currentDate), 'MMM d, yyyy')}`
      case 'monthly':
        return format(currentDate, 'MMMM yyyy')
      default:
        return ''
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Calendar Controls */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl border border-white/20 dark:border-gray-700/30 p-4 md:p-6 mb-6"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Navigation */}
          <div className="flex items-center space-x-4">
            <button
              onClick={navigatePrevious}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-200"
            >
              <ApperIcon name="ChevronLeft" className="w-5 h-5" />
            </button>
            
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white min-w-fit">
              {getViewTitle()}
            </h2>
            
            <button
              onClick={navigateNext}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-200"
            >
              <ApperIcon name="ChevronRight" className="w-5 h-5" />
            </button>
          </div>
          
          {/* View Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={navigateToday}
              className="px-4 py-2 text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-all duration-200"
            >
              Today
            </button>
            
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {['daily', 'weekly', 'monthly'].map(viewOption => (
                <button
                  key={viewOption}
                  onClick={() => setView(viewOption)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-all duration-200 capitalize ${
                    view === viewOption 
                      ? 'bg-primary text-white shadow-sm' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-primary'
                  }`}
                >
                  {viewOption}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Calendar Content */}
      <motion.div
        key={view}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        {view === 'daily' && renderDailyView()}
        {view === 'weekly' && renderWeeklyView()}
        {view === 'monthly' && renderMonthlyView()}
      </motion.div>

      {/* Task Detail Modal */}
      <AnimatePresence>
        {selectedTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setSelectedTask(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Task Details</h3>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <ApperIcon name="X" className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{selectedTask.title}</h4>
                  {selectedTask.description && (
                    <p className="text-gray-600 dark:text-gray-300 mt-1">{selectedTask.description}</p>
                  )}
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    selectedTask.status === 'completed' ? 'bg-green-100 text-green-800' :
                    selectedTask.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedTask.status.replace('-', ' ').toUpperCase()}
                  </span>
                  
                  <span className="text-sm text-gray-500">
                    Priority: {selectedTask.priority}
                  </span>
                </div>
                
                <button
                  onClick={() => editTask(selectedTask)}
                  className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Toggle Status
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Calendar