import { PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import { Breadcrumb, Button, Card, Col, Row, Space, Table, message } from 'antd'
import {
  Activity,
  CheckCircle2,
  ClipboardList,
  ShieldCheck,
} from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import PageTitle from '../../components/evaluation/PageTitle.jsx'
import RiskTag from '../../components/evaluation/RiskTag.jsx'
import StatCard from '../../components/evaluation/StatCard.jsx'
import { getEvaluationSchema } from '../../mock/evaluationSchemas.js'
import { getTasksByType } from '../../mock/evaluationTasks.js'
import {
  calculateEvaluationResult,
  getLevelColor,
  getScoreStatus,
  getStatusColor,
  getStatusText,
  getTypeText,
} from '../../utils/evaluationScore.js'
import './EvaluationOverview.css'

const overviewMetaMap = {
  data: {
    title: '数据集评估概览',
    subtitle: '面向数据来源、质量、标注偏差和安全风险的准入评估',
    averageLabel: '平均安全分',
  },
  model: {
    title: '模型评估概览',
    subtitle: '面向模型鲁棒性、安全容错和漏洞识别能力的分级评估',
    averageLabel: '平均鲁棒分',
  },
  agent: {
    title: '智能体评估概览',
    subtitle: '面向环境感知、任务规划、工具调用和失效边界的部署评估',
    averageLabel: '平均部署安全分',
  },
}

const pieColors = ['#1677ff', '#52c41a', '#faad14', '#fa8c16', '#ff4d4f']
const modelMonthlyTrendData = [
  { month: '1月', aviation: 6, aerospace: 5, shipbuilding: 7, weapons: 4, electronics: 5, nuclear: 8 },
  { month: '2月', aviation: 8, aerospace: 7, shipbuilding: 9, weapons: 6, electronics: 7, nuclear: 10 },
  { month: '3月', aviation: 11, aerospace: 9, shipbuilding: 12, weapons: 8, electronics: 9, nuclear: 13 },
  { month: '4月', aviation: 13, aerospace: 11, shipbuilding: 14, weapons: 10, electronics: 11, nuclear: 15 },
  { month: '5月', aviation: 17, aerospace: 14, shipbuilding: 18, weapons: 13, electronics: 14, nuclear: 19 },
  { month: '6月', aviation: 20, aerospace: 17, shipbuilding: 21, weapons: 15, electronics: 17, nuclear: 22 },
  { month: '7月', aviation: 24, aerospace: 20, shipbuilding: 25, weapons: 18, electronics: 20, nuclear: 26 },
  { month: '8月', aviation: 28, aerospace: 23, shipbuilding: 29, weapons: 21, electronics: 23, nuclear: 30 },
  { month: '9月', aviation: 32, aerospace: 27, shipbuilding: 33, weapons: 24, electronics: 27, nuclear: 35 },
  { month: '10月', aviation: 36, aerospace: 31, shipbuilding: 37, weapons: 28, electronics: 31, nuclear: 39 },
  { month: '11月', aviation: 40, aerospace: 35, shipbuilding: 41, weapons: 32, electronics: 35, nuclear: 44 },
  { month: '12月', aviation: 44, aerospace: 39, shipbuilding: 45, weapons: 36, electronics: 39, nuclear: 48 },
]
const industryTrendMeta = [
  { key: 'aviation', label: '航空', color: '#3b82f6' },
  { key: 'aerospace', label: '航天', color: '#8b5cf6' },
  { key: 'shipbuilding', label: '船舶', color: '#06b6d4' },
  { key: 'weapons', label: '兵器', color: '#f59e0b' },
  { key: 'electronics', label: '电子', color: '#22c55e' },
  { key: 'nuclear', label: '核工业', color: '#ef4444' },
]

function getTypeFromPath(pathname) {
  const [, section, type] = pathname.split('/')

  if (section === 'evaluation' && ['data', 'model', 'agent'].includes(type)) {
    return type
  }

  return 'data'
}

function roundToOne(value) {
  if (!Number.isFinite(value)) {
    return 0
  }

  return Number(value.toFixed(1))
}

function getScoreTagType(score) {
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

function formatChartDate(dateTime) {
  return dateTime ? dateTime.slice(5, 10) : '--'
}

function ModelMonthlyTrendTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null
  }

  const metaMap = industryTrendMeta.reduce((accumulator, item) => {
    accumulator[item.key] = item
    return accumulator
  }, {})

  const deduplicatedPayload = payload.reduce((accumulator, item) => {
    if (!metaMap[item.dataKey]) {
      return accumulator
    }

    accumulator.set(item.dataKey, item)
    return accumulator
  }, new Map())

  return (
    <div className="overview-tooltip">
      <div className="overview-tooltip__title">{label}</div>
      <div className="overview-tooltip__list">
        {Array.from(deduplicatedPayload.values()).map((item) => {
          const meta = metaMap[item.dataKey]

          return (
            <div key={item.dataKey} className="overview-tooltip__item">
              <span className="overview-tooltip__dot" style={{ backgroundColor: meta.color }} />
              <span className="overview-tooltip__label">{meta.label}</span>
              <span className="overview-tooltip__value">{item.value}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function buildOverviewData(type) {
  const schema = getEvaluationSchema(type)
  const tasks = getTasksByType(type)
    .map((task) => {
      const result = calculateEvaluationResult(type, task.scores)
      return {
        ...task,
        result,
      }
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const totalTasks = tasks.length
  const runningTasks = tasks.filter((task) => task.status === 'running').length
  const completedTasks = tasks.filter((task) => task.status === 'completed').length
  const averageScore = totalTasks
    ? roundToOne(tasks.reduce((sum, task) => sum + task.result.totalScore, 0) / totalTasks)
    : 0

  const trendData = [...tasks]
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((task) => ({
      name: formatChartDate(task.createdAt),
      totalScore: task.result.totalScore,
      progress: task.progress,
    }))

  const levelDistribution = schema.levels.map((level) => ({
    name: level,
    value: tasks.filter((task) => task.result.level === level).length,
    color: getLevelColor(level),
  }))

  const dimensionAverageScores = schema.dimensions.map((dimension) => {
    const relatedScores = tasks.map((task) => {
      const matched = task.result.dimensionScores.find(
        (item) => item.dimensionId === dimension.id,
      )
      return matched ? matched.score : 0
    })
    const score = relatedScores.length
      ? roundToOne(relatedScores.reduce((sum, item) => sum + item, 0) / relatedScores.length)
      : 0

    return {
      name: dimension.name,
      score,
    }
  })

  const highRiskIndicatorMap = {}

  tasks.forEach((task) => {
    task.result.riskItems.forEach((item) => {
      if (!highRiskIndicatorMap[item.indicatorId]) {
        highRiskIndicatorMap[item.indicatorId] = {
          indicatorId: item.indicatorId,
          indicatorName: item.indicatorName,
          dimensionName: item.dimensionName,
          riskCount: 0,
          scoreSum: 0,
        }
      }

      highRiskIndicatorMap[item.indicatorId].riskCount += 1
      highRiskIndicatorMap[item.indicatorId].scoreSum += item.rawScore
    })
  })

  const highRiskTop5 = Object.values(highRiskIndicatorMap)
    .map((item) => ({
      ...item,
      avgScore: roundToOne(item.scoreSum / item.riskCount),
    }))
    .sort((a, b) => b.riskCount - a.riskCount || a.avgScore - b.avgScore)
    .slice(0, 5)

  const recentTasks =
    type === 'model'
      ? [...tasks].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      : tasks.slice(0, 5)

  return {
    totalTasks,
    runningTasks,
    completedTasks,
    averageScore,
    trendData,
    levelDistribution,
    dimensionAverageScores,
    highRiskTop5,
    recentTasks,
  }
}

function EvaluationOverview() {
  const navigate = useNavigate()
  const location = useLocation()
  const type = getTypeFromPath(location.pathname)
  const overviewMeta = overviewMetaMap[type] || overviewMetaMap.data
  const overviewData = buildOverviewData(type)

  const taskColumns = [
    {
      title: '任务名称',
      dataIndex: 'name',
      key: 'name',
      width: 220,
    },
    {
      title: '所属单位',
      dataIndex: 'organizationName',
      key: 'organizationName',
      width: 220,
    },
    {
      title: '评估对象',
      dataIndex: 'targetName',
      key: 'targetName',
      width: 220,
    },
    {
      title: '所属行业',
      dataIndex: 'industry',
      key: 'industry',
      width: 110,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (value) => (
        <RiskTag type={getStatusColor(value)}>{getStatusText(value)}</RiskTag>
      ),
    },
    {
      title: '总分',
      dataIndex: ['result', 'totalScore'],
      key: 'totalScore',
      width: 100,
    },
    {
      title: '等级',
      dataIndex: ['result', 'level'],
      key: 'level',
      width: 150,
      render: (value, record) => (
        <RiskTag type={getScoreTagType(record.result.totalScore)}>{value}</RiskTag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
    },
    {
      title: '操作',
      key: 'action',
      width: 90,
      fixed: 'right',
      render: (_, record) => (
        <Space size={4}>
          <Button
            type="link"
            onClick={() => navigate(`/evaluation/${type}/report/${record.id}`)}
          >
            报告
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div className="page-shell">
      <Breadcrumb
        className="page-breadcrumb"
        items={[
          { title: '首页' },
          { title: getTypeText(type) },
          { title: '评估概览' },
        ]}
      />

      <PageTitle
        title={overviewMeta.title}
        subtitle={overviewMeta.subtitle}
        actions={[
          <Button
            key="create"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate(`/evaluation/${type}/create`)}
          >
            新建评估
          </Button>,
          <Button key="refresh" icon={<ReloadOutlined />} onClick={() => message.success('已刷新最新 mock 数据')}>
            刷新数据
          </Button>,
        ]}
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            title="总评估任务"
            value={overviewData.totalTasks}
            desc={`${getTypeText(type)}任务总数`}
            icon={<ClipboardList size={22} />}
            color="#1677ff"
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            title="进行中"
            value={overviewData.runningTasks}
            desc="当前执行中的任务数量"
            icon={<Activity size={22} />}
            color="#faad14"
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            title="已完成"
            value={overviewData.completedTasks}
            desc="已完成评估并产出结果"
            icon={<CheckCircle2 size={22} />}
            color="#52c41a"
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            title={overviewMeta.averageLabel}
            value={overviewData.averageScore}
            desc={getScoreStatus(overviewData.averageScore)}
            icon={<ShieldCheck size={22} />}
            color="#2f54eb"
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={type === 'model' ? 24 : 12}>
          <Card
            title={type === 'model' ? '近12个月模型评估任务数趋势分析' : '评估任务趋势'}
            className="overview-card"
            bordered={false}
          >
            <div className="overview-chart">
              <ResponsiveContainer width="100%" height="100%">
                {type === 'model' ? (
                  <ComposedChart
                    data={modelMonthlyTrendData}
                    margin={{ top: 16, right: 24, left: 8, bottom: 8 }}
                  >
                    <defs>
                      {industryTrendMeta.map((item) => (
                        <linearGradient key={item.key} id={`model-trend-shadow-${item.key}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={item.color} stopOpacity={0.18} />
                          <stop offset="95%" stopColor={item.color} stopOpacity={0.02} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid stroke="#edf2fa" vertical={false} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} />
                    <YAxis
                      domain={[0, 50]}
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={false}
                      ticks={[0, 10, 20, 30, 40, 50]}
                      label={{
                        value: '任务数',
                        angle: -90,
                        position: 'insideLeft',
                        style: { fill: '#667085', fontSize: 13, fontWeight: 600 },
                      }}
                    />
                    <Tooltip content={<ModelMonthlyTrendTooltip />} />
                    <Legend verticalAlign="bottom" height={36} />
                    {industryTrendMeta.map((item) => (
                      <Area
                        key={`${item.key}-shadow`}
                        type="monotone"
                        dataKey={item.key}
                        stroke="none"
                        fill={`url(#model-trend-shadow-${item.key})`}
                        isAnimationActive={false}
                        legendType="none"
                      />
                    ))}
                    {industryTrendMeta.map((item) => (
                      <Line
                        key={item.key}
                        type="monotone"
                        dataKey={item.key}
                        stroke={item.color}
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 5, strokeWidth: 2, fill: '#ffffff' }}
                        name={item.label}
                      />
                    ))}
                  </ComposedChart>
                ) : (
                  <LineChart data={overviewData.trendData}>
                    <CartesianGrid stroke="#edf2fa" vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} domain={[0, 100]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="totalScore"
                      stroke="#1677ff"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      name="总分"
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        <Col xs={24} xl={12}>
          <Card title="等级分布" className="overview-card" bordered={false}>
            <div className="overview-chart">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={overviewData.levelDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {overviewData.levelDistribution.map((item, index) => (
                      <Cell key={item.name} fill={item.color || pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="overview-legend">
              {overviewData.levelDistribution.map((item) => (
                <div key={item.name} className="overview-legend__item">
                  <span
                    className="overview-legend__dot"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="overview-legend__label">{item.name}</span>
                  <span className="overview-legend__value">{item.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        <Col xs={24} xl={12}>
          <Card title="维度平均得分" className="overview-card" bordered={false}>
            <div className="overview-chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overviewData.dimensionAverageScores} layout="vertical" margin={{ left: 30 }}>
                  <CartesianGrid stroke="#edf2fa" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tickLine={false} axisLine={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    width={180}
                  />
                  <Tooltip />
                  <Bar dataKey="score" fill="#1677ff" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        {type !== 'model' ? (
          <Col xs={24} xl={12}>
            <Card title="高风险指标 Top5" className="overview-card" bordered={false}>
              <div className="overview-risk-top">
                {overviewData.highRiskTop5.map((item, index) => (
                  <div key={item.indicatorId} className="overview-risk-top__item">
                    <div className="overview-risk-top__rank">{index + 1}</div>
                    <div className="overview-risk-top__main">
                      <div className="overview-risk-top__name">{item.indicatorName}</div>
                      <div className="overview-risk-top__meta">
                        <RiskTag type="default">{item.dimensionName}</RiskTag>
                        <RiskTag type="danger">风险出现 {item.riskCount} 次</RiskTag>
                        <RiskTag type="warning">平均评分 {item.avgScore}</RiskTag>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
        ) : null}
      </Row>

      <Card
        title="最近评估任务"
        className="overview-card"
        bordered={false}
        extra={
          <Button type="link" onClick={() => navigate(`/evaluation/${type}/tasks`)}>
            查看更多
          </Button>
        }
      >
        <Table
          rowKey="id"
          columns={taskColumns}
          dataSource={overviewData.recentTasks}
          pagination={false}
          scroll={{ x: 1400 }}
        />
      </Card>
    </div>
  )
}

export default EvaluationOverview
