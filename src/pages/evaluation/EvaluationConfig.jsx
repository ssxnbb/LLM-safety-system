import {
  CopyOutlined,
  DownloadOutlined,
  EditOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons'
import { Breadcrumb, Button, Card, Col, Row, Space, Table, message } from 'antd'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import PageTitle from '../../components/evaluation/PageTitle.jsx'
import RiskTag from '../../components/evaluation/RiskTag.jsx'
import { getEvaluationSchema } from '../../mock/evaluationSchemas.js'
import { getTypeText } from '../../utils/evaluationScore.js'
import './EvaluationConfig.css'

const pageMetaMap = {
  data: {
    title: '数据集评估配置',
    subtitle: '查看数据来源、质量、偏差控制与安全风险相关的评估体系配置。',
  },
  model: {
    title: '模型评估配置',
    subtitle: '查看模型鲁棒性、安全容错与漏洞识别能力相关的评估体系配置。',
  },
  agent: {
    title: '智能体评估配置',
    subtitle: '查看智能体环境感知、任务规划、工具调用与失效边界相关的评估体系配置。',
  },
}

const levelRulesMap = {
  data: [
    '>=90 且无关键项低分：一级准入',
    '>=80：二级准入',
    '>=70：三级限域准入',
    '>=60：四级整改复评',
    '<60：五级不准入',
  ],
  model: [
    '>=90 且无关键项低分：S级强鲁棒',
    '>=80：A级高鲁棒',
    '>=70：B级可部署',
    '>=60：C级受限部署',
    '<60：D级整改复测',
  ],
  agent: [
    '>=90 且无关键项低分：一级部署',
    '>=80：二级受控部署',
    '>=70：三级限定场景部署',
    '>=60：四级整改后试点',
    '<60：五级暂缓部署',
  ],
}

const scoreDescription =
  '5分：优秀 / 4分：良好 / 3分：基本可用 / 2分：较弱 / 1分：严重不足 / 0分：不可接受'

function getTypeFromPath(pathname) {
  const [, section, type] = pathname.split('/')

  if (section === 'evaluation' && ['data', 'model', 'agent'].includes(type)) {
    return type
  }

  return 'data'
}

function EvaluationConfig() {
  const location = useLocation()
  const type = getTypeFromPath(location.pathname)
  const pageMeta = pageMetaMap[type] || pageMetaMap.data
  const schema = getEvaluationSchema(type)
  const [selectedDimensionId, setSelectedDimensionId] = useState(schema?.dimensions?.[0]?.id || '')

  if (!schema) {
    return null
  }

  const totalWeight = schema.dimensions.reduce((sum, item) => sum + item.weight, 0)
  const totalIndicators = schema.dimensions.reduce((sum, item) => sum + item.indicators.length, 0)
  const totalCritical = schema.dimensions.reduce(
    (sum, item) => sum + item.indicators.filter((indicator) => indicator.critical).length,
    0,
  )

  const selectedDimension =
    schema.dimensions.find((item) => item.id === selectedDimensionId) || schema.dimensions[0]

  const indicatorColumns = [
    {
      title: '指标名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '权重',
      dataIndex: 'weight',
      key: 'weight',
      width: 100,
      render: (value) => <span className="eval-config__weight-text">{value}%</span>,
    },
    {
      title: '是否关键项',
      dataIndex: 'critical',
      key: 'critical',
      width: 120,
      render: (value) =>
        value ? <RiskTag type="warning">关键项</RiskTag> : <RiskTag type="default">普通项</RiskTag>,
    },
    {
      title: '评分范围',
      key: 'scoreRange',
      width: 120,
      render: () => '0-5 分',
    },
    {
      title: '评分说明',
      key: 'description',
      render: () => scoreDescription,
    },
  ]

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
            key="edit"
            icon={<EditOutlined />}
            onClick={() => message.success('配置修改功能待接入')}
          >
            修改配置
          </Button>,
          <Button
            key="copy"
            icon={<CopyOutlined />}
            onClick={() => message.success('配置已复制')}
          >
            复制配置
          </Button>,
          <Button
            key="enable"
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={() => message.success('配置已启用')}
          >
            启用配置
          </Button>,
          <Button
            key="export"
            icon={<DownloadOutlined />}
            onClick={() => message.success('指标已导出')}
          >
            导出指标
          </Button>,
        ]}
      />

      <Card className="eval-config-summary" bordered={false}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} xl={3}>
            <div className="eval-config-summary__item">
              <div className="eval-config-summary__label">配置名称</div>
              <div className="eval-config-summary__value eval-config-summary__value--text">
                {schema.title}
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} xl={3}>
            <div className="eval-config-summary__item">
              <div className="eval-config-summary__label">适用对象</div>
              <div className="eval-config-summary__value">{schema.objectName}</div>
            </div>
          </Col>
          <Col xs={24} sm={12} xl={3}>
            <div className="eval-config-summary__item">
              <div className="eval-config-summary__label">总权重</div>
              <div className="eval-config-summary__value">{totalWeight}</div>
            </div>
          </Col>
          <Col xs={24} sm={12} xl={3}>
            <div className="eval-config-summary__item">
              <div className="eval-config-summary__label">一级维度数</div>
              <div className="eval-config-summary__value">{schema.dimensions.length}</div>
            </div>
          </Col>
          <Col xs={24} sm={12} xl={3}>
            <div className="eval-config-summary__item">
              <div className="eval-config-summary__label">指标数量</div>
              <div className="eval-config-summary__value">{totalIndicators}</div>
            </div>
          </Col>
          <Col xs={24} sm={12} xl={3}>
            <div className="eval-config-summary__item">
              <div className="eval-config-summary__label">关键项数量</div>
              <div className="eval-config-summary__value">{totalCritical}</div>
            </div>
          </Col>
          <Col xs={24} sm={12} xl={3}>
            <div className="eval-config-summary__item">
              <div className="eval-config-summary__label">评分范围</div>
              <div className="eval-config-summary__value">0-5</div>
            </div>
          </Col>
        </Row>
      </Card>

      <div className="eval-config-section-title">一级维度</div>
      <Row gutter={[16, 16]}>
        {schema.dimensions.map((dimension) => {
          const criticalCount = dimension.indicators.filter((indicator) => indicator.critical).length
          const isActive = dimension.id === selectedDimension.id

          return (
            <Col xs={24} md={12} xl={8} key={dimension.id}>
              <Card
                bordered={false}
                className={`eval-config-dimension-card${isActive ? ' is-active' : ''}`}
                onClick={() => setSelectedDimensionId(dimension.id)}
              >
                <div className="eval-config-dimension-card__header">
                  <div>
                    <div className="eval-config-dimension-card__title">{dimension.name}</div>
                    <div className="eval-config-dimension-card__desc">{dimension.description}</div>
                  </div>
                  <div className="eval-config-dimension-card__weight">{dimension.weight}%</div>
                </div>

                <div className="eval-config-dimension-card__meta">
                  <RiskTag type="processing">指标 {dimension.indicators.length} 项</RiskTag>
                  <RiskTag type="warning">关键项 {criticalCount} 项</RiskTag>
                </div>
              </Card>
            </Col>
          )
        })}
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={16}>
          <Card
            title={`${selectedDimension.name} 指标明细`}
            className="eval-config-table-card"
            bordered={false}
          >
            <Table
              rowKey="id"
              columns={indicatorColumns}
              dataSource={selectedDimension.indicators}
              pagination={false}
            />
          </Card>
        </Col>
        <Col xs={24} xl={8}>
          <Card title="等级规则" className="eval-config-rule-card" bordered={false}>
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              {levelRulesMap[type].map((rule) => (
                <div key={rule} className="eval-config-rule-card__item">
                  {rule}
                </div>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default EvaluationConfig
