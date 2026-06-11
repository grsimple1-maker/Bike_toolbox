import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import MaintenancePage from './pages/MaintenancePage'
import FitPage from './pages/FitPage'
import StravaPage from './pages/StravaPage'
import StravaCallback from './pages/StravaCallback'
import WindPage from './pages/WindPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/maintenance" element={<MaintenancePage />} />
      <Route path="/fit" element={<FitPage />} />
      <Route path="/strava" element={<StravaPage />} />
      <Route path="/strava/callback" element={<StravaCallback />} />
      <Route path="/wind" element={<WindPage />} />
    </Routes>
  )
}
