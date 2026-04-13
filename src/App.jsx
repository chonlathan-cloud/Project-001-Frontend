import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Loading from './components/Loading'
import './index.css'

const DashboardPage = lazy(() => import('./DashboardPage'))
const ProjectPage = lazy(() => import('./ProjectPage'))
const ProjectDetailPage = lazy(() => import('./ProjectDetailPage'))
const InsightsPage = lazy(() => import('./InsightsPage'))
const InputPage = lazy(() => import('./InputPage'))
const ApprovalPage = lazy(() => import('./ApprovalPage'))
const ChatAIPage = lazy(() => import('./ChatAIPage'))
const SettingPage = lazy(() => import('./SettingPage'))

function App() {
  return (
    <Router>
      <Sidebar />
      <main className="main-content">
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/project" element={<ProjectPage />} />
            <Route path="/project/detail" element={<ProjectDetailPage />} />
            <Route path="/project/detail/:projectId" element={<ProjectDetailPage />} />
            <Route path="/insights" element={<InsightsPage />} />
            <Route path="/input" element={<InputPage />} />
            <Route path="/approval" element={<ApprovalPage />} />
            <Route path="/chat-ai" element={<ChatAIPage />} />
            <Route path="/setting" element={<SettingPage />} />
            <Route path="*" element={<DashboardPage />} />
          </Routes>
        </Suspense>
      </main>
    </Router>
  )
}

export default App
