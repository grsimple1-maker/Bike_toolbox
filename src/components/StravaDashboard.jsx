import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ATHLETE as MOCK_ATHLETE, ACTIVITIES as MOCK_ACTIVITIES, WEEKLY_STATS, RECORDS } from '../data/stravaMock'
import {
  getStravaAuthUrl, loadToken, clearToken, saveToken,
  refreshToken, isTokenExpired, getAthlete, getAthleteStats, getActivities
} from '../data/stravaApi'

const fmtDist  = m  => (m / 1000).toFixed(1)
const fmtTime  = s  => { const h = Math.floor(s/3600); const m = Math.floor((s%3600)/60); return h > 0 ? `${h}ч ${m}м` : `${m}м` }
const fmtSpeed = ms => (ms * 3.6).toFixed(1)
const fmtDate  = iso => new Date(iso).toLocaleDateString('ru', { day:'numeric', month:'short' })
const fmtPace  = ms => { const kmh = ms * 3.6; const minPerKm = 60 / kmh; const m = Math.floor(minPerKm); const s = Math.round((minPerKm - m) * 60); return `${m}:${String(s).padStart(2,'0')}` }

function ActivityCard({ act }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`act-card ${open ? 'expanded' : ''}`} onClick={() => setOpen(o => !o)}>
      <div className="act-top">
        <div className="act-left">
          <span className="act-icon">🚴</span>
          <div>
            <span className="act-name">{act.name}</span>
            <span className="act-date">{fmtDate(act.start_date)}</span>
          </div>
        </div>
        <div className="act-dist">
          <span className="act-dist-val">{fmtDist(act.distance)}</span>
          <span className="act-dist-unit">км</span>
        </div>
      </div>
      <div className="act-stats">
        <div className="act-stat"><span className="as-val">{fmtTime(act.moving_time)}</span><span className="as-label">Время</span></div>
        <div className="act-stat"><span className="as-val">{fmtSpeed(act.average_speed)}</span><span className="as-label">км/ч ср.</span></div>
        <div className="act-stat"><span className="as-val">{act.total_elevation_gain}</span><span className="as-label">м набор</span></div>
        {act.average_watts && <div className="act-stat"><span className="as-val">{act.average_watts}</span><span className="as-label">Вт ср.</span></div>}
      </div>
      {open && (
        <div className="act-detail" onClick={e => e.stopPropagation()}>
          <div className="act-detail-grid">
            <div className="adg-item"><span>Макс. скорость</span><strong>{fmtSpeed(act.max_speed)} км/ч</strong></div>
            <div className="adg-item"><span>Темп</span><strong>{fmtPace(act.average_speed)} /км</strong></div>
            {act.average_heartrate && <div className="adg-item"><span>ЧСС ср.</span><strong>{act.average_heartrate} уд/м</strong></div>}
            {act.max_heartrate && <div className="adg-item"><span>ЧСС макс.</span><strong>{act.max_heartrate} уд/м</strong></div>}
            {act.achievement_count > 0 && <div className="adg-item"><span>Достижения</span><strong>🏆 {act.achievement_count}</strong></div>}
            <div className="adg-item"><span>Кудосы</span><strong>👍 {act.kudos_count}</strong></div>
          </div>
        </div>
      )}
    </div>
  )
}

function MiniBar({ data, valueKey, color = '#ff5c35' }) {
  const max = Math.max(...data.map(d => d[valueKey]))
  return (
    <div className="mini-bar-chart">
      <div className="mbc-bars">
        {data.map((d, i) => (
          <div key={i} className="mbc-col">
            <div className="mbc-bar-wrap">
              <div className="mbc-bar" style={{ height: `${(d[valueKey] / max) * 100}%`, background: i === data.length-1 ? color : `${color}55` }} />
            </div>
            <span className="mbc-label">{d.week === 'Эта неделя' ? 'Сейчас' : d.week.replace(' нед. назад', 'н')}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function StravaDashboard() {
  const navigate = useNavigate()
  const [tab, setTab]           = useState('overview')
  const [token, setToken]       = useState(loadToken)
  const [athlete, setAthlete]   = useState(null)
  const [activities, setActivities] = useState(null)
  const [stats, setStats]       = useState(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const isReal = !!token
  const displayAthlete   = athlete   || MOCK_ATHLETE
  const displayActivities = activities || MOCK_ACTIVITIES
  const ytd = stats?.ytd_ride_totals  || MOCK_ATHLETE.stats.ytd_ride_totals
  const all = stats?.all_ride_totals  || MOCK_ATHLETE.stats.all_ride_totals

  // Загрузка данных
  useEffect(() => {
    if (!token) return
    loadStravaData(token)
  }, [])

  async function loadStravaData(t) {
    setLoading(true)
    setError('')
    try {
      // Refresh если истёк
      let activeToken = t
      if (isTokenExpired(t)) {
        const refreshed = await refreshToken(t.refresh_token)
        activeToken = { ...t, ...refreshed }
        saveToken(activeToken)
        setToken(activeToken)
      }
      const at = activeToken.access_token
      const [athleteData, activitiesData] = await Promise.all([
        getAthlete(at),
        getActivities(at, 1, 20),
      ])
      const statsData = await getAthleteStats(athleteData.id, at)
      setAthlete(athleteData)
      setActivities(activitiesData)
      setStats(statsData)
    } catch(e) {
      setError('Ошибка загрузки данных Strava')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const disconnect = () => {
    clearToken()
    setToken(null)
    setAthlete(null)
    setActivities(null)
    setStats(null)
  }

  const avgDistPerRide = ytd.count > 0 ? (ytd.distance / ytd.count / 1000).toFixed(1) : 0
  const avgSpeed = ytd.moving_time > 0 ? (ytd.distance / ytd.moving_time * 3.6).toFixed(1) : 0

  return (
    <div className="strava-screen">
      <button className="btn-back-nav" onClick={() => navigate('/')}>← На главную</button>

      {/* Header */}
      <div className="strava-header">
        {!isReal && <div className="strava-demo-badge">DEMO — моковые данные</div>}
        {isReal && loading && <div className="strava-demo-badge">Загружаем данные...</div>}
        {isReal && error && <div className="wind-error">{error}</div>}

        <div className="strava-athlete">
          <div className="sa-avatar">
            {isReal && athlete?.profile
              ? <img src={athlete.profile} alt="" style={{width:'100%',height:'100%',borderRadius:'50%',objectFit:'cover'}} />
              : `${displayAthlete.firstname?.[0]}${displayAthlete.lastname?.[0]}`
            }
          </div>
          <div>
            <h1 className="sa-name">{displayAthlete.firstname} {displayAthlete.lastname}</h1>
            <span className="sa-location">📍 {displayAthlete.city}{displayAthlete.country ? `, ${displayAthlete.country}` : ''}</span>
          </div>
          <div className="strava-logo"><span className="strava-s">S</span></div>
        </div>
      </div>

      {/* Connect / Disconnect */}
      {!isReal ? (
        <div className="strava-connect-hero">
          <p>Подключи реальный Strava аккаунт</p>
          <a href={getStravaAuthUrl()} className="btn-connect-strava">
            🔗 Войти через Strava
          </a>
        </div>
      ) : (
        <button className="btn-disconnect" onClick={disconnect}>Отключить Strava</button>
      )}

      {/* Quick stats */}
      <div className="strava-quick">
        <div className="sq-card"><span className="sq-val">{(ytd.distance/1000).toFixed(0)}</span><span className="sq-unit">км</span><span className="sq-label">В этом году</span></div>
        <div className="sq-card"><span className="sq-val">{ytd.count}</span><span className="sq-unit">поездок</span><span className="sq-label">В этом году</span></div>
        <div className="sq-card"><span className="sq-val">{fmtTime(ytd.moving_time)}</span><span className="sq-label">Время в седле</span></div>
        <div className="sq-card"><span className="sq-val">{(ytd.elevation_gain/1000).toFixed(1)}</span><span className="sq-unit">км</span><span className="sq-label">Набор высоты</span></div>
      </div>

      {/* Tabs */}
      <div className="tabs-row">
        {[['overview','Обзор'],['activities','Активности'],['records','Рекорды']].map(([id,label]) => (
          <button key={id} className={`tab ${tab===id?'active':''}`} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="strava-tab-content">
          <div className="strava-section">
            <div className="ss-header">
              <span className="ss-title">Км по неделям</span>
              <span className="ss-total">{WEEKLY_STATS.reduce((s,w)=>s+w.distance,0)} км</span>
            </div>
            <MiniBar data={WEEKLY_STATS} valueKey="distance" color="#ff5c35" />
          </div>
          <div className="strava-section">
            <span className="ss-title">Средние показатели (год)</span>
            <div className="metrics-grid">
              <div className="metric-card"><span className="mc-icon">📏</span><span className="mc-val">{avgDistPerRide}</span><span className="mc-unit">км</span><span className="mc-label">Ср. длина</span></div>
              <div className="metric-card"><span className="mc-icon">⚡</span><span className="mc-val">{avgSpeed}</span><span className="mc-unit">км/ч</span><span className="mc-label">Ср. скорость</span></div>
              <div className="metric-card"><span className="mc-icon">⛰️</span><span className="mc-val">{ytd.count > 0 ? Math.round(ytd.elevation_gain/ytd.count) : 0}</span><span className="mc-unit">м</span><span className="mc-label">Набор/поездка</span></div>
              <div className="metric-card"><span className="mc-icon">🕐</span><span className="mc-val">{ytd.count > 0 ? Math.round(ytd.moving_time/ytd.count/60) : 0}</span><span className="mc-unit">мин</span><span className="mc-label">Ср. время</span></div>
            </div>
          </div>
          <div className="strava-section">
            <span className="ss-title">Всё время</span>
            <div className="alltime-grid">
              <div className="at-item"><span className="at-val">{(all.distance/1000).toLocaleString('ru',{maximumFractionDigits:0})}</span><span className="at-label">км всего</span></div>
              <div className="at-item"><span className="at-val">{all.count}</span><span className="at-label">поездок</span></div>
              <div className="at-item"><span className="at-val">{fmtTime(all.moving_time)}</span><span className="at-label">в седле</span></div>
              <div className="at-item"><span className="at-val">{(all.elevation_gain/1000).toFixed(0)}</span><span className="at-label">км набора</span></div>
            </div>
          </div>
          <div className="strava-section">
            <span className="ss-title">Последняя поездка</span>
            <ActivityCard act={displayActivities[0]} />
          </div>
        </div>
      )}

      {tab === 'activities' && (
        <div className="strava-tab-content">
          <div className="acts-header"><span className="ss-title">Последние {displayActivities.length} активностей</span></div>
          <div className="acts-list">{displayActivities.map(act => <ActivityCard key={act.id} act={act} />)}</div>
        </div>
      )}

      {tab === 'records' && (
        <div className="strava-tab-content">
          <div className="strava-section">
            <span className="ss-title">Личные рекорды</span>
            <div className="records-list">
              {RECORDS.map((r,i) => (
                <div key={i} className="record-card">
                  <span className="rec-icon">{r.icon}</span>
                  <div className="rec-info"><span className="rec-name">{r.name}</span><span className="rec-date">{r.date}</span></div>
                  <div className="rec-val"><span className="rec-num">{r.value}</span>{r.unit && <span className="rec-unit">{r.unit}</span>}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="strava-section">
            <span className="ss-title">Годовые цели</span>
            {[
              { label: 'Километраж', current: ytd.distance/1000, goal: 5000, unit: 'км' },
              { label: 'Поездки',    current: ytd.count,         goal: 150,  unit: 'шт' },
              { label: 'Набор',      current: ytd.elevation_gain/1000, goal: 50, unit: 'км' },
            ].map(g => {
              const pct = Math.min(g.current / g.goal * 100, 100)
              return (
                <div key={g.label} className="goal-item">
                  <div className="goal-header"><span>{g.label}</span><span>{Number(g.current.toFixed(0)).toLocaleString()} / {g.goal} {g.unit}</span></div>
                  <div className="progress-track"><div className="progress-fill ok" style={{width:`${pct}%`}} /></div>
                  <span className="goal-pct">{pct.toFixed(0)}%</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
