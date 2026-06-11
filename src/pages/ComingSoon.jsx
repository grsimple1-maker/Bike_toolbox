import { useNavigate } from 'react-router-dom'

export default function ComingSoon({ tool, icon, desc }) {
  const navigate = useNavigate()

  return (
    <div className="coming-screen">
      <button className="btn-back-nav" onClick={() => navigate('/')}>← Назад</button>
      <div className="coming-content">
        <span className="coming-icon">{icon}</span>
        <h2 className="coming-title">{tool}</h2>
        <p className="coming-desc">{desc}</p>
        <div className="coming-badge">В разработке</div>
      </div>
    </div>
  )
}
