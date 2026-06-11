import { useState } from 'react'

const SLIDES = [
  {
    icon: '🔧',
    title: 'Калькулятор обслуживания',
    desc: 'Введи пробег — узнай что пора менять на велосипеде. Система следит за всеми компонентами и напоминает о ТО.',
  },
  {
    icon: '📐',
    title: 'Bike Fit калькулятор',
    desc: 'Введи свои мерки — получишь идеальные настройки посадки: высоту седла, reach, stack и размер рамы.',
  },
  {
    icon: '🏠',
    title: 'Гараж',
    desc: 'Добавляй несколько велосипедов. Вся история обслуживания сохраняется прямо в браузере — без регистрации.',
  },
]

export default function Onboarding({ onDone }) {
  const [slide, setSlide] = useState(0)

  const next = () => {
    if (slide < SLIDES.length - 1) setSlide(s => s + 1)
    else onDone()
  }

  const s = SLIDES[slide]

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-card">
        <div className="ob-progress">
          {SLIDES.map((_, i) => (
            <div key={i} className={`ob-dot ${i <= slide ? 'active' : ''}`} />
          ))}
        </div>

        <span className="ob-icon">{s.icon}</span>
        <h2 className="ob-title">{s.title}</h2>
        <p className="ob-desc">{s.desc}</p>

        <div className="ob-actions">
          <button className="ob-skip" onClick={onDone}>Пропустить</button>
          <button className="btn-primary ob-next" onClick={next}>
            {slide < SLIDES.length - 1 ? 'Далее →' : 'Начать →'}
          </button>
        </div>
      </div>
    </div>
  )
}
