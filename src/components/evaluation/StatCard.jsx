import { Card } from 'antd'
import './evaluationComponents.css'

function StatCard({ title, value, desc, icon, color = '#1677ff' }) {
  return (
    <Card className="eval-stat-card" bordered={false}>
      <div className="eval-stat-card__content">
        <div
          className="eval-stat-card__icon"
          style={{
            '--icon-color': color,
            '--icon-bg': `${color}1A`,
          }}
        >
          {icon}
        </div>
        <div className="eval-stat-card__body">
          <div className="eval-stat-card__title">{title}</div>
          <div className="eval-stat-card__value">{value}</div>
          {desc ? <div className="eval-stat-card__desc">{desc}</div> : null}
        </div>
      </div>
    </Card>
  )
}

export default StatCard
