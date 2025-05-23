import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import ApperIcon from './ApperIcon'

const ProjectSidebar = ({
  projects,
  setProjects,
  selectedProject,
  setSelectedProject,
  collapsed,
  setCollapsed,
  taskCount
}) => {
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [expandedProjects, setExpandedProjects] = useState(new Set())
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentId: null,
    color: '#6366f1'
  })

  const projectColors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
    '#f59e0b', '#10b981', '#06b6d4', '#84cc16'
  ]

  useEffect(() => {
    // Auto-expand projects with selected child
    if (selectedProject && selectedProject.parentId) {
      setExpandedProjects(prev => new Set([...prev, selectedProject.parentId]))
    }
  }, [selectedProject])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Please enter a project name')
      return
    }

    if (editingProject) {
      setProjects(projects.map(project => 
        project.id === editingProject.id 
          ? { ...project, ...formData, updatedAt: new Date().toISOString() }
          : project
      ))
      toast.success('Project updated successfully!')
      setEditingProject(null)
    } else {
      const newProject = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setProjects([...projects, newProject])
      toast.success('Project created successfully!')
    }

    resetForm()
  }

  const handleEdit = (project) => {
    setEditingProject(project)
    setFormData({
      name: project.name,
      description: project.description || '',
      parentId: project.parentId,
      color: project.color
    })
    setShowProjectForm(true)
  }

  const handleDelete = (projectId) => {
    // Check if project has sub-projects
    const hasSubProjects = projects.some(p => p.parentId === projectId)
    if (hasSubProjects) {
      toast.error('Cannot delete project with sub-projects. Delete sub-projects first.')
      return
    }

    // Check if project has tasks
    const tasks = JSON.parse(localStorage.getItem('taskflow-tasks') || '[]')
    const hasProjectTasks = tasks.some(t => t.projectId === projectId)
    if (hasProjectTasks) {
      toast.error('Cannot delete project with tasks. Move or delete tasks first.')
      return
    }

    setProjects(projects.filter(project => project.id !== projectId))
    if (selectedProject?.id === projectId) {
      setSelectedProject(null)
    }
    toast.success('Project deleted successfully!')
  }

  const toggleExpand = (projectId) => {
    setExpandedProjects(prev => {
      const newSet = new Set(prev)
      if (newSet.has(projectId)) {
        newSet.delete(projectId)
      } else {
        newSet.add(projectId)
      }
      return newSet
    })
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      parentId: null,
      color: '#6366f1'
    })
    setEditingProject(null)
    setShowProjectForm(false)
  }

  const getParentProjects = () => {
    return projects.filter(p => !p.parentId)
  }

  const getSubProjects = (parentId) => {
    return projects.filter(p => p.parentId === parentId)
  }

  const getTaskCount = (projectId) => {
    const tasks = JSON.parse(localStorage.getItem('taskflow-tasks') || '[]')
    return tasks.filter(t => t.projectId === projectId).length
  }

  const ProjectItem = ({ project, level = 0 }) => {
    const subProjects = getSubProjects(project.id)
    const hasSubProjects = subProjects.length > 0
    const isExpanded = expandedProjects.has(project.id)
    const isSelected = selectedProject?.id === project.id
    const taskCount = getTaskCount(project.id)

    return (
      <div className="project-item-container">
        <div
          className={`project-item flex items-center p-3 rounded-lg cursor-pointer group ${
            isSelected ? 'active' : ''
          } ${level > 0 ? 'ml-6 project-tree-line' : ''}`}
          onClick={() => setSelectedProject(project)}
          style={{ paddingLeft: `${12 + level * 16}px` }}
        >
          {hasSubProjects && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleExpand(project.id)
              }}
              className={`project-expand-btn mr-2 p-1 text-gray-400 hover:text-gray-600 transition-all ${
                isExpanded ? 'expanded' : ''
              }`}
            >
              <ApperIcon name="ChevronRight" className="w-4 h-4" />
            </button>
          )}
          
          {!hasSubProjects && level > 0 && (
            <div className="mr-2 p-1">
              <div className="w-4 h-4" />
            </div>
          )}

          <div
            className="w-3 h-3 rounded-full mr-3 flex-shrink-0"
            style={{ backgroundColor: project.color }}
          />

          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 dark:text-white truncate">
              {project.name}
            </div>
            {taskCount > 0 && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setFormData({ ...formData, parentId: project.id })
                setShowProjectForm(true)
              }}
              className="p-1 text-gray-400 hover:text-primary rounded transition-colors"
              title="Add sub-project"
            >
              <ApperIcon name="Plus" className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleEdit(project)
              }}
              className="p-1 text-gray-400 hover:text-primary rounded transition-colors"
              title="Edit project"
            >
              <ApperIcon name="Edit2" className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleDelete(project.id)
              }}
              className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
              title="Delete project"
            >
              <ApperIcon name="Trash2" className="w-4 h-4" />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {hasSubProjects && isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              {subProjects.map((subProject) => (
                <ProjectItem
                  key={subProject.id}
                  project={subProject}
                  level={level + 1}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <>
      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ width: collapsed ? '4rem' : '22rem' }}
        className="sidebar-transition bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-r border-gray-200 dark:border-gray-700 flex flex-col h-screen sticky top-0"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            {!collapsed && (
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Projects
              </h2>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
            >
              <ApperIcon 
                name={collapsed ? "ChevronRight" : "ChevronLeft"} 
                className="w-5 h-5" 
              />
            </button>
          </div>
        </div>

        {!collapsed && (
          <>
            {/* All Tasks Option */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div
                className={`project-item flex items-center p-3 rounded-lg cursor-pointer group ${
                  !selectedProject ? 'active' : ''
                }`}
                onClick={() => setSelectedProject(null)}
              >
                <div className="w-3 h-3 rounded-full mr-3 bg-gradient-to-br from-primary to-secondary" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">
                    All Tasks
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
                  </div>
                </div>
              </div>
            </div>

            {/* Projects List */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-1">
                {getParentProjects().map((project) => (
                  <ProjectItem key={project.id} project={project} />
                ))}
              </div>

              {projects.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center mx-auto mb-4">
                    <ApperIcon name="FolderPlus" className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                    No projects yet
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Create your first project to organize your tasks
                  </p>
                  <button
                    onClick={() => setShowProjectForm(true)}
                    className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white font-medium rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    Create Project
                  </button>
                </div>
              )}
            </div>

            {/* Add Project Button */}
            {projects.length > 0 && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowProjectForm(true)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-primary to-secondary text-white font-medium rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  <ApperIcon name="Plus" className="w-5 h-5" />
                  <span>New Project</span>
                </button>
              </div>
            )}
          </>
        )}

        {collapsed && (
          <div className="p-4">
            <button
              onClick={() => setShowProjectForm(true)}
              className="w-full flex items-center justify-center p-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              title="New Project"
            >
              <ApperIcon name="Plus" className="w-5 h-5" />
            </button>
          </div>
        )}
      </motion.div>

      {/* Project Form Modal */}
      <AnimatePresence>
        {showProjectForm && (
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
                  {editingProject ? 'Edit Project' : 'Create New Project'}
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
                    Project Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                    placeholder="Enter project name..."
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
                    placeholder="Add project description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Parent Project
                  </label>
                  <select
                    value={formData.parentId || ''}
                    onChange={(e) => setFormData({ ...formData, parentId: e.target.value || null })}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                  >
                    <option value="">No Parent (Top Level)</option>
                    {getParentProjects()
                      .filter(p => p.id !== editingProject?.id)
                      .map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Project Color
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {projectColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          formData.color === color
                            ? 'border-gray-900 dark:border-white scale-110'
                            : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
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
                    {editingProject ? 'Update Project' : 'Create Project'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default ProjectSidebar