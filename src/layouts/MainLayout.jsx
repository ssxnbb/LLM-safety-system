import { Layout, Menu } from 'antd'
import { Bot, Boxes, Database, Shield } from 'lucide-react'
import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  findRouteMeta,
  getOpenMenuKeys,
  getSelectedMenuKey,
  getSidebarItems,
} from '../app/evaluationConfig.js'
import './MainLayout.css'

const { Header, Sider, Content } = Layout

const sectionIcons = {
  data: <Database size={16} />,
  model: <Boxes size={16} />,
  agent: <Bot size={16} />,
}

function MainLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const currentRoute = findRouteMeta(location.pathname)
  const [manualOpenKeys, setManualOpenKeys] = useState([])
  const sidebarItems = getSidebarItems().map((section) => ({
    ...section,
    icon: sectionIcons[section.key],
  }))
  const routeOpenKeys = getOpenMenuKeys(location.pathname)
  const openKeys = Array.from(new Set([...routeOpenKeys, ...manualOpenKeys]))

  return (
    <Layout className="platform-layout">
      <Sider width={216} className="platform-sider">
        <div className="platform-sider__header">
          <div className="platform-sider__title">评估中心</div>
          <div className="platform-sider__subtitle">
            {currentRoute ? currentRoute.section.label : '大模型风险评测'}
          </div>
        </div>
        <Menu
          mode="inline"
          items={sidebarItems}
          className="platform-menu"
          selectedKeys={getSelectedMenuKey(location.pathname)}
          openKeys={openKeys}
          onOpenChange={(keys) => {
            const currentSectionKey = routeOpenKeys[0]
            const nextKeys = currentSectionKey
              ? keys.filter((key) => key !== currentSectionKey)
              : keys
            setManualOpenKeys(nextKeys)
          }}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>

      <Layout className="platform-main">
        <Header className="platform-header">
          <div className="platform-brand">
            <div className="platform-brand__logo">
              <Shield size={18} />
            </div>
          </div>
          <div className="platform-header__spacer" />
        </Header>

        <Content className="platform-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout
