const KEY = 'bikewrench_garage'

export function loadGarage() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : { bikes: [], activeBikeId: null }
  } catch { return { bikes: [], activeBikeId: null } }
}

export function saveGarage(garage) {
  localStorage.setItem(KEY, JSON.stringify(garage))
}

export function createBike(profile) {
  return {
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    bikeName: profile.bikeName,
    bikeType: profile.bikeType,
    mileage: profile.mileage,
    lastServices: {},   // { componentId: mileageAtService }
    serviceLog: [],     // [{ id, componentId, componentName, mileage, date, note }]
  }
}

export function logService(bike, componentId, componentName, mileage, note = '') {
  const entry = {
    id: Date.now().toString(),
    componentId,
    componentName,
    mileage,
    date: new Date().toISOString(),
    note,
  }
  return {
    ...bike,
    lastServices: { ...bike.lastServices, [componentId]: mileage },
    serviceLog: [entry, ...bike.serviceLog],
  }
}

// ── Bike Fit profiles ────────────────────────────────────────────────────────
const FIT_KEY = 'bikewrench_fits'

export function loadFits() {
  try {
    const raw = localStorage.getItem(FIT_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function saveFit(fitProfile) {
  const fits = loadFits()
  const entry = { ...fitProfile, id: Date.now().toString(), savedAt: new Date().toISOString() }
  const updated = [entry, ...fits].slice(0, 10) // макс 10 сохранённых
  localStorage.setItem(FIT_KEY, JSON.stringify(updated))
  return entry
}

export function deleteFit(id) {
  const fits = loadFits().filter(f => f.id !== id)
  localStorage.setItem(FIT_KEY, JSON.stringify(fits))
}
