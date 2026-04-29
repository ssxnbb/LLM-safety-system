import { PlusOutlined } from '@ant-design/icons'
import {
  Breadcrumb,
  Button,
  Card,
  Col,
  Empty,
  Form,
  Input,
  Row,
  Select,
  Space,
  message,
} from 'antd'
import { useState, useSyncExternalStore } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import PageTitle from '../../components/evaluation/PageTitle.jsx'
import RiskTag from '../../components/evaluation/RiskTag.jsx'
import {
  countSelectedDimensions,
  countSelectedIndicators,
  getAllEvaluationConfigs,
  getSelectedDimensionWeightTotal,
  getSelectedDimensions,
  subscribeEvaluationConfigs,
} from '../../mock/evaluationConfigs.js'
import { getTypeText } from '../../utils/evaluationScore.js'
import './EvaluationCreate.css'

const industryOptions = ['核', '航天', '航空', '船舶', '兵器', '电子'].map((item) => ({
  label: item,
  value: item,
}))

const dataTypeOptions = ['文本', '图像', '表格', '日志', '多模态'].map((item) => ({
  label: item,
  value: item,
}))

const sensitivityOptions = ['公开', '内部', '敏感', '重要', '涉密'].map((item) => ({
  label: item,
  value: item,
}))

const modelTypeOptions = ['大语言模型', '多模态模型', '专用分类模型', '智能问答模型'].map((item) => ({
  label: item,
  value: item,
}))

const agentTypeOptions = ['问答助手', '工具调用智能体', '任务规划智能体', '多智能体系统'].map((item) => ({
  label: item,
  value: item,
}))

const permissionOptions = ['只读', '受控写入', '高风险操作'].map((item) => ({
  label: item,
  value: item,
}))

const pageMetaMap = {
  data: {
    title: '新建数据集评估',
    subtitle: '配置数据来源、质量与安全风险相关信息，快速发起新的数据集准入评估。',
  },
  model: {
    title: '新建模型评估',
    subtitle: '配置被评模型、打分模型和测试数据集，发起模型鲁棒性与安全评估任务。',
  },
  agent: {
    title: '新建智能体评估',
    subtitle: '配置智能体类型、工具权限和测试任务集，发起智能体部署评估任务。',
  },
}

function getTypeFromPath(pathname) {
  const [, section, type] = pathname.split('/')

  if (section === 'evaluation' && ['data', 'model', 'agent'].includes(type)) {
    return type
  }

  return 'data'
}

function SectionCard({ title, children }) {
  return (
    <Card className="eval-create-section" bordered={false}>
      <div className="eval-create-section__title">{title}</div>
      <div className="eval-create-section__body">{children}</div>
    </Card>
  )
}

function renderTypeFields(type) {
  if (type === 'data') {
    return (
      <>
        <Col xs={24} md={12}>
          <Form.Item
            label="数据集名称"
            name="datasetName"
            rules={[{ required: true, message: '请输入数据集名称' }]}
          >
            <Input placeholder="请输入数据集名称" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            label="数据类型"
            name="dataType"
            rules={[{ required: true, message: '请选择数据类型' }]}
          >
            <Select placeholder="请选择数据类型" options={dataTypeOptions} />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            label="密级/敏感级别"
            name="sensitivityLevel"
            rules={[{ required: true, message: '请选择密级/敏感级别' }]}
          >
            <Select placeholder="请选择密级/敏感级别" options={sensitivityOptions} />
          </Form.Item>
        </Col>
      </>
    )
  }

  if (type === 'model') {
    return (
      <>
        <Col xs={24} md={12}>
          <Form.Item
            label="被评模型"
            name="targetModel"
            rules={[{ required: true, message: '请输入被评模型' }]}
          >
            <Input placeholder="请输入被评模型" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            label="打分模型"
            name="scoringModel"
            rules={[{ required: true, message: '请输入打分模型' }]}
          >
            <Input placeholder="请输入打分模型" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            label="模型类型"
            name="modelType"
            rules={[{ required: true, message: '请选择模型类型' }]}
          >
            <Select placeholder="请选择模型类型" options={modelTypeOptions} />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            label="测试数据集"
            name="testDataset"
            rules={[{ required: true, message: '请输入测试数据集' }]}
          >
            <Input placeholder="请输入测试数据集" />
          </Form.Item>
        </Col>
      </>
    )
  }

  return (
    <>
      <Col xs={24} md={12}>
        <Form.Item
          label="被评智能体"
          name="targetAgent"
          rules={[{ required: true, message: '请输入被评智能体' }]}
        >
          <Input placeholder="请输入被评智能体" />
        </Form.Item>
      </Col>
      <Col xs={24} md={12}>
        <Form.Item
          label="智能体类型"
          name="agentType"
          rules={[{ required: true, message: '请选择智能体类型' }]}
        >
          <Select placeholder="请选择智能体类型" options={agentTypeOptions} />
        </Form.Item>
      </Col>
      <Col xs={24} md={12}>
        <Form.Item
          label="工具权限级别"
          name="toolPermissionLevel"
          rules={[{ required: true, message: '请选择工具权限级别' }]}
        >
          <Select placeholder="请选择工具权限级别" options={permissionOptions} />
        </Form.Item>
      </Col>
      <Col xs={24} md={12}>
        <Form.Item
          label="测试任务集"
          name="testTaskSet"
          rules={[{ required: true, message: '请输入测试任务集' }]}
        >
          <Input placeholder="请输入测试任务集" />
        </Form.Item>
      </Col>
    </>
  )
}

function EvaluationCreate() {
  const [form] = Form.useForm()
  const navigate = useNavigate()
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

  const resolvedConfigId = configs.some((config) => config.id === selectedConfigId)
    ? selectedConfigId
    : configs[0]?.id || ''
  const selectedConfig = configs.find((item) => item.id === resolvedConfigId) || null

  const handleCancel = () => {
    navigate(`/evaluation/${type}/tasks`)
  }

  const handleSaveDraft = () => {
    message.success('草稿已保存')
  }

  const handleFinish = () => {
    if (!selectedConfig) {
      message.error('请先选择评估配置')
      return
    }

    message.success('评估任务已创建')
    navigate(`/evaluation/${type}/tasks`)
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

      <PageTitle title={pageMeta.title} subtitle={pageMeta.subtitle} />

      <Form form={form} layout="vertical" onFinish={handleFinish} className="eval-create-form">
        <SectionCard title="评估基本信息">
          <Row gutter={[20, 4]}>
            <Col xs={24} md={12}>
              <Form.Item
                label="评估名称"
                name="evaluationName"
                rules={[{ required: true, message: '请输入评估名称' }]}
              >
                <Input placeholder="请输入评估名称" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="所属行业"
                name="industry"
                rules={[{ required: true, message: '请选择所属行业' }]}
              >
                <Select placeholder="请选择所属行业" options={industryOptions} />
              </Form.Item>
            </Col>
          </Row>
        </SectionCard>

        <SectionCard title="评估对象选择">
          <Row gutter={[20, 4]}>{renderTypeFields(type)}</Row>
        </SectionCard>

        <SectionCard title="评估配置">
          <Row gutter={[20, 4]}>
            <Col xs={24} xl={14}>
              <div className="eval-create-section__field-label">评估配置</div>
              <Select
                value={resolvedConfigId || undefined}
                placeholder="请选择评估配置"
                options={configs.map((config) => ({
                  label: config.name,
                  value: config.id,
                }))}
                onChange={(value) => setSelectedConfigId(value)}
                suffixIcon={<PlusOutlined />}
                className="eval-create-config-select"
              />
            </Col>
          </Row>

          {selectedConfig ? (
            <div className="eval-create-config-preview">
              <div className="eval-create-config-preview__header">
                <div>
                  <div className="eval-create-config-preview__title">{selectedConfig.name}</div>
                  <div className="eval-create-config-preview__subtitle">
                    已配置 {countSelectedDimensions(selectedConfig)} 个一级维度，
                    {countSelectedIndicators(selectedConfig)} 个评估指标。
                  </div>
                </div>
                <RiskTag type={selectedConfig.securityModelEnabled ? 'warning' : 'default'}>
                  {selectedConfig.securityModelEnabled
                    ? `安全大模型：${selectedConfig.securityModel}`
                    : '未接入安全大模型'}
                </RiskTag>
              </div>

              <div className="eval-create-config-preview__meta">
                <div className="eval-create-config-preview__meta-item">
                  <span className="eval-create-config-preview__meta-label">适用对象</span>
                  <span className="eval-create-config-preview__meta-value">{selectedConfig.objectName}</span>
                </div>
                <div className="eval-create-config-preview__meta-item">
                  <span className="eval-create-config-preview__meta-label">维度总权重</span>
                  <span className="eval-create-config-preview__meta-value">
                    {getSelectedDimensionWeightTotal(selectedConfig)}
                  </span>
                </div>
                <div className="eval-create-config-preview__meta-item">
                  <span className="eval-create-config-preview__meta-label">创建时间</span>
                  <span className="eval-create-config-preview__meta-value">{selectedConfig.createdAt}</span>
                </div>
              </div>

              <div className="eval-create-config-preview__tags">
                {getSelectedDimensions(selectedConfig).map((dimension) => (
                  <RiskTag key={dimension.id} type="processing">
                    {dimension.name}
                  </RiskTag>
                ))}
              </div>
            </div>
          ) : (
            <Empty
              className="eval-create-config-empty"
              description="当前还没有可用配置，请先到评估配置页新建配置。"
            />
          )}
        </SectionCard>

        <SectionCard title="备注说明">
          <Row gutter={[20, 4]}>
            <Col span={24}>
              <Form.Item label="备注" name="remark">
                <Input.TextArea rows={5} placeholder="请输入备注说明" />
              </Form.Item>
            </Col>
          </Row>
        </SectionCard>

        <Card className="eval-create-footer" bordered={false}>
          <Space size={12}>
            <Button onClick={handleCancel}>取消</Button>
            <Button onClick={handleSaveDraft}>保存草稿</Button>
            <Button type="primary" htmlType="submit">
              创建评估任务
            </Button>
          </Space>
        </Card>
      </Form>
    </div>
  )
}

export default EvaluationCreate
