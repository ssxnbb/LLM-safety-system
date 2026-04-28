import { Card, List } from 'antd'
import { getScoreStatus } from '../../utils/evaluationScore.js'
import ProgressBar from './ProgressBar.jsx'
import RiskTag from './RiskTag.jsx'
import './evaluationComponents.css'

function getTagType(score) {
  if (score >= 85) {
    return 'success'
  }

  if (score >= 75) {
    return 'processing'
  }

  if (score >= 60) {
    return 'warning'
  }

  return 'danger'
}

function DimensionScoreList({ dimensionScores = [] }) {
  return (
    <Card className="eval-dimension-list" bordered={false}>
      <List
        split
        dataSource={dimensionScores}
        renderItem={(item) => (
          <List.Item className="eval-dimension-list__item">
            <div style={{ width: '100%' }}>
              <div className="eval-dimension-list__row">
                <div>
                  <div className="eval-dimension-list__title">{item.dimensionName || item.name}</div>
                  <div className="eval-dimension-list__weight">权重：{item.weight}%</div>
                </div>
                <div className="eval-dimension-list__score">
                  <span className="eval-dimension-list__score-value">
                    {item.score}
                    <span className="eval-dimension-list__score-unit">分</span>
                  </span>
                </div>
              </div>

              <ProgressBar percent={item.score} status={getTagType(item.score)} />

              <div className="eval-dimension-list__footer">
                <RiskTag type={getTagType(item.score)}>{getScoreStatus(item.score)}</RiskTag>
              </div>
            </div>
          </List.Item>
        )}
      />
    </Card>
  )
}

export default DimensionScoreList
