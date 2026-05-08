import { Layout } from 'antd'
import { Outlet } from 'react-router-dom'
import './MainLayout.css'

const { Content } = Layout

function MainLayout() {
  return (
    <Layout className="platform-layout platform-layout--embedded">
      <Content className="platform-content platform-content--embedded">
        <Outlet />
      </Content>
    </Layout>
  )
}

export default MainLayout
