import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Sidebar from './Sidebar'
import Header from './Header'

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const router = useRouter()

  return (
    <div className="layout-container">
      <Sidebar isOpen={sidebarOpen} />
      <div className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="content-area">
          {children}
        </main>
      </div>
    </div>
  )
}