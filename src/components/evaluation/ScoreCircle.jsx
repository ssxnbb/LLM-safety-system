import { Card } from 'antd'
import './evaluationComponents.css'

function ScoreCircle({ score = 0, label, level }) {
  const safeScore = Math.max(0, Math.min(Number(score) || 0, 100))
  const ringColor = safeScore >= 85 ? '#1677ff' : safeScore >= 75 ? '#52c41a' : safeScore >= 60 ? '#faad14' : '#ff4d4f'

  return (
    <Card className="eval-score-circle-card" bordered={false}>
      <div className="eval-score-circle">
        <div
          className="eval-score-circle__ring"
          style={{
            '--ring-percent': safeScore,
            '--ring-color': ringColor,
          }}
        >
          <div className="eval-score-circle__inner">
            <div className="eval-score-circle__score">{safeScore}</div>
            <div className="eval-score-circle__score-unit">分</div>
          </div>
        </div>
        {label ? <div className="eval-score-circle__label">{label}</div> : null}
        {level ? <div className="eval-score-circle__level">{level}</div> : null}
      </div>
    </Card>
  )
}

export default ScoreCircle
