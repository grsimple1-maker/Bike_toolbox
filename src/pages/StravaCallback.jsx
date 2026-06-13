import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { exchangeCode, saveToken } from '../data/stravaApi'

export default function StravaCallback() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('Подключаем Strava...')
  const [errMsg, setErrMsg] = useState('')

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
        if (data.errors || data.error) {
          setStatus('Ошибка Strava')
          setErrMsg(JSON.stringify(data))
          return
        }
        saveToken(data)
        setStatus('✓ Strava подключена!')
        setTimeout(() => navigate('/strava'), 1200)
      })
      .catch(e => {
        setStatus('Ошибка подключения')
        setErrMsg(e.message)
      })
  }, [])

  return (
    <div className="callback-screen">
      <div className="callback-card">
        <span className="callback-icon">🔗</span>
        <p className="callback-status">{status}</p>
        {errMsg && <p style={{color:'red',fontSize:'12px',wordBreak:'break-all',padding:'10px'}}>{errMsg}</p>}
        {!errMsg && <div className="callback-spinner" />}
        {errMsg && <button onClick={() => navigate('/strava')} style={{marginTop:'12px',padding:'8px 16px'}}>← Назад</button>}
      </div>
    </div>
  )
}
