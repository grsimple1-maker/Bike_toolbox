import { BIKE_TYPES } from '../data/maintenance'

function bikeHealth(bike) {
  // quick score: ratio of overdue components (rough)
  return bike.bikes ? 0 : 100 // placeholder, real calc in Dashboard
}

export default function Garage({ bikes, onSelect, onAdd, onDelete, onBack }) {
  return (
    <div className="garage-screen">
      <header className="garage-header">
        <button className="btn-back-nav" onClick={onBack}>← На главную</button>
        <h1 className="garage-title">МОЙ <span>ГАРАЖ</span></h1>
        <span className="garage-count">{bikes.length} {bikes.length === 1 ? 'байк' : bikes.length < 5 ? 'байка' : 'байков'}</span>
      </header>

      <div className="garage-list">
        {bikes.map(bike => {
          const typeInfo = BIKE_TYPES.find(t => t.id === bike.bikeType)
          const lastService = bike.serviceLog?.[0]
          return (
            <div key={bike.id} className="garage-card" onClick={() => onSelect(bike.id)}>
              <div className="gc-left">
                <span className="gc-emoji">{typeInfo?.emoji}</span>
                <div className="gc-info">
                  <span className="gc-name">{bike.bikeName}</span>
                  <span className="gc-type">{typeInfo?.label} · {bike.mileage.toLocaleString()} км</span>
                  {lastService && (
                    <span className="gc-last">
                      Последнее ТО: {lastService.componentName} — {new Date(lastService.date).toLocaleDateString('ru')}
                    </span>
                  )}
                </div>
              </div>
              <div className="gc-right">
                <button
                  className="gc-delete"
                  onClick={e => { e.stopPropagation(); onDelete(bike.id) }}
                  title="Удалить"
                >✕</button>
                <span className="gc-arrow">→</span>
              </div>
            </div>
          )
        })}
      </div>

      <button className="btn-add-bike" onClick={onAdd}>
        + Добавить велосипед
      </button>
    </div>
  )
}
