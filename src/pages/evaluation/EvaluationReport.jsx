import { DownloadOutlined } from '@ant-design/icons'
import {
  Breadcrumb,
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  Row,
  Space,
  message,
} from 'antd'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import DimensionScoreList from '../../components/evaluation/DimensionScoreList.jsx'
import IndicatorTable from '../../components/evaluation/IndicatorTable.jsx'
import PageTitle from '../../components/evaluation/PageTitle.jsx'
import RiskItemList from '../../components/evaluation/RiskItemList.jsx'
import RiskTag from '../../components/evaluation/RiskTag.jsx'
import ScoreCircle from '../../components/evaluation/ScoreCircle.jsx'
import { getTasksByType } from '../../mock/evaluationTasks.js'
import {
  calculateEvaluationResult,
  getTypeText,
} from '../../utils/evaluationScore.js'
import './EvaluationReport.css'

const scoreLabelMap = {
  data: '安全评分',
  model: '鲁棒评分',
  agent: '部署安全评分',
}

const suggestionMap = {
  data: [
    '建议补充数据来源授权证明与使用范围说明。',
    '建议加强涉敏字段识别、脱敏处理和审计留痕。',
    '建议对低分关键项重新抽样检测后再准入。',
    '建议建立数据版本、数据来源和检测结果的关联追溯机制。',
  ],
  model: [
    '建议增加高级对抗攻击样本覆盖。',
    '建议针对长上下文一致性和连续推理稳定性进行专项优化。',
    '建议完善异常响应、安全拒答和风险告警策略。',
    '建议补充模型安全漏洞识别覆盖率测试。',
  ],
  agent: [
    '建议加强工具调用权限边界控制。',
    '建议对提示注入、记忆污染和越权操作进行专项测试。',
    '建议高风险任务加入人工确认和审计闭环。',
    '建议完善智能体运行时安全态势感知与失效边界控制。',
  ],
}

const adviceTextMap = {
  data: '当前报告重点关注数据来源合规性、涉敏字段识别、脱敏有效性和准入审计留痕。建议优先复核关键低分项，完成整改后再发起准入复评。',
  model: '当前报告重点关注模型在扰动、异常输入和对抗攻击场景下的稳定表现。建议对关键鲁棒性短板开展专项优化并补充复测样本。',
  agent: '当前报告重点关注智能体的权限边界、风险识别、人工确认和失效边界控制。建议先完成高风险链路收敛，再推进受控部署。',
}

function getTypeFromPath(pathname) {
  const [, section, type] = pathname.split('/')

  if (section === 'evaluation' && ['data', 'model', 'agent'].includes(type)) {
    return type
  }

  return 'data'
}

function getDatasetLabel(type) {
  return type === 'data' ? '使用的数据集' : '使用的测试集'
}

function EvaluationReport() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams()
  const type = getTypeFromPath(location.pathname)
  const task = getTasksByType(type).find((item) => item.id === id)

  if (!task) {
    return (
      <div className="page-shell">
        <Breadcrumb
          className="page-breadcrumb"
          items={[
            { title: '首页' },
            { title: getTypeText(type) },
            { title: '报告详情' },
          ]}
        />

        <Card className="eval-report-empty" bordered={false}>
          <Empty description="未找到对应评估报告">
            <Button type="primary" onClick={() => navigate(`/evaluation/${type}/tasks`)}>
              返回评估任务
            </Button>
          </Empty>
        </Card>
      </div>
    )
  }

  const result = calculateEvaluationResult(type, task.scores)
  const scoreLabel = scoreLabelMap[type] || '评估得分'
  const suggestions = suggestionMap[type] || []

  return (
    <div className="page-shell">
      <Breadcrumb
        className="page-breadcrumb"
        items={[
          { title: '首页' },
          { title: getTypeText(type) },
          { title: '报告详情' },
        ]}
      />

      <PageTitle
        title="报告详情"
        subtitle="查看本次评估任务的综合得分、关键风险、指标明细与整改建议。"
        showBack
        onBack={() => navigate(`/evaluation/${type}/tasks`)}
        actions={[
          <Button
            key="export"
            icon={<DownloadOutlined />}
            onClick={() => message.info('报告导出功能待接入')}
          >
            导出报告
          </Button>,
        ]}
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={16}>
          <Card className="eval-report-main" bordered={false}>
            <div className="eval-report-main__layout">
              <div className="eval-report-main__score">
                <ScoreCircle score={result.totalScore} label={scoreLabel} level={result.level} />
              </div>

              <div className="eval-report-main__content">
                <div className="eval-report-main__top">
                  <div className="eval-report-main__title">{task.name}</div>
                  <RiskTag
                    type={
                      result.totalScore >= 85
                        ? 'success'
                        : result.totalScore >= 75
                          ? 'processing'
                          : result.totalScore >= 60
                            ? 'warning'
                            : 'danger'
                    }
                  >
                    {result.level}
                  </RiskTag>
                </div>

                <Descriptions column={2} labelStyle={{ width: 110 }}>
                  <Descriptions.Item label="评估名称">{task.name}</Descriptions.Item>
                  <Descriptions.Item label="评估对象">{task.targetName}</Descriptions.Item>
                  <Descriptions.Item label="评估类型">{getTypeText(type)}</Descriptions.Item>
                  <Descriptions.Item label="评估配置">{task.configName}</Descriptions.Item>
                  <Descriptions.Item label="所属行业">{task.industry}</Descriptions.Item>
                  <Descriptions.Item label="测试用例数">{task.testCaseCount}</Descriptions.Item>
                  <Descriptions.Item label="创建时间">{task.createdAt || '--'}</Descriptions.Item>
                  <Descriptions.Item label="完成时间">{task.completedAt || '--'}</Descriptions.Item>
                  <Descriptions.Item label="高风险项数量">{result.riskItems.length}</Descriptions.Item>
                  <Descriptions.Item label="通过项数量">{result.passedItems.length}</Descriptions.Item>
                </Descriptions>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} xl={8}>
          <Card title="辅助信息" className="eval-report-side" bordered={false}>
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <div className="eval-report-side__item">
                <div className="eval-report-side__label">{getDatasetLabel(type)}</div>
                <div className="eval-report-side__value">{task.datasetName || '--'}</div>
              </div>
              <div className="eval-report-side__item">
                <div className="eval-report-side__label">使用的评估配置</div>
                <div className="eval-report-side__value">{task.configName || '--'}</div>
              </div>
              <div className="eval-report-side__item">
                <div className="eval-report-side__label">安全建议/整改建议</div>
                <div className="eval-report-side__text">{adviceTextMap[type]}</div>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <div className="eval-report-section">
        <div className="eval-report-section__title">维度得分</div>
        <DimensionScoreList dimensionScores={result.dimensionScores} />
      </div>

      <div className="eval-report-section">
        <div className="eval-report-section__title">关键风险项</div>
        <RiskItemList riskItems={result.riskItems} type={type} />
      </div>

      <div className="eval-report-section">
        <div className="eval-report-section__title">指标明细</div>
        <IndicatorTable indicatorResults={result.indicatorResults} />
      </div>

      <Card title="整改建议" className="eval-report-suggestions" bordered={false}>
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          {suggestions.map((item) => (
            <div key={item} className="eval-report-suggestions__item">
              {item}
            </div>
          ))}
        </Space>
      </Card>
    </div>
  )
}

export default EvaluationReport
