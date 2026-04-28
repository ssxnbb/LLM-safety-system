import { Tag } from 'antd'
import './evaluationComponents.css'

function RiskTag({ type = 'default', children }) {
  return <Tag className={`eval-risk-tag eval-risk-tag--${type}`}>{children}</Tag>
}

export default RiskTag
