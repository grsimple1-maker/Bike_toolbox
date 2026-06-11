import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'

const WindMap = lazy(() => import('./WindMap'))
const { getRoute, geocode } = await import('./WindMap').then(m => ({ getRoute: m.getRoute, geocode: m.geocode }))

const WIND_DIRS = ['С','СВ','В','ЮВ','Ю','ЮЗ','З','СЗ']
const degToDir  = deg => WIND_DIRS[Math.round(deg / 45) % 8]
const degToRad  = deg => (deg * Math.PI) / 180
const mpsToKmh  = mps => Math.round(mps * 3.6)

const OWM_KEY = '910f0c8c29fee56d79ef2cd869ac8cf2'

function getRideScore(windDeg, rideDeg) {
  let diff = ((rideDeg - windDeg) + 360) % 360
  if (diff > 180) diff = 360 - diff
  if (diff <= 30)  return { score: 5, label: 'Попутный',  color: '#00e676', emoji: '🟢' }
  if (diff <= 70)  return { score: 4, label: 'Боковой +', color: '#69f0ae', emoji: '🟢' }
  if (diff <= 110) return { score: 3, label: 'Боковой',   color: '#ffd600', emoji: '🟡' }
  if (diff <= 150) return { score: 2, label: 'Боковой −', color: '#ff9500', emoji: '🟠' }
  return                   { score: 1, label: 'Встречный', color: '#ff3d3d', emoji: '🔴' }
}

const RIDE_DIRECTIONS = [
  { deg: 0,   label: 'Север',  emoji: '↑' },
  { deg: 45,  label: 'СВ',     emoji: '↗' },
  { deg: 90,  label: 'Восток', emoji: '→' },
  { deg: 135, label: 'ЮВ',     emoji: '↘' },
  { deg: 180, label: 'Юг',     emoji: '↓' },
  { deg: 225, label: 'ЮЗ',     emoji: '↙' },
  { deg: 270, label: 'Запад',  emoji: '←' },
  { deg: 315, label: 'СЗ',     emoji: '↖' },
]

const MOCK_WEATHER = {
  name: 'Semey', coord: { lat: 50.4111, lon: 80.2275 },
  wind: { speed: 4.2, deg: 240 },
  main: { temp: 18, feels_like: 16, humidity: 55 },
  weather: [{ description: 'переменная облачность' }],
  visibility: 10000,
}

function WindCompass({ windDeg, windSpeed }) {
  const size = 160; const cx = size/2; const cy = size/2; const r = 62
  const arrowDeg = (windDeg + 180) % 360
  const rad = degToRad(arrowDeg - 90)
  const arrowX = cx + Math.cos(rad) * (r - 14)
  const arrowY = cy + Math.sin(rad) * (r - 14)
  const tailX  = cx + Math.cos(rad + Math.PI) * 24
  const tailY  = cy + Math.sin(rad + Math.PI) * 24
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="wind-compass-svg">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#2a2a38" strokeWidth="2"/>
      <circle cx={cx} cy={cy} r={r-7} fill="none" stroke="#1a1a24" strokeWidth="10"/>
      {[['С',0],['В',90],['Ю',180],['З',270]].map(([l,d]) => {
        const a = degToRad(d-90)
        return <text key={d} x={cx+Math.cos(a)*(r+12)} y={cy+Math.sin(a)*(r+12)+4} textAnchor="middle" fontSize="10" fill="#6b6b85" fontFamily="DM Sans">{l}</text>
      })}
      {Array.from({length:36},(_,i) => {
        const a = degToRad(i*10-90); const inner = i%9===0 ? r-18 : r-12
        return <line key={i} x1={cx+Math.cos(a)*inner} y1={cy+Math.sin(a)*inner} x2={cx+Math.cos(a)*(r-7)} y2={cy+Math.sin(a)*(r-7)} stroke={i%9===0?'#4a4a6a':'#2a2a38'} strokeWidth={i%9===0?2:1}/>
      })}
      <defs><marker id="ah" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto"><polygon points="0 0,7 2.5,0 5" fill="#ff5c35"/></marker></defs>
      <line x1={tailX} y1={tailY} x2={arrowX} y2={arrowY} stroke="#ff5c35" strokeWidth="2.5" markerEnd="url(#ah)" strokeLinecap="round"/>
      <circle cx={cx} cy={cy} r={20} fill="#1a1a24" stroke="#2a2a38" strokeWidth="2"/>
      <text x={cx} y={cy-4} textAnchor="middle" fontSize="12" fill="#ff5c35" fontFamily="Bebas Neue" letterSpacing="1">{mpsToKmh(windSpeed)}</text>
      <text x={cx} y={cy+8} textAnchor="middle" fontSize="7" fill="#6b6b85" fontFamily="DM Sans">км/ч</text>
    </svg>
  )
}

function DirectionGrid({ windDeg }) {
  const best = RIDE_DIRECTIONS.reduce((b,d) => { const s = getRideScore(windDeg,d.deg); return s.score > b.score ? {...d,...s} : b }, {score:0})
  return (
    <div className="dir-grid">
      {RIDE_DIRECTIONS.map(dir => {
        const score = getRideScore(windDeg, dir.deg)
        const isBest = dir.deg === best.deg
        return (
          <div key={dir.deg} className={`dir-card ${isBest?'best':''}`} style={{'--dir-color': score.color}}>
            <span className="dir-arrow">{dir.emoji}</span>
            <span className="dir-label">{dir.label}</span>
            <span className="dir-score-label">{score.emoji} {score.label}</span>
            {isBest && <span className="dir-best-badge">Лучшее</span>}
          </div>
        )
      })}
    </div>
  )
}

export default function WindPlanner() {
  const navigate = useNavigate()
  const [weather, setWeather]     = useState(null)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [city, setCity]           = useState('Semey')
  const [demoMode, setDemoMode]   = useState(false)
  const [mapCenter, setMapCenter] = useState(null)

  // Маршрут
  const [fromPlace, setFromPlace] = useState('')
  const [toPlace, setToPlace]     = useState('')
  const [route, setRoute]         = useState(null)
  const [routeLoading, setRouteLoading] = useState(false)
  const [routeError, setRouteError]     = useState('')
  const [routeInfo, setRouteInfo]       = useState(null)
  const [activeTab, setActiveTab] = useState('wind') // 'wind' | 'route'

  const fetchWeather = useCallback(async (targetCity) => {
    setLoading(true); setError('')
    try {
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(targetCity)}&appid=${OWM_KEY}&units=metric&lang=ru`)
      if (!res.ok) throw new Error('Город не найден')
      const data = await res.json()
      setWeather(data)
      setMapCenter([data.coord.lat, data.coord.lon])
      setDemoMode(false)
    } catch(e) {
      setError(e.message)
    } finally { setLoading(false) }
  }, [])

  const loadDemo = () => {
    setWeather(MOCK_WEATHER)
    setMapCenter([MOCK_WEATHER.coord.lat, MOCK_WEATHER.coord.lon])
    setDemoMode(true); setError('')
  }

  useEffect(() => { fetchWeather(city) }, [])

  const buildRoute = async () => {
    if (!fromPlace || !toPlace) { setRouteError('Введи откуда и куда'); return }
    setRouteLoading(true); setRouteError(''); setRoute(null); setRouteInfo(null)
    try {
      const [from, to] = await Promise.all([geocode(fromPlace), geocode(toPlace)])
      const routeData = await getRoute(from.lat, from.lon, to.lat, to.lon)
      setRoute(routeData)
      const seg = routeData.features[0].properties.segments[0]
      setRouteInfo({
        distance: (seg.distance / 1000).toFixed(1),
        duration: Math.round(seg.duration / 60),
        from: from.label,
        to: to.label,
      })
    } catch(e) {
      setRouteError(e.message || 'Ошибка построения маршрута')
    } finally { setRouteLoading(false) }
  }

  const windDeg   = weather?.wind?.deg   ?? 0
  const windSpeed = weather?.wind?.speed ?? 0

  return (
    <div className="wind-screen">
      <button className="btn-back-nav" onClick={() => navigate('/')}>← На главную</button>

      <div className="wind-header">
        <span className="wind-header-icon">🌬️</span>
        <h1 className="wind-title">ВЕТЕР</h1>
        <p className="wind-sub">Планируй маршрут с попутным ветром</p>
      </div>

      {/* City search */}
      <div className="wind-search">
        <div className="ws-row">
          <input className="input-field" placeholder="Город..." value={city}
            onChange={e => setCity(e.target.value)}
            onKeyDown={e => e.key==='Enter' && fetchWeather(city)} />
          <button className="btn-primary ws-btn" onClick={() => fetchWeather(city)}>
            {loading ? '…' : '🔍'}
          </button>
        </div>
        <div className="ws-actions">
          <button className="ws-link" onClick={loadDemo}>📊 Демо</button>
        </div>
      </div>

      {error && <div className="wind-error">⚠️ {error}</div>}
      {demoMode && <div className="wind-demo-badge">DEMO — введи реальный город</div>}

      {weather && (
        <>
          {/* Tabs */}
          <div className="tabs-row" style={{marginBottom:12}}>
            <button className={`tab ${activeTab==='wind'?'active':''}`} onClick={() => setActiveTab('wind')}>🌬️ Ветер</button>
            <button className={`tab ${activeTab==='route'?'active':''}`} onClick={() => setActiveTab('route')}>🗺️ Маршрут</button>
          </div>

          {activeTab === 'wind' && (
            <>
              <div className="weather-card">
                <div className="wc-left">
                  <span className="wc-city">{weather.name}</span>
                  <span className="wc-desc">{weather.weather?.[0]?.description}</span>
                  <div className="wc-stats">
                    <span>🌡️ {Math.round(weather.main.temp)}°C</span>
                    <span>💧 {weather.main.humidity}%</span>
                  </div>
                </div>
                <div className="wc-right">
                  <WindCompass windDeg={windDeg} windSpeed={windSpeed} />
                </div>
              </div>

              <div className="wind-info-row">
                <div className="wi-card"><span className="wi-val">{mpsToKmh(windSpeed)}</span><span className="wi-unit">км/ч</span><span className="wi-label">Скорость</span></div>
                <div className="wi-card"><span className="wi-val">{degToDir(windDeg)}</span><span className="wi-label">Откуда</span></div>
                <div className="wi-card"><span className="wi-val">{windDeg}°</span><span className="wi-label">Градус</span></div>
                {weather.wind?.gust && <div className="wi-card"><span className="wi-val">{mpsToKmh(weather.wind.gust)}</span><span className="wi-unit">км/ч</span><span className="wi-label">Порывы</span></div>}
              </div>

              <div className="wind-section-title">Куда ехать сегодня?</div>
              <DirectionGrid windDeg={windDeg} />

              <div className={`wind-tip ${windSpeed>10?'warn':windSpeed>6?'ok':'good'}`}>
                {windSpeed<=3 && <><span>😎</span><p>Штиль — идеально. Любое направление.</p></>}
                {windSpeed>3&&windSpeed<=6 && <><span>🟢</span><p>Лёгкий ветер — комфортно. Выбери попутное.</p></>}
                {windSpeed>6&&windSpeed<=10 && <><span>🟡</span><p>Умеренный ветер — езди по ветру. Против — скорость упадёт на 20–30%.</p></>}
                {windSpeed>10&&windSpeed<=15 && <><span>🟠</span><p>Сильный ветер — планируй финиш с попутным.</p></>}
                {windSpeed>15 && <><span>🔴</span><p>Очень сильный ветер. Лучше тренажёр.</p></>}
              </div>
            </>
          )}

          {activeTab === 'route' && (
            <>
              {/* Карта */}
              <div className="wind-map-wrap">
                <Suspense fallback={<div className="map-loading">Загружаем карту…</div>}>
                  <WindMap
                    center={mapCenter}
                    windDeg={windDeg}
                    windSpeed={windSpeed}
                    route={route}
                  />
                </Suspense>
              </div>

              {/* Построение маршрута */}
              <div className="route-builder">
                <p className="route-builder-title">🚴 Построить велосипедный маршрут</p>
                <input className="input-field" placeholder="Откуда (адрес или место)"
                  value={fromPlace} onChange={e => setFromPlace(e.target.value)}
                  onKeyDown={e => e.key==='Enter' && buildRoute()} />
                <input className="input-field" placeholder="Куда (адрес или место)"
                  value={toPlace} onChange={e => setToPlace(e.target.value)}
                  onKeyDown={e => e.key==='Enter' && buildRoute()} />
                <button className="btn-primary" onClick={buildRoute} disabled={routeLoading}>
                  {routeLoading ? 'Строим…' : '→ Построить маршрут'}
                </button>
                {routeError && <div className="wind-error">⚠️ {routeError}</div>}
              </div>

              {routeInfo && (
                <div className="route-info-card">
                  <div className="ric-row">
                    <div className="ric-item"><span className="ric-val">{routeInfo.distance}</span><span className="ric-unit">км</span><span className="ric-label">Расстояние</span></div>
                    <div className="ric-item"><span className="ric-val">{routeInfo.duration}</span><span className="ric-unit">мин</span><span className="ric-label">~Время</span></div>
                    <div className="ric-item">
                      <span className="ric-val" style={{color: getRideScore(windDeg, 0).color}}>
                        {getRideScore(windDeg, 0).emoji}
                      </span>
                      <span className="ric-label">Ветер</span>
                    </div>
                  </div>
                  <div className="ric-places">
                    <span>📍 {routeInfo.from}</span>
                    <span>🏁 {routeInfo.to}</span>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
