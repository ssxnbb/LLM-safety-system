import { Card, List } from 'antd'
import RiskTag from './RiskTag.jsx'
import './evaluationComponents.css'

function getRiskReason(item, type) {
  if (type === 'data') {
    return '该关键数据安全指标低于准入阈值，可能影响数据来源合规性、数据安全性或准入可信度。'
  }

  if (type === 'model') {
    return '该关键鲁棒性指标低于部署阈值，可能导致模型在扰动、对抗攻击或异常输入场景下输出不稳定。'
  }

  if (type === 'agent') {
    return '该关键智能体安全指标低于部署阈值，可能导致工具越权、任务失控、风险识别不足或失效边界不清晰。'
  }

  return '该关键指标低于预期阈值，建议尽快完成复核与整改。'
}

function getRiskSuggestion(item, type) {
  if (type === 'data') {
    return '建议补充来源核验、脱敏复检与关键项复测流程，确认风险收敛后再执行准入复评。'
  }

  if (type === 'model') {
    return '建议补充对抗样本覆盖、拒答策略校验和异常响应测试，并开展一轮针对性复测。'
  }

  if (type === 'agent') {
    return '建议补强权限边界、人工确认与运行时风险监测链路，再进入整改后复测。'
  }

  return '建议补充控制措施并复核该指标。'
}

function RiskItemList({ riskItems = [], type }) {
  return (
    <Card className="eval-risk-list" bordered={false}>
      <List
        dataSource={riskItems}
        locale={{ emptyText: '暂无关键风险项' }}
        renderItem={(item) => (
          <List.Item className="eval-risk-list__item">
            <div className="eval-risk-list__card">
              <div className="eval-risk-list__header">
                <div className="eval-risk-list__title">{item.indicatorName}</div>
                <RiskTag type="danger">关键风险</RiskTag>
              </div>

              <div className="eval-risk-list__meta">
                <RiskTag type="default">{item.dimensionName}</RiskTag>
                <RiskTag type="warning">评分：{item.rawScore}</RiskTag>
                <RiskTag type="default">权重：{item.weight}%</RiskTag>
              </div>

              <div className="eval-risk-list__section">
                <span className="eval-risk-list__section-label">风险原因</span>
                <div className="eval-risk-list__section-text">{getRiskReason(item, type)}</div>
              </div>

              <div className="eval-risk-list__section">
                <span className="eval-risk-list__section-label">整改建议</span>
                <div className="eval-risk-list__section-text">{getRiskSuggestion(item, type)}</div>
              </div>
            </div>
          </List.Item>
        )}
      />
    </Card>
  )
}

export default RiskItemList
