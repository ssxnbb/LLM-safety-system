import { LeftOutlined } from '@ant-design/icons'
import { Button, Card, Space, Typography } from 'antd'
import './evaluationComponents.css'

const { Text } = Typography

function PageTitle({ title, subtitle, actions, showBack = false, onBack }) {
  return (
    <Card className="eval-page-title" bordered={false}>
      <div className="eval-page-title__content">
        <div className="eval-page-title__left">
          <div className="eval-page-title__accent" />
          <div className="eval-page-title__main">
            <div className="eval-page-title__top">
              {showBack ? (
                <Button icon={<LeftOutlined />} onClick={onBack}>
                  返回
                </Button>
              ) : null}
              <h2 className="eval-page-title__title">{title}</h2>
            </div>
            {subtitle ? <Text className="eval-page-title__subtitle">{subtitle}</Text> : null}
          </div>
        </div>

        {actions ? <Space className="eval-page-title__actions">{actions}</Space> : null}
      </div>
    </Card>
  )
}

export default PageTitle
