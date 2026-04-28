import { Progress } from 'antd'
import './evaluationComponents.css'

const progressColorMap = {
  success: '#52c41a',
  processing: '#1677ff',
  warning: '#faad14',
  danger: '#ff4d4f',
  default: '#d0d5dd',
}

function ProgressBar({ percent = 0, status = 'processing' }) {
  const safePercent = Math.max(0, Math.min(Number(percent) || 0, 100))

  return (
    <div className="eval-progress">
      <div className="eval-progress__meta">
        <span className="eval-progress__text">完成度</span>
        <span className="eval-progress__value">{safePercent}%</span>
      </div>
      <Progress
        percent={safePercent}
        showInfo={false}
        strokeColor={progressColorMap[status] || progressColorMap.default}
        trailColor="#edf2fa"
      />
    </div>
  )
}

export default ProgressBar
