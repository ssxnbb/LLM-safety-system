import { Breadcrumb, Button, Card, Col, Form, Input, Row, Select, Space, message } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'
import PageTitle from '../../components/evaluation/PageTitle.jsx'
import { getEvaluationSchema } from '../../mock/evaluationSchemas.js'
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

const configNameMap = {
  data: '数据集质量与安全评估体系',
  model: '模型分级鲁棒性评估体系',
  agent: '智能体核心能力评估体系',
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

function getInitialValues(type) {
  return {
    configName: configNameMap[type] || getEvaluationSchema(type)?.title || '',
  }
}

function getNameFieldLabel(type) {
  if (type === 'data') {
    return '评估名称'
  }

  if (type === 'model') {
    return '评估名称'
  }

  return '评估名称'
}

function EvaluationCreate() {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const location = useLocation()
  const type = getTypeFromPath(location.pathname)
  const pageMeta = pageMetaMap[type] || pageMetaMap.data

  const handleCancel = () => {
    navigate(`/evaluation/${type}/tasks`)
  }

  const handleSaveDraft = () => {
    message.success('草稿已保存')
  }

  const handleFinish = () => {
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

      <Form
        form={form}
        layout="vertical"
        initialValues={getInitialValues(type)}
        onFinish={handleFinish}
        className="eval-create-form"
      >
        <SectionCard title="评估基本信息">
          <Row gutter={[20, 4]}>
            <Col xs={24} md={12}>
              <Form.Item
                label={getNameFieldLabel(type)}
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
            <Col xs={24} md={12}>
              <Form.Item label="评估配置" name="configName" rules={[{ required: true, message: '请选择评估配置' }]}>
                <Input disabled />
              </Form.Item>
            </Col>
          </Row>
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
