import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Sidebar from './Sidebar'

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const router = useRouter()

  return (
    <div className="layout-container">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <main className="content-area">
          {children}
        </main>
      </div>
    </div>
  )
}