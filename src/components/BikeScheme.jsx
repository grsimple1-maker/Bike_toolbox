import { useMemo } from 'react'

// SVG схема велосипеда с динамическими параметрами посадки
export default function BikeScheme({ results, bikeType }) {
  const hasDropbar = bikeType === 'road' || bikeType === 'fix' || bikeType === 'gravel'

  // Нормализуем параметры в координаты SVG (viewBox 0 0 400 260)
  const pts = useMemo(() => {
    if (!results) return null

    // Базовые точки (пропорции реального велосипеда)
    const BB  = { x: 190, y: 185 }  // каретка
    const RW  = { x: 310, y: 185 }  // центр заднего колеса
    const FW  = { x: 70,  y: 185 }  // центр переднего колеса
    const wheelR = 52

    // Седло — высота от каретки
    const sH = Math.max(60, Math.min(120, results.saddleHeight / 3.2))
    const sBack = Math.max(10, Math.min(30, results.saddleSetback / 2.5))
    const SADDLE = { x: BB.x + sBack, y: BB.y - sH }

    // Руль — reach + stack
    const reach = Math.max(30, Math.min(70, results.reach / 4.5))
    const stack = Math.max(50, Math.min(90, results.stack / 4.5))
    const HB = { x: BB.x - reach, y: BB.y - stack }

    // Рулевая труба
    const HT_BOT = { x: HB.x + 8,  y: HB.y + 25 }
    const HT_TOP = { x: HB.x + 2,  y: HB.y }

    return { BB, RW, FW, SADDLE, HB, HT_BOT, HT_TOP, wheelR }
  }, [results, bikeType])

  if (!pts) return null
  const { BB, RW, FW, SADDLE, HB, HT_BOT, wheelR } = pts

  // Точки седла
  const saddlePts = [
    [SADDLE.x - 18, SADDLE.y + 4],
    [SADDLE.x + 14, SADDLE.y + 4],
    [SADDLE.x + 12, SADDLE.y],
    [SADDLE.x - 16, SADDLE.y],
  ]

  // Шатун
  const crankAngle = 40 * Math.PI / 180
  const crankLen = 22
  const PEDAL = {
    x: BB.x + Math.cos(crankAngle) * crankLen,
    y: BB.y + Math.sin(crankAngle) * crankLen,
  }

  return (
    <div className="bike-scheme-wrap">
      <svg viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg" className="bike-scheme-svg">
        <defs>
          <radialGradient id="wheelGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2a2a38" />
            <stop offset="100%" stopColor="#1a1a24" />
          </radialGradient>
        </defs>

        {/* Колёса */}
        <circle cx={RW.x} cy={RW.y} r={wheelR} fill="none" stroke="#2a2a38" strokeWidth="10" />
        <circle cx={RW.x} cy={RW.y} r={wheelR} fill="none" stroke="#3a3a50" strokeWidth="3" />
        <circle cx={FW.x} cy={FW.y} r={wheelR} fill="none" stroke="#2a2a38" strokeWidth="10" />
        <circle cx={FW.x} cy={FW.y} r={wheelR} fill="none" stroke="#3a3a50" strokeWidth="3" />
        {/* Спицы */}
        {[0,60,120,180,240,300].map(a => {
          const rad = a * Math.PI / 180
          return [
            <line key={`rs${a}`} x1={RW.x} y1={RW.y}
              x2={RW.x + Math.cos(rad)*wheelR} y2={RW.y + Math.sin(rad)*wheelR}
              stroke="#2a2a38" strokeWidth="1" />,
            <line key={`fs${a}`} x1={FW.x} y1={FW.y}
              x2={FW.x + Math.cos(rad)*wheelR} y2={FW.y + Math.sin(rad)*wheelR}
              stroke="#2a2a38" strokeWidth="1" />,
          ]
        })}
        {/* Втулки */}
        <circle cx={RW.x} cy={RW.y} r={5} fill="#3a3a50" />
        <circle cx={FW.x} cy={FW.y} r={5} fill="#3a3a50" />

        {/* Рама */}
        {/* Подседельная труба BB→Seddle */}
        <line x1={BB.x} y1={BB.y} x2={SADDLE.x} y2={SADDLE.y + 4} stroke="#4a4a6a" strokeWidth="5" strokeLinecap="round" />
        {/* Верхняя труба Saddle→HT */}
        <line x1={SADDLE.x} y1={SADDLE.y + 4} x2={HT_BOT.x} y2={HT_BOT.y} stroke="#4a4a6a" strokeWidth="4" strokeLinecap="round" />
        {/* Нижняя труба BB→HT */}
        <line x1={BB.x} y1={BB.y} x2={HT_BOT.x} y2={HT_BOT.y} stroke="#4a4a6a" strokeWidth="5" strokeLinecap="round" />
        {/* Перья BB→RW */}
        <line x1={BB.x} y1={BB.y} x2={RW.x} y2={RW.y} stroke="#4a4a6a" strokeWidth="4" strokeLinecap="round" />
        <line x1={SADDLE.x} y1={SADDLE.y + 4} x2={RW.x} y2={RW.y} stroke="#3a3a50" strokeWidth="3" strokeLinecap="round" />
        {/* Вилка HT→FW */}
        <line x1={HT_BOT.x} y1={HT_BOT.y} x2={FW.x} y2={FW.y} stroke="#4a4a6a" strokeWidth="4" strokeLinecap="round" />

        {/* Каретка */}
        <circle cx={BB.x} cy={BB.y} r={8} fill="#3a3a50" stroke="#5a5a7a" strokeWidth="2" />
        {/* Шатун + педаль */}
        <line x1={BB.x} y1={BB.y} x2={PEDAL.x} y2={PEDAL.y} stroke="#ff5c35" strokeWidth="4" strokeLinecap="round" />
        <rect x={PEDAL.x - 8} y={PEDAL.y - 3} width="16" height="6" rx="2" fill="#ff5c35" />
        {/* Звёздочка */}
        <circle cx={BB.x} cy={BB.y} r={14} fill="none" stroke="#ff5c35" strokeWidth="2.5" strokeDasharray="4 3" />

        {/* Седло */}
        <polygon points={saddlePts.map(p => p.join(',')).join(' ')} fill="#5a5a7a" stroke="#7a7a9a" strokeWidth="1.5" />
        {/* Подседельный штырь */}
        <line x1={SADDLE.x} y1={SADDLE.y + 4} x2={SADDLE.x} y2={SADDLE.y + 18} stroke="#ff5c35" strokeWidth="3" strokeLinecap="round" />

        {/* Руль */}
        {hasDropbar ? (
          // Дроп-руль
          <>
            <path d={`M ${HB.x - 14} ${HB.y} Q ${HB.x - 14} ${HB.y + 14} ${HB.x - 8} ${HB.y + 20}`}
              fill="none" stroke="#ff5c35" strokeWidth="4" strokeLinecap="round" />
            <path d={`M ${HB.x + 14} ${HB.y} Q ${HB.x + 14} ${HB.y + 14} ${HB.x + 8} ${HB.y + 20}`}
              fill="none" stroke="#ff5c35" strokeWidth="4" strokeLinecap="round" />
            <line x1={HB.x - 14} y1={HB.y} x2={HB.x + 14} y2={HB.y} stroke="#ff5c35" strokeWidth="4" strokeLinecap="round" />
          </>
        ) : (
          // Прямой руль
          <line x1={HB.x - 22} y1={HB.y} x2={HB.x + 22} y2={HB.y} stroke="#ff5c35" strokeWidth="5" strokeLinecap="round" />
        )}
        {/* Вынос */}
        <line x1={HB.x} y1={HB.y} x2={HT_BOT.x} y2={HT_BOT.y} stroke="#ff5c35" strokeWidth="3.5" strokeLinecap="round" />
        {/* Рулевая */}
        <line x1={HT_BOT.x} y1={HT_BOT.y} x2={HT_BOT.x - 6} y2={HT_BOT.y - 28} stroke="#5a5a7a" strokeWidth="5" strokeLinecap="round" />

        {/* ── Размерные линии ── */}
        {/* Высота седла */}
        <line x1={BB.x + 55} y1={BB.y} x2={BB.x + 55} y2={SADDLE.y}
          stroke="#ffd600" strokeWidth="1" strokeDasharray="4 3" opacity="0.6" />
        <line x1={BB.x + 48} y1={BB.y} x2={BB.x + 62} y2={BB.y} stroke="#ffd600" strokeWidth="1" opacity="0.6" />
        <line x1={BB.x + 48} y1={SADDLE.y} x2={BB.x + 62} y2={SADDLE.y} stroke="#ffd600" strokeWidth="1" opacity="0.6" />
        <text x={BB.x + 64} y={(BB.y + SADDLE.y) / 2 + 4} fontSize="9" fill="#ffd600" opacity="0.9">
          {results.saddleHeight}мм
        </text>

        {/* Stack */}
        <line x1={HB.x - 28} y1={BB.y} x2={HB.x - 28} y2={HB.y}
          stroke="#00b4d8" strokeWidth="1" strokeDasharray="4 3" opacity="0.6" />
        <text x={HB.x - 52} y={(BB.y + HB.y) / 2 + 4} fontSize="9" fill="#00b4d8" opacity="0.9">
          {results.stack}мм
        </text>

        {/* Reach */}
        <line x1={BB.x} y1={HB.y - 22} x2={HB.x} y2={HB.y - 22}
          stroke="#00e676" strokeWidth="1" strokeDasharray="4 3" opacity="0.6" />
        <line x1={BB.x} y1={HB.y - 28} x2={BB.x} y2={HB.y - 16} stroke="#00e676" strokeWidth="1" opacity="0.6" />
        <line x1={HB.x} y1={HB.y - 28} x2={HB.x} y2={HB.y - 16} stroke="#00e676" strokeWidth="1" opacity="0.6" />
        <line x1={BB.x} y1={HB.y - 22} x2={HB.x} y2={HB.y - 22} stroke="#00e676" strokeWidth="1" opacity="0.6" />
        <text x={(BB.x + HB.x) / 2 - 14} y={HB.y - 28} fontSize="9" fill="#00e676" opacity="0.9">
          {results.reach}мм
        </text>

        {/* Легенда */}
        <rect x="8" y="8" width="110" height="54" rx="6" fill="rgba(10,10,15,0.7)" />
        {[
          { color: '#ffd600', label: 'Высота седла' },
          { color: '#00b4d8', label: 'Stack' },
          { color: '#00e676', label: 'Reach' },
        ].map((item, i) => (
          <g key={i}>
            <rect x="16" y={18 + i * 14} width="8" height="3" rx="1" fill={item.color} opacity="0.9" />
            <text x="30" y={22 + i * 14} fontSize="9" fill={item.color} opacity="0.9">{item.label}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}
