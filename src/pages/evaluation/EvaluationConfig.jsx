import {
  CopyOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import {
  Breadcrumb,
  Button,
  Card,
  Checkbox,
  Col,
  Drawer,
  Empty,
  Input,
  InputNumber,
  Popconfirm,
  Row,
  Select,
  Space,
  Switch,
  Table,
  message,
} from 'antd'
import { useState, useSyncExternalStore } from 'react'
import { useLocation } from 'react-router-dom'
import PageTitle from '../../components/evaluation/PageTitle.jsx'
import RiskTag from '../../components/evaluation/RiskTag.jsx'
import {
  countSelectedCriticalIndicators,
  countSelectedDimensions,
  countSelectedIndicators,
  createEvaluationConfigFromSchema,
  createEvaluationConfigId,
  getAllEvaluationConfigs,
  getFirstSelectedDimensionId,
  getSelectedDimensionWeightTotal,
  getSelectedDimensions,
  getSelectedIndicators,
  removeEvaluationConfig,
  securityModelOptions,
  subscribeEvaluationConfigs,
  upsertEvaluationConfig,
} from '../../mock/evaluationConfigs.js'
import { getEvaluationSchema } from '../../mock/evaluationSchemas.js'
import { getTypeText } from '../../utils/evaluationScore.js'
import './EvaluationConfig.css'

const pageMetaMap = {
  data: {
    title: '数据集评估配置',
    subtitle: '查看并管理数据来源、质量、偏差控制与安全风险相关的评估配置。',
  },
  model: {
    title: '模型评估配置',
    subtitle: '查看并管理模型鲁棒性、安全容错与漏洞识别能力相关的评估配置。',
  },
  agent: {
    title: '智能体评估配置',
    subtitle: '查看并管理智能体环境感知、任务规划、工具调用与失效边界相关的评估配置。',
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

function createNewConfigName(type, configs) {
  const baseTitle = getEvaluationSchema(type)?.title || '评估配置'
  let nextName = `${baseTitle}-新配置`
  let index = 2

  while (configs.some((config) => config.type === type && config.name === nextName)) {
    nextName = `${baseTitle}-新配置${index}`
    index += 1
  }

  return nextName
}

function createCopiedConfigName(sourceName, configs, type) {
  let nextName = `${sourceName}-副本`
  let index = 2

  while (configs.some((config) => config.type === type && config.name === nextName)) {
    nextName = `${sourceName}-副本${index}`
    index += 1
  }

  return nextName
}

function validateDraftConfig(draftConfig, configs) {
  const isSameWeight = (left, right) => Math.abs(left - right) < 0.0001

  if (!draftConfig.name?.trim()) {
    return '请输入配置名称'
  }

  if (
    configs.some(
      (config) =>
        config.type === draftConfig.type &&
        config.name === draftConfig.name.trim() &&
        config.id !== draftConfig.id,
    )
  ) {
    return '当前模块下已存在同名配置'
  }

  const selectedDimensions = getSelectedDimensions(draftConfig)

  if (selectedDimensions.length === 0) {
    return '至少选择一个一级维度'
  }

  let totalDimensionWeight = 0

  for (const dimension of selectedDimensions) {
    const dimensionWeight = Number(dimension.weight || 0)

    if (!(dimensionWeight > 0)) {
      return `请为“${dimension.name}”设置大于 0 的维度权重`
    }

    totalDimensionWeight += dimensionWeight

    const selectedIndicators = getSelectedIndicators(dimension)

    if (selectedIndicators.length === 0) {
      return `“${dimension.name}”至少选择一个评估指标`
    }

    let indicatorWeightTotal = 0

    for (const indicator of selectedIndicators) {
      const indicatorWeight = Number(indicator.weight || 0)

      if (!(indicatorWeight > 0)) {
        return `请为“${indicator.name}”设置大于 0 的指标权重`
      }

      indicatorWeightTotal += indicatorWeight
    }

    if (!isSameWeight(indicatorWeightTotal, dimensionWeight)) {
      return `“${dimension.name}”下已选指标权重之和必须等于维度权重 ${dimensionWeight}`
    }
  }

  if (!isSameWeight(totalDimensionWeight, 100)) {
    return '已选一级维度权重之和必须等于 100'
  }

  if (draftConfig.securityModelEnabled && !draftConfig.securityModel) {
    return '请选择安全大模型'
  }

  return ''
}

function EvaluationConfig() {
  const location = useLocation()
  const type = getTypeFromPath(location.pathname)
  const pageMeta = pageMetaMap[type] || pageMetaMap.data
  const allConfigs = useSyncExternalStore(
    subscribeEvaluationConfigs,
    getAllEvaluationConfigs,
    getAllEvaluationConfigs,
  )
  const configs = allConfigs.filter((config) => config.type === type)
  const [selectedConfigId, setSelectedConfigId] = useState('')
  const [selectedDimensionId, setSelectedDimensionId] = useState('')
  const [editorMode, setEditorMode] = useState('create')
  const [editorOpen, setEditorOpen] = useState(false)
  const [draftConfig, setDraftConfig] = useState(null)

  const resolvedConfigId = configs.some((config) => config.id === selectedConfigId)
    ? selectedConfigId
    : configs[0]?.id || ''
  const currentConfig = configs.find((config) => config.id === resolvedConfigId) || null
  const selectedDimensions = getSelectedDimensions(currentConfig)
  const resolvedDimensionId = selectedDimensions.some((dimension) => dimension.id === selectedDimensionId)
    ? selectedDimensionId
    : selectedDimensions[0]?.id || ''
  const selectedDimension =
    selectedDimensions.find((dimension) => dimension.id === resolvedDimensionId) || null

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

  const openCreateEditor = () => {
    const schema = getEvaluationSchema(type)

    if (!schema) {
      return
    }

    const nextDraft = createEvaluationConfigFromSchema(type, {
      id: createEvaluationConfigId(type),
      name: createNewConfigName(type, configs),
      isDefault: false,
      securityModelEnabled: false,
      securityModel: '',
      dimensions: schema.dimensions.map((dimension) => ({
        id: dimension.id,
        selected: false,
        weight: 0,
        indicators: dimension.indicators.map((indicator) => ({
          id: indicator.id,
          selected: false,
          weight: 0,
        })),
      })),
    })

    setEditorMode('create')
    setDraftConfig(nextDraft)
    setEditorOpen(true)
  }

  const openEditEditor = (config = currentConfig) => {
    if (!config) {
      return
    }

    setEditorMode('edit')
    setDraftConfig(JSON.parse(JSON.stringify(config)))
    setEditorOpen(true)
  }

  const handleCopyConfig = () => {
    if (!currentConfig) {
      return
    }

    const copiedConfig = {
      ...JSON.parse(JSON.stringify(currentConfig)),
      id: createEvaluationConfigId(type),
      name: createCopiedConfigName(currentConfig.name, configs, type),
      isDefault: false,
      createdAt: undefined,
      updatedAt: undefined,
    }

    const savedConfig = upsertEvaluationConfig(copiedConfig)

    if (savedConfig) {
      setSelectedConfigId(savedConfig.id)
      setSelectedDimensionId(getFirstSelectedDimensionId(savedConfig))
      message.success('配置已复制')
    }
  }

  const handleDeleteConfig = (configId) => {
    if (configs.length <= 1) {
      message.warning('至少保留一个配置')
      return
    }

    const nextConfigs = removeEvaluationConfig(configId)
    const nextSelectedId = configId === resolvedConfigId ? nextConfigs[0]?.id || '' : resolvedConfigId
    const nextSelectedConfig = nextConfigs.find((config) => config.id === nextSelectedId)

    setSelectedConfigId(nextSelectedId)
    setSelectedDimensionId(getFirstSelectedDimensionId(nextSelectedConfig))
    message.success('配置已删除')
  }

  const handleSaveConfig = () => {
    if (!draftConfig) {
      return
    }

    const errorMessage = validateDraftConfig(draftConfig, configs)

    if (errorMessage) {
      message.error(errorMessage)
      return
    }

    const savedConfig = upsertEvaluationConfig({
      ...draftConfig,
      name: draftConfig.name.trim(),
    })

    if (!savedConfig) {
      message.error('配置保存失败，请重试')
      return
    }

    setSelectedConfigId(savedConfig.id)
    setSelectedDimensionId(getFirstSelectedDimensionId(savedConfig))
    setEditorOpen(false)
    setDraftConfig(null)
    message.success(editorMode === 'create' ? '配置已创建' : '配置已更新')
  }

  const updateDraftDimension = (dimensionId, updater) => {
    setDraftConfig((current) => ({
      ...current,
      dimensions: current.dimensions.map((dimension) =>
        dimension.id === dimensionId ? updater(dimension) : dimension,
      ),
    }))
  }

  const handleToggleDimension = (dimensionId, checked) => {
    updateDraftDimension(dimensionId, (dimension) => {
      const nextIndicators = checked
        ? dimension.indicators.some((indicator) => indicator.selected)
          ? dimension.indicators.map((indicator) => ({
              ...indicator,
              weight: indicator.selected ? indicator.weight || 1 : 0,
            }))
          : dimension.indicators.map((indicator, index) => ({
              ...indicator,
              selected: index === 0,
              weight: index === 0 ? indicator.weight || 1 : 0,
            }))
        : dimension.indicators.map((indicator) => ({
            ...indicator,
            selected: false,
            weight: 0,
          }))

      return {
        ...dimension,
        selected: checked,
        indicators: nextIndicators,
      }
    })
  }

  const handleDimensionWeightChange = (dimensionId, value) => {
    updateDraftDimension(dimensionId, (dimension) => ({
      ...dimension,
      weight: value || 0,
    }))
  }

  const handleToggleIndicator = (dimensionId, indicatorId, checked) => {
    updateDraftDimension(dimensionId, (dimension) => ({
      ...dimension,
      indicators: dimension.indicators.map((indicator) =>
        indicator.id === indicatorId
          ? {
              ...indicator,
              selected: checked,
              weight: checked ? indicator.weight || 1 : 0,
            }
          : indicator,
      ),
    }))
  }

  const handleIndicatorWeightChange = (dimensionId, indicatorId, value) => {
    updateDraftDimension(dimensionId, (dimension) => ({
      ...dimension,
      indicators: dimension.indicators.map((indicator) =>
        indicator.id === indicatorId ? { ...indicator, weight: value || 0 } : indicator,
      ),
    }))
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
            key="edit"
            icon={<EditOutlined />}
            onClick={() => openEditEditor()}
            disabled={!currentConfig}
          >
            修改配置
          </Button>,
          <Button
            key="copy"
            icon={<CopyOutlined />}
            onClick={handleCopyConfig}
            disabled={!currentConfig}
          >
            复制配置
          </Button>,
          <Button key="create" type="primary" icon={<PlusOutlined />} onClick={openCreateEditor}>
            新建配置
          </Button>,
          <Button
            key="export"
            icon={<DownloadOutlined />}
            onClick={() => message.success('指标导出功能待接入')}
            disabled={!currentConfig}
          >
            导出指标
          </Button>,
        ]}
      />

      <Card className="eval-config-list-card" bordered={false}>
        <div className="eval-config-list-card__title">当前存在的配置</div>
        {configs.length ? (
          <div className="eval-config-existing-grid">
            {configs.map((config) => {
              const isActive = config.id === resolvedConfigId

              return (
                <div
                  key={config.id}
                  className={`eval-config-existing-card${isActive ? ' is-active' : ''}`}
                  onClick={() => {
                    setSelectedConfigId(config.id)
                    setSelectedDimensionId(getFirstSelectedDimensionId(config))
                  }}
                >
                  <div className="eval-config-existing-card__header">
                    <div>
                      <div className="eval-config-existing-card__title">{config.name}</div>
                      <div className="eval-config-existing-card__time">
                        {config.updatedAt === '系统内置'
                          ? '系统内置配置'
                          : `更新时间：${config.updatedAt}`}
                      </div>
                    </div>
                    {config.isDefault ? <RiskTag type="default">内置</RiskTag> : null}
                  </div>

                  <div className="eval-config-existing-card__meta">
                    <RiskTag type="processing">维度 {countSelectedDimensions(config)} 个</RiskTag>
                    <RiskTag type="success">指标 {countSelectedIndicators(config)} 项</RiskTag>
                    <RiskTag type={config.securityModelEnabled ? 'warning' : 'default'}>
                      {config.securityModelEnabled ? config.securityModel : '未接入安全大模型'}
                    </RiskTag>
                  </div>

                  <div className="eval-config-existing-card__actions">
                    <Button
                      type="text"
                      size="small"
                      onClick={(event) => {
                        event.stopPropagation()
                        setSelectedConfigId(config.id)
                        setSelectedDimensionId(getFirstSelectedDimensionId(config))
                        openEditEditor(config)
                      }}
                    >
                      修改
                    </Button>
                    <Popconfirm
                      title="确认删除该配置吗？"
                      okText="删除"
                      cancelText="取消"
                      onConfirm={(event) => {
                        event?.stopPropagation?.()
                        handleDeleteConfig(config.id)
                      }}
                    >
                      <Button
                        type="text"
                        size="small"
                        danger
                        disabled={configs.length <= 1}
                        icon={<DeleteOutlined />}
                        onClick={(event) => event.stopPropagation()}
                      >
                        删除
                      </Button>
                    </Popconfirm>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <Empty description="当前暂无配置" />
        )}
      </Card>

      {currentConfig ? (
        <>
          <Card className="eval-config-summary" bordered={false}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} xl={4}>
                <div className="eval-config-summary__item">
                  <div className="eval-config-summary__label">配置名称</div>
                  <div className="eval-config-summary__value eval-config-summary__value--text">
                    {currentConfig.name}
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={12} xl={4}>
                <div className="eval-config-summary__item">
                  <div className="eval-config-summary__label">适用对象</div>
                  <div className="eval-config-summary__value">{currentConfig.objectName}</div>
                </div>
              </Col>
              <Col xs={24} sm={12} xl={4}>
                <div className="eval-config-summary__item">
                  <div className="eval-config-summary__label">总权重</div>
                  <div className="eval-config-summary__value">
                    {getSelectedDimensionWeightTotal(currentConfig)}
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={12} xl={4}>
                <div className="eval-config-summary__item">
                  <div className="eval-config-summary__label">一级维度数</div>
                  <div className="eval-config-summary__value">{countSelectedDimensions(currentConfig)}</div>
                </div>
              </Col>
              <Col xs={24} sm={12} xl={4}>
                <div className="eval-config-summary__item">
                  <div className="eval-config-summary__label">指标数量</div>
                  <div className="eval-config-summary__value">{countSelectedIndicators(currentConfig)}</div>
                </div>
              </Col>
              <Col xs={24} sm={12} xl={4}>
                <div className="eval-config-summary__item">
                  <div className="eval-config-summary__label">关键项数量</div>
                  <div className="eval-config-summary__value">
                    {countSelectedCriticalIndicators(currentConfig)}
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={12} xl={4}>
                <div className="eval-config-summary__item">
                  <div className="eval-config-summary__label">评分范围</div>
                  <div className="eval-config-summary__value">0-5</div>
                </div>
              </Col>
              <Col xs={24} sm={12} xl={8}>
                <div className="eval-config-summary__item">
                  <div className="eval-config-summary__label">安全大模型检测</div>
                  <div className="eval-config-summary__value eval-config-summary__value--text">
                    {currentConfig.securityModelEnabled
                      ? `已接入 ${currentConfig.securityModel}`
                      : '未接入安全大模型检测'}
                  </div>
                </div>
              </Col>
            </Row>
          </Card>

          <div className="eval-config-section-title">一级维度</div>
          <Row gutter={[16, 16]}>
            {selectedDimensions.map((dimension) => {
              const criticalCount = getSelectedIndicators(dimension).filter((item) => item.critical).length
              const isActive = dimension.id === resolvedDimensionId

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
                      <RiskTag type="processing">
                        指标 {getSelectedIndicators(dimension).length} 项
                      </RiskTag>
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
                title={selectedDimension ? `${selectedDimension.name} 指标明细` : '指标明细'}
                className="eval-config-table-card"
                bordered={false}
              >
                <Table
                  rowKey="id"
                  columns={indicatorColumns}
                  dataSource={selectedDimension ? getSelectedIndicators(selectedDimension) : []}
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
        </>
      ) : null}

      <Drawer
        title={editorMode === 'create' ? '新建配置' : '修改配置'}
        width={920}
        open={editorOpen}
        onClose={() => {
          setEditorOpen(false)
          setDraftConfig(null)
        }}
        destroyOnClose
        className="eval-config-editor-drawer"
      >
        {draftConfig ? (
          <div className="eval-config-editor">
            <Card className="eval-config-editor__basic" bordered={false}>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <div className="eval-config-editor__field-label">配置名称</div>
                  <Input
                    value={draftConfig.name}
                    placeholder="请输入配置名称"
                    onChange={(event) =>
                      setDraftConfig((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                  />
                </Col>
                <Col xs={24} md={12}>
                  <div className="eval-config-editor__field-label">接入安全大模型检测</div>
                  <div className="eval-config-editor__switch-row">
                    <span className="eval-config-editor__switch-text">是否启用安全大模型检测</span>
                    <Switch
                      checked={draftConfig.securityModelEnabled}
                      onChange={(checked) =>
                        setDraftConfig((current) => ({
                          ...current,
                          securityModelEnabled: checked,
                          securityModel: checked ? current.securityModel : '',
                        }))
                      }
                    />
                  </div>
                  {draftConfig.securityModelEnabled ? (
                    <Select
                      className="eval-config-editor__model-select"
                      placeholder="请选择安全大模型"
                      value={draftConfig.securityModel || undefined}
                      options={securityModelOptions.map((item) => ({ label: item, value: item }))}
                      onChange={(value) =>
                        setDraftConfig((current) => ({
                          ...current,
                          securityModel: value,
                        }))
                      }
                    />
                  ) : null}
                </Col>
              </Row>

              <div className="eval-config-editor__summary">
                <RiskTag type="processing">已选维度 {countSelectedDimensions(draftConfig)} 个</RiskTag>
                <RiskTag type="success">已选指标 {countSelectedIndicators(draftConfig)} 项</RiskTag>
                <RiskTag type="warning">
                  当前维度总权重 {getSelectedDimensionWeightTotal(draftConfig)}
                </RiskTag>
              </div>
            </Card>

            <div className="eval-config-section-title">配置维度与指标</div>
            <div className="eval-config-editor__dimension-grid">
              {draftConfig.dimensions.map((dimension) => {
                const selectedIndicators = getSelectedIndicators(dimension)

                return (
                  <Card
                    key={dimension.id}
                    bordered={false}
                    className={`eval-config-editor__dimension-card${dimension.selected ? ' is-selected' : ' is-disabled'}`}
                  >
                    <div className="eval-config-editor__dimension-header">
                      <Checkbox
                        checked={dimension.selected}
                        onChange={(event) => handleToggleDimension(dimension.id, event.target.checked)}
                      >
                        <span className="eval-config-editor__dimension-title">{dimension.name}</span>
                      </Checkbox>
                      <div className="eval-config-editor__weight-box">
                        <InputNumber
                          min={1}
                          controls={false}
                          value={dimension.weight}
                          disabled={!dimension.selected}
                          onChange={(value) => handleDimensionWeightChange(dimension.id, value)}
                        />
                        <span className="eval-config-editor__weight-unit">%</span>
                      </div>
                    </div>

                    <div className="eval-config-editor__dimension-desc">{dimension.description}</div>

                    <div className="eval-config-editor__dimension-meta">
                      <RiskTag type="processing">指标 {selectedIndicators.length} 项</RiskTag>
                      <RiskTag type="warning">
                        关键项 {selectedIndicators.filter((item) => item.critical).length} 项
                      </RiskTag>
                    </div>

                    <div className="eval-config-editor__indicator-list">
                      {dimension.indicators.map((indicator) => (
                        <div key={indicator.id} className="eval-config-editor__indicator-row">
                          <div className="eval-config-editor__indicator-main">
                            <Checkbox
                              checked={indicator.selected}
                              disabled={!dimension.selected}
                              onChange={(event) =>
                                handleToggleIndicator(dimension.id, indicator.id, event.target.checked)
                              }
                            >
                              {indicator.name}
                            </Checkbox>
                            {indicator.critical ? <RiskTag type="warning">关键项</RiskTag> : null}
                          </div>
                          <div className="eval-config-editor__weight-box eval-config-editor__weight-box--small">
                            <InputNumber
                              min={1}
                              controls={false}
                              value={indicator.weight}
                              disabled={!dimension.selected || !indicator.selected}
                              onChange={(value) =>
                                handleIndicatorWeightChange(dimension.id, indicator.id, value)
                              }
                            />
                            <span className="eval-config-editor__weight-unit">%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )
              })}
            </div>

            <div className="eval-config-editor__footer">
              <Space size={12}>
                <Button
                  onClick={() => {
                    setEditorOpen(false)
                    setDraftConfig(null)
                  }}
                >
                  取消
                </Button>
                <Button type="primary" onClick={handleSaveConfig}>
                  保存配置
                </Button>
              </Space>
            </div>
          </div>
        ) : null}
      </Drawer>
    </div>
  )
}

export default EvaluationConfig




