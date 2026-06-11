import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'
import Onboarding from '../components/Onboarding'

const TOOLS = [
  { id: 'maintenance', path: '/maintenance', icon: '🔧', title: 'Обслуживание',
    desc: 'Узнай что пора менять на твоём байке', status: 'live', color: '#ff5c35' },
  { id: 'fit', path: '/fit', icon: '📐', title: 'Bike Fit',
    desc: 'Идеальная посадка по твоим меркам', status: 'live', color: '#ffd600' },
  { id: 'wind', path: '/wind', icon: '🌬️', title: 'Ветер',
    desc: 'Планируй маршрут с попутным ветром', status: 'live', color: '#00b4d8' },
  { id: 'strava', path: '/strava', icon: '📊', title: 'Strava Stats',
    desc: 'Расширенная аналитика поездок', status: 'live', color: '#fc4c02' },
]

export default function Home() {
  const navigate = useNavigate()
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    const seen = localStorage.getItem('bw_onboarding_done')
    if (!seen) setShowOnboarding(true)
  }, [])

  const doneOnboarding = () => {
    localStorage.setItem('bw_onboarding_done', '1')
    setShowOnboarding(false)
  }

  return (
    <div className="home-screen">
      {showOnboarding && <Onboarding onDone={doneOnboarding} />}

      <ThemeToggle />

      <div className="home-hero">
        <div className="hero-glow" />
        <span className="hero-icon">⚙</span>
        <h1 className="hero-title">BIKE<span>WRENCH</span></h1>
        <p className="hero-sub">Инструменты для велосипедистов</p>
      </div>

      <div className="tools-grid">
        {TOOLS.map(tool => (
          <button key={tool.id} className={`tool-card ${tool.status}`}
            onClick={() => navigate(tool.path)}
            style={{ '--card-color': tool.color }}>
            <div className="tool-top">
              <span className="tool-icon">{tool.icon}</span>
              {tool.status === 'live'
                ? <span className="tool-badge live">Готово</span>
                : <span className="tool-badge soon">Скоро</span>}
            </div>
            <h3 className="tool-title">{tool.title}</h3>
            <p className="tool-desc">{tool.desc}</p>
            {tool.status === 'live' && <div className="tool-arrow">→</div>}
          </button>
        ))}
      </div>

      <p className="home-footer">Больше инструментов — в разработке</p>
    </div>
  )
}
