import { useState, useEffect, useRef } from 'react'
import './styles.css'

const COLORS = ['#7c3cff', '#d946ef', '#22d3ee', '#34f5c5', '#fb3a7e']

const formatDate = (id) =>
  new Date(id).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

export default function App() {
  const [notes, setNotes] = useState(() => JSON.parse(localStorage.getItem('notes') || '[]'))
  const [input, setInput] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [query, setQuery] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')
  const editRef = useRef(null)

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes))
  }, [notes])

  useEffect(() => {
    if (editingId != null) editRef.current?.focus()
  }, [editingId])

  const add = () => {
    if (!input.trim()) return
    setNotes([{ id: Date.now(), text: input.trim(), color, pinned: false }, ...notes])
    setInput('')
  }

  const remove = (id) => setNotes(notes.filter(n => n.id !== id))
  const togglePin = (id) => setNotes(notes.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n))

  const startEdit = (note) => {
    setEditingId(note.id)
    setEditText(note.text)
  }
  const commitEdit = () => {
    if (editText.trim()) {
      setNotes(notes.map(n => n.id === editingId ? { ...n, text: editText.trim() } : n))
    }
    setEditingId(null)
  }

  const visible = notes
    .filter(n => n.text.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))

  return (
    <div className="notes-app">
      <span className="eyebrow-sm">Scratchpad</span>

      <div className="panel">
        <div className="panel-inner">
          <textarea
            className="field"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) add() }}
            placeholder="Write a note…  (⌘/Ctrl + Enter to save)"
            rows={3}
          />
          <div className="composer-actions">
            <div className="swatches">
              {COLORS.map(c => (
                <button
                  key={c}
                  className={`swatch${color === c ? ' selected' : ''}`}
                  style={{ background: c, color: c }}
                  onClick={() => setColor(c)}
                  aria-label={`Colour ${c}`}
                />
              ))}
            </div>
            <button className="btn" onClick={add}>
              <span className="ic">＋</span>Save note
            </button>
          </div>
        </div>
      </div>

      {notes.length > 0 && (
        <div className="search">
          <span className="glass-ic">🔍</span>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search notes…"
          />
        </div>
      )}

      {notes.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📝</div>
          <p>No notes yet — your thoughts will appear here.</p>
        </div>
      ) : visible.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">🔍</div>
          <p>No notes match “{query}”.</p>
        </div>
      ) : (
        <div className="grid">
          {visible.map(note => (
            <div
              key={note.id}
              className={`note${note.pinned ? ' pinned' : ''}`}
              style={{ '--accent': note.color || COLORS[0] }}
            >
              {editingId === note.id ? (
                <textarea
                  ref={editRef}
                  className="note-edit"
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                  onBlur={commitEdit}
                  onKeyDown={e => { if (e.key === 'Escape') setEditingId(null) }}
                />
              ) : (
                <p className="note-text" onDoubleClick={() => startEdit(note)} title="Double-click to edit">
                  {note.text}
                </p>
              )}
              <div className="note-foot">
                <span className="note-date">{formatDate(note.id)}</span>
                <div className="note-actions">
                  <button
                    className={`icon-btn${note.pinned ? ' on' : ''}`}
                    onClick={() => togglePin(note.id)}
                    aria-label={note.pinned ? 'Unpin note' : 'Pin note'}
                    title={note.pinned ? 'Unpin' : 'Pin'}
                  >📌</button>
                  <button
                    className="icon-btn danger"
                    onClick={() => remove(note.id)}
                    aria-label="Delete note"
                    title="Delete"
                  >✕</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
