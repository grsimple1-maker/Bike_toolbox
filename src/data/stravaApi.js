const API_BASE = 'https://examguard-backend-production-7fc7.up.railway.app'

const CLIENT_ID   = '257159'
const REDIRECT_URI = `${window.location.origin}/strava/callback`

export function getStravaAuthUrl() {
  const params = new URLSearchParams({
    client_id:       CLIENT_ID,
    redirect_uri:    REDIRECT_URI,
    response_type:   'code',
    approval_prompt: 'auto',
    scope:           'read,activity:read_all',
  })
  return `https://www.strava.com/oauth/authorize?${params}`
}

export async function exchangeCode(code) {
  const res = await fetch(`${API_BASE}/auth/strava/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  })
  if (!res.ok) throw new Error('Auth failed')
  return res.json()
}

export async function refreshToken(refresh_token) {
  const res = await fetch(`${API_BASE}/auth/strava/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token }),
  })
  if (!res.ok) throw new Error('Refresh failed')
  return res.json()
}

const TOKEN_KEY = 'bw_strava_token'
export function saveToken(data)  { localStorage.setItem(TOKEN_KEY, JSON.stringify(data)) }
export function loadToken()      { try { const r = localStorage.getItem(TOKEN_KEY); return r ? JSON.parse(r) : null } catch { return null } }
export function clearToken()     { localStorage.removeItem(TOKEN_KEY) }
export function isTokenExpired(t){ return t.expires_at * 1000 < Date.now() + 60000 }

async function stravaGet(path, accessToken, params = {}) {
  const query = new URLSearchParams(params).toString()
  const url = `${API_BASE}/strava${path}${query ? '?' + query : ''}`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } })
  if (!res.ok) throw new Error(`Strava API error: ${res.status}`)
  return res.json()
}

export const getAthlete      = at => stravaGet('/athlete', at)
export const getAthleteStats = (id, at) => stravaGet(`/athletes/${id}/stats`, at)
export const getActivities   = (at, page=1, perPage=30) => stravaGet('/athlete/activities', at, { page, per_page: perPage })
