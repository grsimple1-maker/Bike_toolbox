import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import BikeScheme from './BikeScheme'
import { loadFits, saveFit, deleteFit } from '../data/storage'

const BIKE_TYPES = [
  { id: 'road',   label: 'Шоссе',    emoji: '🏎️' },
  { id: 'mtb',    label: 'Горный',   emoji: '🏔️' },
  { id: 'city',   label: 'Городской',emoji: '🏙️' },
  { id: 'gravel', label: 'Гравел',   emoji: '🌾' },
  { id: 'fix',    label: 'Фикс',     emoji: '⚡' },
]

const PARAM_INFO = {
  saddleHeight:  { label: 'Высота седла',   unit: 'мм', icon: '↕️', desc: 'От центра каретки до верха седла. Колено должно быть почти прямым внизу хода педали.' },
  saddleSetback: { label: 'Отступ седла',   unit: 'мм', icon: '↔️', desc: 'Горизонтальное смещение седла назад от центра каретки.' },
  reach:         { label: 'Reach',          unit: 'мм', icon: '📏', desc: 'Горизонтальное расстояние от каретки до рулевой. Определяет растянутость посадки.' },
  stack:         { label: 'Stack',          unit: 'мм', icon: '📐', desc: 'Вертикальное расстояние от каретки до рулевой. Выше = более вертикальная посадка.' },
  handlebarDrop: { label: 'Перепад руля',   unit: 'мм', icon: '⬇️', desc: 'Насколько руль ниже седла. Только для дропового руля (шоссе, фикс, гравел).' },
  stemLength:    { label: 'Длина выноса',   unit: 'мм', icon: '➡️', desc: 'Длина стема. Короткий — манёвреннее, длинный — стабильнее.' },
  crankLength:   { label: 'Длина шатунов', unit: 'мм', icon: '🔄', desc: 'Подбирается по росту и длине ног. Стандарт: 170 / 172.5 / 175 мм.' },
}

function calcRoad(m) {
  const { inseam, torso, arm, height } = m
  return {
    saddleHeight:  Math.round(inseam * 0.885),
    saddleSetback: Math.round(inseam * 0.1),
    reach:         Math.round((torso + arm) * 0.48),
    stack:         Math.round(height * 0.605),
    handlebarDrop: Math.round((height - Math.round(inseam * 0.885)) * 0.12),
    stemLength:    Math.round((torso + arm) * 0.48 * 0.27),
    crankLength:   height < 162 ? 170 : height < 175 ? 172.5 : height < 185 ? 175 : 177.5,
  }
}
function calcMTB(m) {
  const { inseam, height } = m
  return {
    saddleHeight:  Math.round(inseam * 0.875),
    saddleSetback: Math.round(inseam * 0.08),
    reach:         Math.round(height * 0.44),
    stack:         Math.round(height * 0.595),
    handlebarDrop: 0,
    stemLength:    Math.round(height * 0.085),
    crankLength:   height < 168 ? 170 : height < 180 ? 175 : 180,
  }
}
function calcCity(m) {
  const { inseam, height } = m
  return {
    saddleHeight:  Math.round(inseam * 0.865),
    saddleSetback: Math.round(inseam * 0.07),
    reach:         Math.round(height * 0.42),
    stack:         Math.round(height * 0.62),
    handlebarDrop: 0,
    stemLength:    Math.round(height * 0.09),
    crankLength:   height < 168 ? 170 : 175,
  }
}
function calcFix(m) {
  const r = calcRoad(m)
  return { ...r, handlebarDrop: Math.round(r.handlebarDrop * 0.5), stemLength: Math.round(r.stemLength * 1.1) }
}
function calcGravel(m) {
  const r = calcRoad(m)
  return { ...r, saddleHeight: Math.round(r.saddleHeight * 0.99), handlebarDrop: Math.round(r.handlebarDrop * 0.7) }
}
const CALC = { road: calcRoad, mtb: calcMTB, city: calcCity, fix: calcFix, gravel: calcGravel }

function frameSize(bikeType, height) {
  if (['road','fix','gravel'].includes(bikeType)) {
    if (height < 162) return { size: 'XXS / 44', note: 'до 162 см' }
    if (height < 168) return { size: 'XS / 47',  note: '162–168 см' }
    if (height < 174) return { size: 'S / 50',   note: '168–174 см' }
    if (height < 180) return { size: 'M / 52–54',note: '174–180 см' }
    if (height < 186) return { size: 'L / 56',   note: '180–186 см' }
    if (height < 192) return { size: 'XL / 58',  note: '186–192 см' }
    return { size: 'XXL / 60+', note: '192+ см' }
  }
  if (bikeType === 'mtb') {
    if (height < 162) return { size: 'XS',  note: 'до 162 см' }
    if (height < 170) return { size: 'S',   note: '162–170 см' }
    if (height < 178) return { size: 'M',   note: '170–178 см' }
    if (height < 186) return { size: 'L',   note: '178–186 см' }
    return { size: 'XL', note: '186+ см' }
  }
  if (height < 160) return { size: 'XS', note: 'до 160 см' }
  if (height < 170) return { size: 'S',  note: '160–170 см' }
  if (height < 180) return { size: 'M',  note: '170–180 см' }
  if (height < 190) return { size: 'L',  note: '180–190 см' }
  return { size: 'XL', note: '190+ см' }
}

function MeasureInput({ label, hint, value, onChange, icon }) {
  return (
    <div className="fit-input-group">
      <label className="fit-label"><span className="fit-label-icon">{icon}</span>{label}</label>
      {hint && <p className="fit-hint">{hint}</p>}
      <div className="fit-input-row">
        <input type="number" className="fit-input" value={value}
          onChange={e => onChange(Number(e.target.value))} min={1} />
        <span className="fit-unit">см</span>
      </div>
    </div>
  )
}

function ResultCard({ paramKey, value, info, compareValue }) {
  const [open, setOpen] = useState(false)
  if (!info || !value) return null
  const diff = compareValue != null ? value - compareValue : null
  return (
    <div className="result-card" onClick={() => setOpen(o => !o)}>
      <div className="rc-top">
        <span className="rc-icon">{info.icon}</span>
        <div className="rc-info">
          <span className="rc-label">{info.label}</span>
          {open && <p className="rc-desc">{info.desc}</p>}
        </div>
        <div className="rc-value">
          <span className="rc-num">{value}</span>
          <span className="rc-unit">{info.unit}</span>
          {diff != null && diff !== 0 && (
            <span className={`rc-diff ${diff > 0 ? 'pos' : 'neg'}`}>
              {diff > 0 ? '+' : ''}{diff}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function SavedFitCard({ fit, onDelete, onCompare, isComparing }) {
  const typeInfo = BIKE_TYPES.find(t => t.id === fit.bikeType)
  return (
    <div className={`saved-fit-card ${isComparing ? 'comparing' : ''}`}>
      <div className="sfc-left">
        <span>{typeInfo?.emoji}</span>
        <div>
          <span className="sfc-name">{fit.name || typeInfo?.label}</span>
          <span className="sfc-meta">{fit.measurements.height}см · {new Date(fit.savedAt).toLocaleDateString('ru')}</span>
        </div>
      </div>
      <div className="sfc-actions">
        <button className={`sfc-btn ${isComparing ? 'active' : ''}`} onClick={() => onCompare(fit)}>
          {isComparing ? '✓ Сравн.' : 'Сравнить'}
        </button>
        <button className="sfc-btn danger" onClick={() => onDelete(fit.id)}>✕</button>
      </div>
    </div>
  )
}

export default function BikeFit() {
  const navigate = useNavigate()
  const [bikeType, setBikeType]       = useState('road')
  const [step, setStep]               = useState(1)
  const [measurements, setMeasurements] = useState({ height: 175, inseam: 82, torso: 58, arm: 62 })
  const [savedFits, setSavedFits]     = useState(loadFits)
  const [compareWith, setCompareWith] = useState(null)
  const [saveName, setSaveName]       = useState('')
  const [showSaved, setShowSaved]     = useState(false)
  const [justSaved, setJustSaved]     = useState(false)

  const set = (key, val) => setMeasurements(m => ({ ...m, [key]: val }))

  const results = useMemo(() => {
    const calc = CALC[bikeType] || calcRoad
    return calc(measurements)
  }, [bikeType, measurements])

  const frame = useMemo(() => frameSize(bikeType, measurements.height), [bikeType, measurements.height])

  const handleSave = () => {
    const entry = saveFit({
      bikeType,
      measurements,
      results,
      frame,
      name: saveName || BIKE_TYPES.find(t => t.id === bikeType)?.label,
    })
    setSavedFits(loadFits())
    setSaveName('')
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 2000)
  }

  const handleDelete = (id) => {
    deleteFit(id)
    setSavedFits(loadFits())
    if (compareWith?.id === id) setCompareWith(null)
  }

  const handleCompare = (fit) => {
    setCompareWith(prev => prev?.id === fit.id ? null : fit)
  }

  return (
    <div className="fit-screen">
      <button className="btn-back-nav" onClick={() => navigate('/')}>← На главную</button>

      <div className="fit-header">
        <span className="fit-header-icon">📐</span>
        <h1 className="fit-title">BIKE <span>FIT</span></h1>
        <p className="fit-sub">Идеальная посадка по твоим меркам</p>
      </div>

      {/* Tabs — step indicator + saved */}
      <div className="fit-top-row">
        <div className="fit-steps">
          {['Тип', 'Мерки', 'Результат'].map((s, i) => (
            <div key={i} className={`fit-step ${step > i+1 ? 'done' : step === i+1 ? 'active' : ''}`}
              onClick={() => { if (i+1 < step) setStep(i+1) }} style={{ cursor: i+1 < step ? 'pointer' : 'default' }}>
              <div className="fit-step-dot">{step > i+1 ? '✓' : i+1}</div>
              <span className="fit-step-label">{s}</span>
            </div>
          ))}
        </div>
        {savedFits.length > 0 && (
          <button className="btn-saved-toggle" onClick={() => setShowSaved(s => !s)}>
            💾 {savedFits.length}
          </button>
        )}
      </div>

      {/* Saved fits drawer */}
      {showSaved && (
        <div className="saved-drawer">
          <p className="saved-drawer-title">Сохранённые посадки</p>
          {savedFits.map(fit => (
            <SavedFitCard key={fit.id} fit={fit}
              onDelete={handleDelete}
              onCompare={handleCompare}
              isComparing={compareWith?.id === fit.id} />
          ))}
        </div>
      )}

      {/* Step 1 */}
      {step === 1 && (
        <div className="fit-step-content">
          <h2>Тип велосипеда</h2>
          <p className="step-hint">Формулы посадки отличаются для каждого типа</p>
          <div className="bike-grid">
            {BIKE_TYPES.map(t => (
              <button key={t.id} className={`bike-card ${bikeType === t.id ? 'selected' : ''}`}
                onClick={() => setBikeType(t.id)}>
                <span className="bike-emoji">{t.emoji}</span>
                <span className="bike-label">{t.label}</span>
                {bikeType === t.id && <span className="check">✓</span>}
              </button>
            ))}
          </div>
          <button className="btn-primary" onClick={() => setStep(2)}>Далее →</button>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="fit-step-content">
          <h2>Твои мерки</h2>
          <p className="step-hint">Измерь без обуви, в обычной одежде</p>
          <div className="fit-how-to">
            {[
              ['📏', 'Рост', 'встань к стене, от пола до макушки'],
              ['🦵', 'Inseam (длина ноги)', 'книгу в пах у стены, от пола до книги'],
              ['👕', 'Торс', 'от паха до ключицы'],
              ['💪', 'Рука', 'от плеча до запястья'],
            ].map(([icon, name, desc]) => (
              <div key={name} className="how-item">
                <span>{icon}</span>
                <div><strong>{name}</strong> — {desc}</div>
              </div>
            ))}
          </div>
          <MeasureInput label="Рост" icon="📏" value={measurements.height} onChange={v => set('height', v)} />
          <MeasureInput label="Длина ноги (inseam)" icon="🦵" hint="Измерь с книгой у стены" value={measurements.inseam} onChange={v => set('inseam', v)} />
          <MeasureInput label="Длина торса" icon="👕" value={measurements.torso} onChange={v => set('torso', v)} />
          <MeasureInput label="Длина руки" icon="💪" value={measurements.arm} onChange={v => set('arm', v)} />
          <div className="fit-btn-row">
            <button className="btn-secondary" onClick={() => setStep(1)}>← Назад</button>
            <button className="btn-primary" onClick={() => setStep(3)}>Рассчитать →</button>
          </div>
        </div>
      )}

      {/* Step 3 — результаты */}
      {step === 3 && (
        <div className="fit-step-content">
          <h2>Твоя посадка</h2>
          <p className="step-hint">Нажми на параметр — узнаешь как его настроить</p>

          {/* SVG схема */}
          <BikeScheme results={results} bikeType={bikeType} />

          {/* Размер рамы */}
          <div className="frame-size-card">
            <div className="fs-left">
              <span className="fs-label">Рекомендуемый размер рамы</span>
              <span className="fs-note">{frame.note}</span>
            </div>
            <span className="fs-size">{frame.size}</span>
          </div>

          {/* Сравнение */}
          {compareWith && (
            <div className="compare-banner">
              <span>Сравниваешь с: <strong>{compareWith.name}</strong></span>
              <button onClick={() => setCompareWith(null)}>✕</button>
            </div>
          )}

          {/* Параметры */}
          <div className="results-list">
            {Object.entries(results).map(([key, value]) => (
              <ResultCard key={key} paramKey={key} value={value} info={PARAM_INFO[key]}
                compareValue={compareWith?.results?.[key]} />
            ))}
          </div>

          {/* Сохранить */}
          <div className="save-fit-block">
            <input className="note-input" placeholder="Название (необязательно)"
              value={saveName} onChange={e => setSaveName(e.target.value)} />
            <button className={`btn-save-fit ${justSaved ? 'saved' : ''}`} onClick={handleSave}>
              {justSaved ? '✓ Сохранено!' : '💾 Сохранить посадку'}
            </button>
          </div>

          <div className="fit-disclaimer">
            <span>⚠️</span>
            <p>Расчётные значения — стартовая точка. Финальную посадку корректируй по ощущениям. Отклонение ±5 мм нормально.</p>
          </div>

          <div className="fit-btn-row">
            <button className="btn-secondary" onClick={() => setStep(2)}>← Изменить</button>
            <button className="btn-primary" onClick={() => setStep(1)}>Заново</button>
          </div>
        </div>
      )}
    </div>
  )
}
