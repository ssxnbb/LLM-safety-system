import { Breadcrumb, Card, Typography } from 'antd'

const { Title } = Typography

function EvaluationPage({ sectionLabel, title }) {
  return (
    <div className="page-shell">
      <Breadcrumb
        className="page-breadcrumb"
        items={[
          { title: '首页' },
          { title: sectionLabel },
          { title },
        ]}
      />

      <Card className="page-card" bordered={false}>
        <Title level={3} style={{ margin: 0 }}>
          {title}
        </Title>
      </Card>
    </div>
  )
}

export default EvaluationPage
