import {
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import {
  Breadcrumb,
  Button,
  Card,
  Col,
  Empty,
  Input,
  Popconfirm,
  Progress,
  Row,
  Select,
  Space,
  message,
} from 'antd'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import PageTitle from '../../components/evaluation/PageTitle.jsx'
import RiskTag from '../../components/evaluation/RiskTag.jsx'
import { getTasksByType } from '../../mock/evaluationTasks.js'
import {
  calculateEvaluationResult,
  getScoreStatus,
  getStatusColor,
  getStatusText,
  getTypeText,
} from '../../utils/evaluationScore.js'
import './EvaluationTasks.css'

const pageMetaMap = {
  data: {
    title: '数据集评估任务',
    subtitle: '集中查看数据集准入评估任务的执行状态、风险结果与评估报告。',
  },
  model: {
    title: '模型评估任务',
    subtitle: '集中查看模型鲁棒性评估任务的进度、得分与最终等级。',
  },
  agent: {
    title: '智能体评估任务',
    subtitle: '集中查看智能体部署评估任务的状态、风险项与报告结果。',
  },
}

const statusFilterOptions = [
  { label: '全部', value: 'all' },
  { label: '进行中', value: 'running' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'canceled' },
  { label: '整改中', value: 'rectifying' },
]

function getTypeFromPath(pathname) {
  const [, section, type] = pathname.split('/')

  if (section === 'evaluation' && ['data', 'model', 'agent'].includes(type)) {
    return type
  }

  return 'data'
}

function getProgressStatus(status) {
  if (status === 'completed') {
    return 'success'
  }

  if (status === 'rectifying') {
    return 'warning'
  }

  if (status === 'running') {
    return 'active'
  }

  return 'normal'
}

function getLevelTagType(totalScore) {
  if (totalScore >= 85) {
    return 'success'
  }

  if (totalScore >= 75) {
    return 'processing'
  }

  if (totalScore >= 60) {
    return 'warning'
  }

  return 'danger'
}

function getDatasetLabel(type) {
  if (type === 'data') {
    return '数据集'
  }

  return '测试集'
}

function EvaluationTasks() {
  const navigate = useNavigate()
  const location = useLocation()
  const type = getTypeFromPath(location.pathname)
  const pageMeta = pageMetaMap[type] || pageMetaMap.data

  const [keywordInput, setKeywordInput] = useState('')
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [deletedIdsByType, setDeletedIdsByType] = useState({
    data: [],
    model: [],
    agent: [],
  })

  const deletedIds = deletedIdsByType[type] || []
  const tasks = getTasksByType(type)
    .filter((task) => !deletedIds.includes(task.id))
    .map((task) => {
      const result = calculateEvaluationResult(type, task.scores)
      const isHighRisk = result.riskItems.length > 0 || result.totalScore < 60

      return {
        ...task,
        result,
        isHighRisk,
      }
    })

  const filteredTasks = tasks.filter((task) => {
    const matchKeyword = keyword ? task.name.includes(keyword.trim()) : true
    const matchStatus = statusFilter === 'all' ? true : task.status === statusFilter
    return matchKeyword && matchStatus
  })

  const totalCount = tasks.length
  const runningCount = tasks.filter((task) => task.status === 'running').length
  const completedCount = tasks.filter((task) => task.status === 'completed').length
  const highRiskCount = tasks.filter((task) => task.isHighRisk).length

  const handleSearch = () => {
    setKeyword(keywordInput.trim())
  }

  const handleDelete = (taskId) => {
    setDeletedIdsByType((prev) => ({
      ...prev,
      [type]: [...(prev[type] || []), taskId],
    }))
    message.success('任务已删除')
  }

  return (
    <div className="page-shell">
      <Breadcrumb
        className="page-breadcrumb"
        items={[
          { title: '首页' },
          { title: getTypeText(type) },
          { title: pageMeta.title },
        ]}
      />

      <PageTitle
        title={pageMeta.title}
        subtitle={pageMeta.subtitle}
        actions={[
          <Button
            key="create"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate(`/evaluation/${type}/create`)}
          >
            新建评估
          </Button>,
        ]}
      />

      <Card className="eval-tasks-filter" bordered={false}>
        <Space wrap size={16} className="eval-tasks-filter__row">
          <Input
            value={keywordInput}
            onChange={(event) => setKeywordInput(event.target.value)}
            placeholder="搜索任务名称"
            className="eval-tasks-filter__search"
            allowClear
            onPressEnter={handleSearch}
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusFilterOptions}
            className="eval-tasks-filter__select"
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            搜索
          </Button>
        </Space>
      </Card>

      <div className="eval-tasks-badges">
        <RiskTag type="processing">总任务数：{totalCount}</RiskTag>
        <RiskTag type="processing">进行中：{runningCount}</RiskTag>
        <RiskTag type="success">已完成：{completedCount}</RiskTag>
        <RiskTag type={highRiskCount > 0 ? 'danger' : 'success'}>
          高风险：{highRiskCount}
        </RiskTag>
      </div>

      {filteredTasks.length ? (
        <Row gutter={[16, 16]}>
          {filteredTasks.map((task) => (
            <Col xs={24} md={12} xl={8} key={task.id}>
              <Card className="eval-task-card" bordered={false}>
                <div className="eval-task-card__header">
                  <div className="eval-task-card__title">{task.name}</div>
                  <RiskTag type={getStatusColor(task.status)}>{getStatusText(task.status)}</RiskTag>
                </div>

                <div className="eval-task-card__meta">
                  <div className="eval-task-card__meta-row">
                    <span className="eval-task-card__label">评估对象</span>
                    <span className="eval-task-card__value">{task.targetName}</span>
                  </div>
                  <div className="eval-task-card__meta-row">
                    <span className="eval-task-card__label">评估配置</span>
                    <span className="eval-task-card__value">{task.configName}</span>
                  </div>
                  <div className="eval-task-card__meta-row">
                    <span className="eval-task-card__label">所属行业</span>
                    <span className="eval-task-card__value">{task.industry}</span>
                  </div>
                  <div className="eval-task-card__meta-row">
                    <span className="eval-task-card__label">{getDatasetLabel(type)}</span>
                    <span className="eval-task-card__value">{task.datasetName}</span>
                  </div>
                  <div className="eval-task-card__meta-row">
                    <span className="eval-task-card__label">测试用例数</span>
                    <span className="eval-task-card__value">{task.testCaseCount}</span>
                  </div>
                  <div className="eval-task-card__meta-row">
                    <span className="eval-task-card__label">创建时间</span>
                    <span className="eval-task-card__value">{task.createdAt}</span>
                  </div>
                </div>

                <div className="eval-task-card__progress">
                  <div className="eval-task-card__progress-header">
                    <span>执行进度</span>
                    <span>{task.progress}%</span>
                  </div>
                  <Progress
                    percent={task.progress}
                    status={getProgressStatus(task.status)}
                    showInfo={false}
                    strokeColor={
                      task.status === 'completed'
                        ? '#52c41a'
                        : task.status === 'rectifying'
                          ? '#fa8c16'
                          : task.status === 'running'
                            ? '#1677ff'
                            : '#d0d5dd'
                    }
                    trailColor="#edf2fa"
                  />
                </div>

                <div className="eval-task-card__result">
                  <div className="eval-task-card__result-item">
                    <span className="eval-task-card__label">总分</span>
                    <span
                      className={`eval-task-card__score${
                        task.result.totalScore < 60 ? ' is-danger' : ''
                      }`}
                    >
                      {task.result.totalScore}
                    </span>
                  </div>
                  <div className="eval-task-card__result-item">
                    <span className="eval-task-card__label">最终等级</span>
                    <RiskTag type={getLevelTagType(task.result.totalScore)}>{task.result.level}</RiskTag>
                  </div>
                </div>

                <div className="eval-task-card__tags">
                  {task.tags.map((tag) => (
                    <RiskTag key={tag} type="default">
                      {tag}
                    </RiskTag>
                  ))}
                  {task.isHighRisk ? <RiskTag type="danger">高风险</RiskTag> : null}
                  <RiskTag type={getLevelTagType(task.result.totalScore)}>
                    {getScoreStatus(task.result.totalScore)}
                  </RiskTag>
                </div>

                <div className="eval-task-card__actions">
                  <Button
                    type="link"
                    onClick={() => navigate(`/evaluation/${type}/report/${task.id}`)}
                  >
                    详情
                  </Button>
                  <Button
                    type="link"
                    onClick={() => navigate(`/evaluation/${type}/report/${task.id}`)}
                  >
                    报告
                  </Button>
                  <Popconfirm
                    title="确认删除该任务吗？"
                    okText="删除"
                    cancelText="取消"
                    onConfirm={() => handleDelete(task.id)}
                  >
                    <Button type="link" danger icon={<DeleteOutlined />}>
                      删除
                    </Button>
                  </Popconfirm>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Card className="eval-task-empty" bordered={false}>
          <Empty description="暂无符合条件的评估任务" />
        </Card>
      )}
    </div>
  )
}

export default EvaluationTasks
