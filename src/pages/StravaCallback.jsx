import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { exchangeCode, saveToken } from '../data/stravaApi'

export default function StravaCallback() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('Подключаем Strava...')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code  = params.get('code')
    const error = params.get('error')

    if (error) {
      setStatus('Отменено')
      setTimeout(() => navigate('/strava'), 2000)
      return
    }

    if (!code) {
      navigate('/strava')
      return
    }

    exchangeCode(code)
      .then(data => {
        saveToken(data)
        setStatus('✓ Strava подключена!')
        setTimeout(() => navigate('/strava'), 1200)
      })
      .catch(() => {
        setStatus('Ошибка подключения')
        setTimeout(() => navigate('/strava'), 2000)
      })
  }, [])

  return (
    <div className="callback-screen">
      <div className="callback-card">
        <span className="callback-icon">🔗</span>
        <p className="callback-status">{status}</p>
        <div className="callback-spinner" />
      </div>
    </div>
  )
}
