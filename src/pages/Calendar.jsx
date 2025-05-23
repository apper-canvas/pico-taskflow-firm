import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Calendar from '../components/Calendar'
import ApperIcon from '../components/ApperIcon'

const CalendarPage = () => {
  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center space-x-4 mb-6">
            <Link to="/" className="inline-flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 text-primary hover:bg-white/30 transition-all duration-200">
              <ApperIcon name="ArrowLeft" className="w-4 h-4" />
              <span>Back to Tasks</span>
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Task Calendar
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            View your tasks in calendar format with daily, weekly, and monthly views
          </p>
        </motion.div>

        {/* Calendar Component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Calendar />
        </motion.div>
      </div>
    </div>
  )
}

export default CalendarPage