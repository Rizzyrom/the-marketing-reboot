'use client'

import { useState, useEffect } from 'react'
import { supabase, Project } from '@/lib/supabase'

interface ProjectManagerProps {
  profileId: string
}

export default function ProjectManager({ profileId }: ProjectManagerProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    status: 'active',
    url: ''
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProjects()
  }, [profileId])

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })

    if (data) {
      setProjects(data)
    }
    setLoading(false)
  }

  const addProject = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const { data, error } = await supabase
      .from('projects')
      .insert([{
        ...newProject,
        profile_id: profileId
      }])
      .select()

    if (data) {
      setProjects([...data, ...projects])
      setNewProject({ title: '', description: '', status: 'active', url: '' })
      setShowAddForm(false)
    }
  }

  const deleteProject = async (projectId: string) => {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)

    if (!error) {
      setProjects(projects.filter(p => p.id !== projectId))
    }
  }

  const updateProjectStatus = async (projectId: string, status: string) => {
    const { error } = await supabase
      .from('projects')
      .update({ status })
      .eq('id', projectId)

    if (!error) {
      setProjects(projects.map(p => 
        p.id === projectId ? { ...p, status } : p
      ))
    }
  }

  if (loading) {
    return <div className="text-center">Loading projects...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-orbitron text-2xl font-bold">Manage Projects</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          + Add Project
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={addProject} className="glass-bg rounded-2xl p-6 space-y-4">
          <h3 className="font-semibold text-lg">Add New Project</h3>
          
          <div>
            <label className="block text-sm font-semibold mb-2">Project Title</label>
            <input
              type="text"
              required
              value={newProject.title}
              onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
              className="w-full p-3 bg-slate-800 border border-white/10 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              placeholder="My Awesome Marketing Campaign"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Description</label>
            <textarea
              value={newProject.description}
              onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full p-3 bg-slate-800 border border-white/10 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              placeholder="Brief description of what you're working on..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Status</label>
              <select
                value={newProject.status}
                onChange={(e) => setNewProject(prev => ({ ...prev, status: e.target.value }))}
                className="w-full p-3 bg-slate-800 border border-white/10 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="paused">Paused</option>
                <option value="planning">Planning</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Project URL (optional)</label>
              <input
                type="url"
                value={newProject.url}
                onChange={(e) => setNewProject(prev => ({ ...prev, url: e.target.value }))}
                className="w-full p-3 bg-slate-800 border border-white/10 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="https://project-link.com"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              Add Project
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {projects.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <div className="text-4xl mb-4">🚧</div>
          <p>No projects added yet. Share what you're working on!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="glass-bg rounded-2xl p-6 group">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg">{project.title}</h3>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => deleteProject(project.id)}
                    className="text-red-400 hover:text-red-300 p-1"
                    title="Delete project"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {project.description && (
                <p className="text-slate-300 mb-4">{project.description}</p>
              )}

              <div className="flex justify-between items-center">
                <select
                  value={project.status || 'active'}
                  onChange={(e) => updateProjectStatus(project.id, e.target.value)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border-0 ${
                    project.status === 'active' ? 'bg-green-500/20 text-green-400' :
                    project.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                    project.status === 'paused' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-slate-500/20 text-slate-400'
                  }`}
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="paused">Paused</option>
                  <option value="planning">Planning</option>
                </select>

                {project.url && (
                  <a 
                    href={project.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    View Project →
                  </a>
                )}
              </div>

              <div className="text-xs text-slate-500 mt-3">
                Created {new Date(project.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}