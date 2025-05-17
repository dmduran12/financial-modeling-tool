import { useEffect, useState } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import axios from 'axios'

interface Project {
  id: number
  name: string
  location?: string
  total_credits: number
  retired_credits: number
}

function Home() {
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    axios.get('/api/projects').then(res => setProjects(res.data))
  }, [])

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Projects</h1>
      <ul className="space-y-2">
        {projects.map(p => (
          <li key={p.id} className="border p-2 rounded">
            <Link to={`/projects/${p.id}`} className="text-blue-600">
              {p.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ProjectDetail({ id }: { id: string }) {
  const [project, setProject] = useState<Project | null>(null)
  useEffect(() => {
    axios.get(`/api/projects/${id}`).then(res => setProject(res.data))
  }, [id])

  if (!project) return <div>Loading...</div>
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-2">{project.name}</h1>
      <p>Location: {project.location}</p>
      <p>Total Credits: {project.total_credits}</p>
      <p>Retired Credits: {project.retired_credits}</p>
      <Link to="/" className="text-blue-600 mt-4 inline-block">Back</Link>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/projects/:id" element={<ProjectPage />} />
    </Routes>
  )
}

function ProjectPage() {
  const id = window.location.pathname.split('/').pop() || ''
  return <ProjectDetail id={id} />
}
