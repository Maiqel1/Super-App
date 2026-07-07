import { useState, Suspense, lazy } from 'react'

const TodoApp = lazy(() => import('todoApp/App'))
const NotesApp = lazy(() => import('notesApp/App'))
const WeatherApp = lazy(() => import('weatherApp/App'))

const apps = [
  { id: 'todo', label: 'Todo', icon: '✅', tag: 'Productivity', desc: 'Organize your day, one task at a time.', Component: TodoApp },
  { id: 'notes', label: 'Notes', icon: '📝', tag: 'Capture', desc: 'Jot down ideas before they slip away.', Component: NotesApp },
  { id: 'weather', label: 'Weather', icon: '🌤️', tag: 'Live data', desc: 'Real-time conditions for any city on earth.', Component: WeatherApp },
]

export default function App() {
  const [active, setActive] = useState('todo')
  const current = apps.find(a => a.id === active)
  const Current = current.Component

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark"><img src="/superapp-logo.png" alt="SuperApp logo" /></span>
          <span className="brand-name">SuperApp</span>
        </div>

        <nav className="nav">
          {apps.map(app => (
            <button
              key={app.id}
              onClick={() => setActive(app.id)}
              className={`nav-item${active === app.id ? ' active' : ''}`}
            >
              <span className="nav-icon">{app.icon}</span>
              <span className="nav-label">{app.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="footer-card">
            <span className="dot" />
            <div>
              <div className="footer-title">All systems go</div>
              <div className="footer-sub">3 micro-frontends online</div>
            </div>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <span className="eyebrow">{current.tag}</span>
          <h1 className="topbar-title">{current.icon} {current.label}</h1>
          <p className="topbar-desc">{current.desc}</p>
        </header>

        <section className="content">
          <div className="stage" key={active}>
            <Suspense fallback={<div className="loader"><span className="spinner" />Loading {current.label}…</div>}>
              <Current />
            </Suspense>
          </div>
        </section>
      </main>
    </div>
  )
}
