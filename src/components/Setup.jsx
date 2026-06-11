import { useState } from 'react'
import { BIKE_TYPES } from '../data/maintenance'

export default function Setup({ onComplete, onBack }) {
  const [bikeType, setBikeType] = useState('')
  const [mileage, setMileage] = useState('')
  const [bikeName, setBikeName] = useState('')
  const [step, setStep] = useState(1)

  const handleNext = () => {
    if (step === 1 && bikeType) setStep(2)
    else if (step === 2) {
      onComplete({
        bikeType,
        mileage: parseInt(mileage) || 0,
        bikeName: bikeName || 'Мой велосипед',
        lastServices: {},
      })
    }
  }

  return (
    <div className="setup-screen">
      <div className="setup-container">
        {onBack && (
          <button className="btn-back-nav" onClick={onBack}>← На главную</button>
        )}

        <div className="setup-header">
          <span className="logo-mark">⚙</span>
          <h1 className="logo-text">BIKE<span>WRENCH</span></h1>
          <p className="logo-sub">Калькулятор обслуживания</p>
        </div>

        <div className="steps">
          <div className={`step-dot ${step >= 1 ? 'active' : ''}`} />
          <div className="step-line" />
          <div className={`step-dot ${step >= 2 ? 'active' : ''}`} />
        </div>

        {step === 1 && (
          <div className="step-content">
            <h2>Тип велосипеда</h2>
            <p className="step-hint">Интервалы обслуживания зависят от типа</p>
            <div className="bike-grid">
              {BIKE_TYPES.map(type => (
                <button
                  key={type.id}
                  className={`bike-card ${bikeType === type.id ? 'selected' : ''}`}
                  onClick={() => setBikeType(type.id)}
                >
                  <span className="bike-emoji">{type.emoji}</span>
                  <span className="bike-label">{type.label}</span>
                  <span className="bike-desc">{type.desc}</span>
                  {bikeType === type.id && <span className="check">✓</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="step-content">
            <h2>Данные велосипеда</h2>
            <p className="step-hint">Поможет рассчитать что уже пора менять</p>

            <div className="input-group">
              <label>Название / кличка байка</label>
              <input
                type="text"
                placeholder="Например: Trek Slash, Sunday Primer..."
                value={bikeName}
                onChange={e => setBikeName(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="input-group">
              <label>Общий пробег (км)</label>
              <input
                type="number"
                placeholder="0"
                value={mileage}
                onChange={e => setMileage(e.target.value)}
                className="input-field"
                min="0"
              />
              <span className="input-hint">Не знаешь точно — поставь примерно</span>
            </div>
          </div>
        )}

        <button
          className={`btn-primary ${(step === 1 && !bikeType) ? 'disabled' : ''}`}
          onClick={handleNext}
          disabled={step === 1 && !bikeType}
        >
          {step === 1 ? 'Далее →' : 'Начать →'}
        </button>
      </div>
    </div>
  )
}
