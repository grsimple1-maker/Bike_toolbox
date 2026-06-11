import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Setup from '../components/Setup'
import Garage from '../components/Garage'
import Dashboard from '../components/Dashboard'
import { loadGarage, saveGarage, createBike } from '../data/storage'

export default function MaintenancePage() {
  const [garage, setGarage] = useState(null)
  const [view, setView] = useState('garage') // 'garage' | 'setup' | 'dashboard'
  const navigate = useNavigate()

  // Load from localStorage on mount
  useEffect(() => {
    const g = loadGarage()
    setGarage(g)
    if (g.bikes.length === 0) setView('setup')
    else setView('garage')
  }, [])

  // Save whenever garage changes
  useEffect(() => {
    if (garage) saveGarage(garage)
  }, [garage])

  const handleAddBike = (profile) => {
    const bike = createBike(profile)
    const newGarage = {
      bikes: [...(garage?.bikes || []), bike],
      activeBikeId: bike.id,
    }
    setGarage(newGarage)
    setView('dashboard')
  }

  const handleSelectBike = (bikeId) => {
    setGarage(g => ({ ...g, activeBikeId: bikeId }))
    setView('dashboard')
  }

  const handleDeleteBike = (bikeId) => {
    const newBikes = garage.bikes.filter(b => b.id !== bikeId)
    setGarage({ bikes: newBikes, activeBikeId: newBikes[0]?.id || null })
    if (newBikes.length === 0) setView('setup')
  }

  const handleUpdateBike = (updatedBike) => {
    setGarage(g => ({
      ...g,
      bikes: g.bikes.map(b => b.id === updatedBike.id ? updatedBike : b),
    }))
  }

  if (!garage) return null

  const activeBike = garage.bikes.find(b => b.id === garage.activeBikeId)

  return (
    <div className="app">
      {view === 'setup' && (
        <Setup
          onComplete={handleAddBike}
          onBack={() => garage.bikes.length > 0 ? setView('garage') : navigate('/')}
        />
      )}
      {view === 'garage' && (
        <Garage
          bikes={garage.bikes}
          onSelect={handleSelectBike}
          onAdd={() => setView('setup')}
          onDelete={handleDeleteBike}
          onBack={() => navigate('/')}
        />
      )}
      {view === 'dashboard' && activeBike && (
        <Dashboard
          bike={activeBike}
          onUpdate={handleUpdateBike}
          onBack={() => setView('garage')}
        />
      )}
    </div>
  )
}
