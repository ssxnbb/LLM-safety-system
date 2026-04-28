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
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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

  const recentTasks = tasks.slice(0, 5)

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
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size={4}>
          <Button type="link" onClick={() => navigate(`/evaluation/${type}/tasks`)}>
            详情
          </Button>
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
        <Col xs={24} xl={12}>
          <Card title="评估任务趋势" className="overview-card" bordered={false}>
            <div className="overview-chart">
              <ResponsiveContainer width="100%" height="100%">
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
                    width={110}
                  />
                  <Tooltip />
                  <Bar dataKey="score" fill="#1677ff" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

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
          scroll={{ x: 1180 }}
        />
      </Card>
    </div>
  )
}

export default EvaluationOverview
