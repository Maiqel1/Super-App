import { useState } from 'react'
import axios from 'axios'
import './styles.css'

const API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY'
const PLACEHOLDER = 'YOUR_OPENWEATHERMAP_API_KEY'

const GRADIENTS = {
  Clear: 'linear-gradient(135deg, #4f9dff 0%, #7c3cff 100%)',
  Clouds: 'linear-gradient(135deg, #7c8bdb 0%, #4b3fb0 100%)',
  Rain: 'linear-gradient(135deg, #22d3ee 0%, #3b5bdb 100%)',
  Drizzle: 'linear-gradient(135deg, #22d3ee 0%, #6d5cff 100%)',
  Thunderstorm: 'linear-gradient(135deg, #6d5cff 0%, #241a5c 100%)',
  Snow: 'linear-gradient(135deg, #7dd3fc 0%, #818cf8 100%)',
  Mist: 'linear-gradient(135deg, #8b9fd6 0%, #5b6bb5 100%)',
}

const glyphFor = (m) => ({
  Clear: '☀️', Clouds: '☁️', Rain: '🌧️', Drizzle: '🌦️',
  Thunderstorm: '⛈️', Snow: '❄️', Mist: '🌫️', Fog: '🌫️', Haze: '🌫️',
}[m] || '🌡️')

const gradientFor = (m) => GRADIENTS[m] || 'linear-gradient(135deg, #7c3cff 0%, #d946ef 100%)'

const pad = (n) => String(n).padStart(2, '0')
const fmtTime = (unix, tz) => {
  const d = new Date((unix + tz) * 1000)
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`
}
const titleCase = (s) => s.replace(/\b\w/g, (c) => c.toUpperCase())

const hash = (str) => {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return h
}

const DEMO_CONDITIONS = [
  { main: 'Clear', description: 'clear sky', country: 'US' },
  { main: 'Clouds', description: 'scattered clouds', country: 'GB' },
  { main: 'Rain', description: 'light rain', country: 'JP' },
  { main: 'Drizzle', description: 'light drizzle', country: 'NL' },
  { main: 'Thunderstorm', description: 'thunderstorm', country: 'BR' },
  { main: 'Snow', description: 'light snow', country: 'CA' },
  { main: 'Mist', description: 'misty morning', country: 'DE' },
]

const demoData = (city) => {
  const h = hash(city.toLowerCase())
  const cond = DEMO_CONDITIONS[h % DEMO_CONDITIONS.length]
  const temp = (h % 33) - 4
  return {
    demo: true,
    name: titleCase(city),
    country: cond.country,
    main: cond.main,
    description: cond.description,
    temp,
    feels: temp - (h % 4),
    min: temp - 2,
    max: temp + 3,
    humidity: 40 + (h % 55),
    wind: ((h % 80) / 10),
    pressure: 1000 + (h % 40),
    sunrise: `${pad(5 + (h % 3))}:${pad((h % 6) * 10)}`,
    sunset: `${pad(18 + (h % 3))}:${pad(((h * 7) % 6) * 10)}`,
  }
}

const normalize = (d) => ({
  demo: false,
  name: d.name,
  country: d.sys.country,
  main: d.weather[0].main,
  description: d.weather[0].description,
  temp: d.main.temp,
  feels: d.main.feels_like,
  min: d.main.temp_min,
  max: d.main.temp_max,
  humidity: d.main.humidity,
  wind: d.wind.speed,
  pressure: d.main.pressure,
  sunrise: fmtTime(d.sys.sunrise, d.timezone),
  sunset: fmtTime(d.sys.sunset, d.timezone),
})

export default function App() {
  const [city, setCity] = useState('')
  const [unit, setUnit] = useState('C')
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [recents, setRecents] = useState(() => JSON.parse(localStorage.getItem('wx-recents') || '[]'))

  const pushRecent = (name) => {
    const next = [name, ...recents.filter(r => r.toLowerCase() !== name.toLowerCase())].slice(0, 6)
    setRecents(next)
    localStorage.setItem('wx-recents', JSON.stringify(next))
  }

  const run = async (q) => {
    const target = (q ?? city).trim()
    if (!target) return
    setLoading(true)
    setError(null)
    try {
      if (API_KEY === PLACEHOLDER) throw new Error('no-key')
      const res = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(target)}&appid=${API_KEY}&units=metric`
      )
      setData(normalize(res.data))
      pushRecent(res.data.name)
    } catch (err) {
      if (err.message === 'no-key') {
        setData(demoData(target))
        pushRecent(titleCase(target))
      } else {
        setError('City not found. Check the spelling and try again.')
        setData(null)
      }
    } finally {
      setLoading(false)
    }
  }

  const T = (c) => unit === 'C' ? Math.round(c) : Math.round(c * 9 / 5 + 32)
  const wind = data ? (unit === 'C' ? `${Math.round(data.wind)} m/s` : `${Math.round(data.wind * 2.237)} mph`) : ''

  return (
    <div className="weather-app">
      <span className="eyebrow-sm">Forecast</span>

      <div className="top">
        <input
          className="field"
          value={city}
          onChange={e => setCity(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && run()}
          placeholder="Search any city…"
        />
        <div className="unit-toggle">
          <button className={`unit${unit === 'C' ? ' active' : ''}`} onClick={() => setUnit('C')}>°C</button>
          <button className={`unit${unit === 'F' ? ' active' : ''}`} onClick={() => setUnit('F')}>°F</button>
        </div>
        <button className="btn" onClick={() => run()}>
          <span className="ic">→</span>Go
        </button>
      </div>

      {recents.length > 0 && (
        <div className="recents">
          {recents.map(r => (
            <button key={r} className="chip" onClick={() => { setCity(r); run(r) }}>{r}</button>
          ))}
        </div>
      )}

      {loading && <div className="state"><span className="spinner" />Fetching forecast…</div>}

      {error && !loading && <div className="error">{error}</div>}

      {!data && !loading && !error && (
        <div className="empty">
          <div className="empty-icon">🌍</div>
          <p>Search for a city to see live conditions.</p>
        </div>
      )}

      {data && !loading && (
        <div className="result">
          <div className="hero" style={{ background: gradientFor(data.main) }}>
            {data.demo && <span className="demo-badge">Demo</span>}
            <p className="place">{data.name}, {data.country}</p>
            <div className="glyph">{glyphFor(data.main)}</div>
            <p className="temp">{T(data.temp)}°</p>
            <p className="range">H {T(data.max)}°  ·  L {T(data.min)}°</p>
            <p className="desc">{data.description}</p>
          </div>
          <div className="stats">
            <div className="stat"><span className="stat-label">Feels like</span><span className="stat-value">{T(data.feels)}°</span></div>
            <div className="stat"><span className="stat-label">💧 Humidity</span><span className="stat-value">{data.humidity}%</span></div>
            <div className="stat"><span className="stat-label">💨 Wind</span><span className="stat-value">{wind}</span></div>
            <div className="stat"><span className="stat-label">🧭 Pressure</span><span className="stat-value">{data.pressure}</span></div>
            <div className="stat"><span className="stat-label">🌅 Sunrise</span><span className="stat-value">{data.sunrise}</span></div>
            <div className="stat"><span className="stat-label">🌇 Sunset</span><span className="stat-value">{data.sunset}</span></div>
          </div>
        </div>
      )}
    </div>
  )
}
