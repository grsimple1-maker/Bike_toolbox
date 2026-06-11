import { useEffect, useRef } from 'react'

const ORS_KEY = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjY2Y2I2Y2NiOTYyZjQyNWJhYjJjNzM2ZjllODczMjdlIiwiaCI6Im11cm11cjY0In0='

// Строим маршрут из точки А в точку Б
export async function getRoute(fromLat, fromLon, toLat, toLon) {
  const url = `https://api.openrouteservice.org/v2/directions/cycling-regular/geojson`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': ORS_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      coordinates: [[fromLon, fromLat], [toLon, toLat]],
      preference: 'recommended',
    }),
  })
  if (!res.ok) throw new Error('Route error')
  return res.json()
}

// Геокодинг — найти координаты по названию
export async function geocode(query) {
  const url = `https://api.openrouteservice.org/geocode/search?api_key=${ORS_KEY}&text=${encodeURIComponent(query)}&size=1`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Geocode error')
  const data = await res.json()
  if (!data.features?.length) throw new Error('Место не найдено')
  const [lon, lat] = data.features[0].geometry.coordinates
  return { lat, lon, label: data.features[0].properties.label }
}

export default function WindMap({ center, windDeg, windSpeed, route, onMapClick }) {
  const mapRef     = useRef(null)
  const leafletRef = useRef(null)
  const routeLayerRef = useRef(null)
  const windLayerRef  = useRef(null)
  const markerRef  = useRef(null)

  useEffect(() => {
    if (leafletRef.current) return
    if (!window.L) { console.warn('Leaflet not loaded'); return }

    const L = window.L
    const map = L.map(mapRef.current, {
      center: center || [50.4, 80.2],
      zoom: 12,
      zoomControl: true,
    })

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap © CARTO',
      maxZoom: 19,
    }).addTo(map)

    map.on('click', e => {
      if (onMapClick) onMapClick(e.latlng.lat, e.latlng.lng)
    })

    leafletRef.current = map
    return () => { map.remove(); leafletRef.current = null }
  }, [])

  // Обновляем центр карты при смене города
  useEffect(() => {
    if (!leafletRef.current || !center) return
    leafletRef.current.setView(center, 12)
  }, [center])

  // Рисуем стрелки ветра на карте
  useEffect(() => {
    if (!leafletRef.current || !center || !window.L) return
    const L = window.L
    const map = leafletRef.current

    if (windLayerRef.current) { windLayerRef.current.remove() }

    const arrowDeg = (windDeg + 180) % 360 // куда дует
    const group = L.layerGroup()

    // Сетка стрелок ветра
    const offsets = [
      [-0.04,-0.06],[0,-0.06],[0.04,-0.06],
      [-0.04, 0],   [0, 0],   [0.04, 0],
      [-0.04, 0.06],[0, 0.06],[0.04, 0.06],
    ]
    offsets.forEach(([dlat, dlon]) => {
      const lat = center[0] + dlat
      const lon = center[1] + dlon
      const opacity = windSpeed > 15 ? 0.9 : windSpeed > 8 ? 0.7 : 0.5
      const color = windSpeed > 15 ? '#ff3d3d' : windSpeed > 8 ? '#ff9500' : '#00e676'
      const size = Math.max(16, Math.min(32, windSpeed * 2))

      const icon = L.divIcon({
        html: `<div style="
          transform: rotate(${arrowDeg}deg);
          font-size: ${size}px;
          opacity: ${opacity};
          color: ${color};
          text-shadow: 0 0 6px rgba(0,0,0,0.8);
          line-height: 1;
        ">↑</div>`,
        iconSize: [size, size],
        className: '',
      })
      L.marker([lat, lon], { icon, interactive: false }).addTo(group)
    })

    group.addTo(map)
    windLayerRef.current = group
  }, [center, windDeg, windSpeed])

  // Рисуем маршрут
  useEffect(() => {
    if (!leafletRef.current || !window.L) return
    const L = window.L
    const map = leafletRef.current

    if (routeLayerRef.current) { routeLayerRef.current.remove(); routeLayerRef.current = null }
    if (markerRef.current) { markerRef.current.forEach(m => m.remove()); markerRef.current = null }

    if (!route) return

    const coords = route.features[0].geometry.coordinates.map(([lon, lat]) => [lat, lon])
    const poly = L.polyline(coords, {
      color: '#ff5c35',
      weight: 5,
      opacity: 0.9,
      smoothFactor: 1,
    }).addTo(map)

    routeLayerRef.current = poly
    map.fitBounds(poly.getBounds(), { padding: [30, 30] })

    // Маркеры старт/финиш
    const startIcon = L.divIcon({ html: '<div style="background:#00e676;width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 0 6px rgba(0,230,118,.6)"></div>', iconSize:[14,14], className:'' })
    const endIcon   = L.divIcon({ html: '<div style="background:#ff5c35;width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 0 6px rgba(255,92,53,.6)"></div>', iconSize:[14,14], className:'' })

    markerRef.current = [
      L.marker(coords[0], { icon: startIcon }).addTo(map),
      L.marker(coords[coords.length-1], { icon: endIcon }).addTo(map),
    ]
  }, [route])

  return <div ref={mapRef} className="wind-map" />
}
