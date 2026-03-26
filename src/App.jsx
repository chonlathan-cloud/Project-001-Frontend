import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import DashboardPage from './DashboardPage'
import ProjectPage from './ProjectPage'
import ProjectDetailPage from './ProjectDetailPage'
import InsightsPage from './InsightsPage'
import InputPage from './InputPage'
import ChatAIPage from './ChatAIPage'
import SettingPage from './SettingPage'
import './index.css'

function App() {
  return (
    <Router>
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/project" element={<ProjectPage />} />
          <Route path="/project/detail" element={<ProjectDetailPage />} />
          <Route path="/project/detail/:projectId" element={<ProjectDetailPage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/input" element={<InputPage />} />
          <Route path="/chat-ai" element={<ChatAIPage />} />
          <Route path="/setting" element={<SettingPage />} />
          <Route path="*" element={<DashboardPage />} />
        </Routes>
      </main>
    </Router>
  )
}

export default App
