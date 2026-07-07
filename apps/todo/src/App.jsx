import { useState, useEffect, useRef } from 'react'
import './styles.css'

const PRIOS = ['low', 'med', 'high']
const PRIO_META = {
  low: { label: 'Low', color: 'var(--p-low)' },
  med: { label: 'Med', color: 'var(--p-med)' },
  high: { label: 'High', color: 'var(--p-high)' },
}
const FILTERS = ['all', 'active', 'completed']

export default function App() {
  const [todos, setTodos] = useState(() => JSON.parse(localStorage.getItem('todos') || '[]'))
  const [input, setInput] = useState('')
  const [prio, setPrio] = useState('med')
  const [filter, setFilter] = useState('all')
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')
  const editRef = useRef(null)

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos))
  }, [todos])

  useEffect(() => {
    if (editingId != null) editRef.current?.focus()
  }, [editingId])

  const add = () => {
    if (!input.trim()) return
    setTodos([{ id: Date.now(), text: input.trim(), done: false, prio }, ...todos])
    setInput('')
  }

  const toggle = (id) => setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t))
  const remove = (id) => setTodos(todos.filter(t => t.id !== id))
  const clearCompleted = () => setTodos(todos.filter(t => !t.done))
  const cyclePrio = () => setPrio(PRIOS[(PRIOS.indexOf(prio) + 1) % PRIOS.length])

  const startEdit = (todo) => {
    setEditingId(todo.id)
    setEditText(todo.text)
  }
  const commitEdit = () => {
    if (editText.trim()) {
      setTodos(todos.map(t => t.id === editingId ? { ...t, text: editText.trim() } : t))
    }
    setEditingId(null)
  }

  const visible = todos.filter(t =>
    filter === 'active' ? !t.done : filter === 'completed' ? t.done : true
  )
  const doneCount = todos.filter(t => t.done).length
  const progress = todos.length ? doneCount / todos.length : 0

  const emptyCopy = {
    all: 'No tasks yet — add your first one above.',
    active: 'Nothing active. Enjoy the calm. 🌊',
    completed: 'No completed tasks yet. Go get one done!',
  }

  return (
    <div className="todo-app">
      <div className="panel">
        <div className="panel-inner">
          <span className="eyebrow-sm">Today</span>
          <div className="head">
            <h2 className="title">Your tasks</h2>
            <span className="count">{doneCount}/{todos.length}</span>
          </div>

          <div className="progress">
            <div className="progress-bar" style={{ transform: `scaleX(${progress})` }} />
          </div>

          <div className="composer">
            <input
              className="input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && add()}
              placeholder="What needs doing?"
            />
            <button className="prio-btn" onClick={cyclePrio} title="Cycle priority">
              <span className="prio-dot" style={{ color: PRIO_META[prio].color, background: PRIO_META[prio].color }} />
              {PRIO_META[prio].label}
            </button>
            <button className="add-btn" onClick={add}>
              <span className="plus">+</span>Add
            </button>
          </div>

          <div className="filters">
            {FILTERS.map(f => (
              <button
                key={f}
                className={`seg${filter === f ? ' active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f[0].toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {visible.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">🗒️</div>
              <p>{emptyCopy[filter]}</p>
            </div>
          ) : (
            <div className="list">
              {visible.map(todo => (
                <div key={todo.id} className={`item${todo.done ? ' done' : ''}`}>
                  <span className="prio-bar" style={{ color: PRIO_META[todo.prio || 'med'].color, background: PRIO_META[todo.prio || 'med'].color }} />
                  <label className="check">
                    <input type="checkbox" checked={todo.done} onChange={() => toggle(todo.id)} />
                    <span className="box" />
                  </label>
                  {editingId === todo.id ? (
                    <input
                      ref={editRef}
                      className="edit-input"
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                      onBlur={commitEdit}
                      onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditingId(null) }}
                    />
                  ) : (
                    <span className="item-text" onDoubleClick={() => startEdit(todo)} title="Double-click to edit">
                      {todo.text}
                    </span>
                  )}
                  <button className="remove" onClick={() => remove(todo.id)} aria-label="Delete task">✕</button>
                </div>
              ))}
            </div>
          )}

          {doneCount > 0 && (
            <div className="toolbar">
              <button className="clear" onClick={clearCompleted}>Clear completed ({doneCount})</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
