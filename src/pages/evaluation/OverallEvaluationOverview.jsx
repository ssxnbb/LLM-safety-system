import { ReloadOutlined } from '@ant-design/icons'
import { Breadcrumb, Button, Card, Col, Row, Table, message } from 'antd'
import { Activity, BarChart3, Building2, CheckCircle2 } from 'lucide-react'
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
import { organizationCatalog } from '../../mock/organizationCatalog.js'
import { evaluationTasks } from '../../mock/evaluationTasks.js'
import { calculateEvaluationResult, getScoreStatus } from '../../utils/evaluationScore.js'
import './OverallEvaluationOverview.css'

const typeMetaMap = {
  data: { label: '数据集评估', color: '#1677ff' },
  model: { label: '模型评估', color: '#52c41a' },
  agent: { label: '智能体评估', color: '#fa8c16' },
}

const statusTextMap = {
  running: '进行中',
  completed: '已完成',
  canceled: '已取消',
  rectifying: '整改中',
}

const statusTagTypeMap = {
  running: 'processing',
  completed: 'success',
  canceled: 'default',
  rectifying: 'warning',
}

const pieColors = ['#1677ff', '#52c41a', '#faad14', '#fa8c16', '#ff4d4f']

function roundToOne(value) {
  if (!Number.isFinite(value)) {
    return 0
  }

  return Number(value.toFixed(1))
}

function formatDateLabel(dateTime) {
  return dateTime ? dateTime.slice(5, 10) : '--'
}

function buildOverallData() {
  const tasks = evaluationTasks
    .map((task) => {
      const result = calculateEvaluationResult(task.type, task.scores)

      return {
        ...task,
        result,
        isHighRisk: result.riskItems.length > 0 || result.totalScore < 60,
      }
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const totalTasks = tasks.length
  const completedTasks = tasks.filter((task) => task.status === 'completed').length
  const averageScore = totalTasks
    ? roundToOne(tasks.reduce((sum, task) => sum + task.result.totalScore, 0) / totalTasks)
    : 0
  const participatingOrganizations = new Set(tasks.map((task) => task.organizationName)).size

  const taskTrendMap = tasks.reduce((accumulator, task) => {
    const key = formatDateLabel(task.createdAt)

    if (!accumulator[key]) {
      accumulator[key] = {
        date: key,
        total: 0,
        data: 0,
        model: 0,
        agent: 0,
      }
    }

    accumulator[key].total += 1
    accumulator[key][task.type] += 1
    return accumulator
  }, {})

  const trendData = Object.values(taskTrendMap).sort((a, b) => a.date.localeCompare(b.date))

  const typeDistribution = Object.entries(typeMetaMap).map(([type, meta]) => {
    const relatedTasks = tasks.filter((task) => task.type === type)
    const average = relatedTasks.length
      ? roundToOne(relatedTasks.reduce((sum, task) => sum + task.result.totalScore, 0) / relatedTasks.length)
      : 0

    return {
      type,
      name: meta.label,
      value: relatedTasks.length,
      averageScore: average,
      color: meta.color,
    }
  })

  const statusDistribution = Object.entries(statusTextMap).map(([status, label]) => ({
    name: label,
    value: tasks.filter((task) => task.status === status).length,
  }))

  const domainDistribution = organizationCatalog.reduce((accumulator, item) => {
    const matchedTasks = tasks.filter((task) => task.organizationName === item.organizationName)

    if (!matchedTasks.length) {
      return accumulator
    }

    const current = accumulator[item.domain] || { name: item.domain, value: 0, organizations: 0 }
    current.value += matchedTasks.length
    current.organizations += 1
    accumulator[item.domain] = current
    return accumulator
  }, {})

  const domainParticipation = Object.values(domainDistribution).sort((a, b) => b.value - a.value)

  const organizationTaskMap = tasks.reduce((accumulator, task) => {
    if (!accumulator[task.organizationName]) {
      accumulator[task.organizationName] = {
        taskCount: 0,
        completedCount: 0,
        highRiskCount: 0,
        modules: new Set(),
      }
    }

    const current = accumulator[task.organizationName]
    current.taskCount += 1
    current.modules.add(typeMetaMap[task.type].label)

    if (task.status === 'completed') {
      current.completedCount += 1
    }

    if (task.isHighRisk) {
      current.highRiskCount += 1
    }

    return accumulator
  }, {})

  const organizationParticipation = organizationCatalog.map((item) => {
    const taskStats = organizationTaskMap[item.organizationName]

    return {
      key: item.organizationName,
      domain: item.domain,
      organizationName: item.organizationName,
      modelName: item.modelName,
      capability: item.capability,
      parameterScale: item.parameterScale,
      taskCount: taskStats?.taskCount || 0,
      completedCount: taskStats?.completedCount || 0,
      highRiskCount: taskStats?.highRiskCount || 0,
      modulesText: taskStats ? Array.from(taskStats.modules).join('、') : '--',
    }
  })

  const recentTasks = tasks.slice(0, 8)

  return {
    totalTasks,
    completedTasks,
    averageScore,
    participatingOrganizations,
    trendData,
    typeDistribution,
    statusDistribution,
    domainParticipation,
    organizationParticipation,
    recentTasks,
  }
}

function OverallEvaluationOverview() {
  const overviewData = buildOverallData()

  const taskColumns = [
    {
      title: '模块',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (value) => <RiskTag type="processing">{typeMetaMap[value]?.label || value}</RiskTag>,
    },
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
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (value) => <RiskTag type={statusTagTypeMap[value]}>{statusTextMap[value]}</RiskTag>,
    },
    {
      title: '总分',
      dataIndex: ['result', 'totalScore'],
      key: 'totalScore',
      width: 100,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
    },
  ]

  const organizationColumns = [
    {
      title: '领域',
      dataIndex: 'domain',
      key: 'domain',
      width: 100,
    },
    {
      title: '单位',
      dataIndex: 'organizationName',
      key: 'organizationName',
      width: 220,
    },
    {
      title: '关联模型',
      dataIndex: 'modelName',
      key: 'modelName',
      width: 180,
    },
    {
      title: '功能',
      dataIndex: 'capability',
      key: 'capability',
      width: 220,
    },
    {
      title: '参数',
      dataIndex: 'parameterScale',
      key: 'parameterScale',
      width: 90,
    },
    {
      title: '参与任务数',
      dataIndex: 'taskCount',
      key: 'taskCount',
      width: 110,
    },
    {
      title: '已完成',
      dataIndex: 'completedCount',
      key: 'completedCount',
      width: 90,
    },
    {
      title: '高风险',
      dataIndex: 'highRiskCount',
      key: 'highRiskCount',
      width: 90,
      render: (value) => <span className={value > 0 ? 'overall-overview__danger' : ''}>{value}</span>,
    },
    {
      title: '覆盖模块',
      dataIndex: 'modulesText',
      key: 'modulesText',
      width: 220,
    },
  ]

  return (
    <div className="page-shell">
      <Breadcrumb
        className="page-breadcrumb"
        items={[{ title: '首页' }, { title: '总体评估概览' }]}
      />

      <PageTitle
        title="总体评估概览"
        subtitle="集中展示数据集、模型、智能体三类评估任务的整体态势，以及各领域单位与集团的参与情况。"
        actions={[
          <Button
            key="refresh"
            icon={<ReloadOutlined />}
            onClick={() => message.success('已刷新总体评估 mock 数据')}
          >
            刷新数据
          </Button>,
        ]}
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            title="总评估任务"
            value={overviewData.totalTasks}
            desc="三类评估任务汇总"
            icon={<BarChart3 size={22} />}
            color="#1677ff"
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            title="参与单位"
            value={overviewData.participatingOrganizations}
            desc="来自单位与集团的参与覆盖"
            icon={<Building2 size={22} />}
            color="#2f54eb"
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            title="已完成"
            value={overviewData.completedTasks}
            desc="已形成正式评估结果"
            icon={<CheckCircle2 size={22} />}
            color="#52c41a"
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            title="综合平均分"
            value={overviewData.averageScore}
            desc={getScoreStatus(overviewData.averageScore)}
            icon={<Activity size={22} />}
            color="#fa8c16"
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={12}>
          <Card title="评估任务趋势" className="overall-overview-card" bordered={false}>
            <div className="overall-overview-chart">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={overviewData.trendData}>
                  <CartesianGrid stroke="#edf2fa" vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="total" stroke="#1677ff" strokeWidth={3} name="任务数" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        <Col xs={24} xl={12}>
          <Card title="任务状态分布" className="overall-overview-card" bordered={false}>
            <div className="overall-overview-chart">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={overviewData.statusDistribution}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={62}
                    outerRadius={96}
                    paddingAngle={3}
                  >
                    {overviewData.statusDistribution.map((item, index) => (
                      <Cell key={item.name} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="overall-overview-legend">
              {overviewData.statusDistribution.map((item, index) => (
                <div key={item.name} className="overall-overview-legend__item">
                  <span
                    className="overall-overview-legend__dot"
                    style={{ background: pieColors[index % pieColors.length] }}
                  />
                  <span className="overall-overview-legend__label">{item.name}</span>
                  <span className="overall-overview-legend__value">{item.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        <Col xs={24} xl={12}>
          <Card title="三类评估任务分布" className="overall-overview-card" bordered={false}>
            <div className="overall-overview-chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overviewData.typeDistribution}>
                  <CartesianGrid stroke="#edf2fa" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {overviewData.typeDistribution.map((item) => (
                      <Cell key={item.type} fill={item.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        <Col xs={24} xl={12}>
          <Card title="单位领域参与情况" className="overall-overview-card" bordered={false}>
            <div className="overall-overview-chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overviewData.domainParticipation}>
                  <CartesianGrid stroke="#edf2fa" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#2f54eb" radius={[8, 8, 0, 0]} name="任务数" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      <Card title="单位与集团参与情况" className="overall-overview-card" bordered={false}>
        <Table
          rowKey="organizationName"
          columns={organizationColumns}
          dataSource={overviewData.organizationParticipation}
          pagination={false}
          scroll={{ x: 1500 }}
        />
      </Card>

      <Card title="近期评估任务" className="overall-overview-card" bordered={false}>
        <Table
          rowKey="id"
          columns={taskColumns}
          dataSource={overviewData.recentTasks}
          pagination={false}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  )
}

export default OverallEvaluationOverview


