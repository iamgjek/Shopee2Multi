import { Layout, Menu, Button, Space, Avatar, Dropdown } from 'antd'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { 
  HomeOutlined, 
  ToolOutlined, 
  DashboardOutlined,
  UserOutlined,
  LogoutOutlined,
  DollarOutlined
} from '@ant-design/icons'
import { useAuthStore } from '../store/authStore'

const { Header: AntHeader } = Layout

export default function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const { token, user, clearAuth } = useAuthStore()

  const handleLogout = () => {
    clearAuth()
    navigate('/')
  }

  const handlePricingClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (location.pathname === '/') {
      document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate('/')
      setTimeout(() => {
        document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <Link to="/">首頁</Link>,
    },
    {
      key: '/pricing',
      icon: <DollarOutlined />,
      label: <a href="#pricing-section" onClick={handlePricingClick}>價格方案</a>,
    },
  ]

  if (token) {
    menuItems.push(
      {
        key: '/converter',
        icon: <ToolOutlined />,
        label: <Link to="/converter">轉檔工具</Link>,
      },
      {
        key: '/dashboard',
        icon: <DashboardOutlined />,
        label: <Link to="/dashboard">儀表板</Link>,
      }
    )
  }

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '個人資料',
      onClick: () => navigate('/dashboard'),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '登出',
      onClick: handleLogout,
    },
  ]

  return (
    <AntHeader style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      background: '#fff',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
        <Link to="/" style={{ 
          fontSize: '20px', 
          fontWeight: 'bold', 
          color: '#1890ff',
          marginRight: '40px',
          textDecoration: 'none',
          whiteSpace: 'nowrap'
        }}>
          Shopee2Multi
        </Link>
        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          style={{ 
            borderBottom: 'none',
            flex: 1,
            minWidth: 0,
            lineHeight: '64px'
          }}
          overflowedIndicator={null}
          triggerSubMenuAction="click"
        />
      </div>
      <Space>
        {token ? (
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} />
              <span>{user?.email}</span>
              {user?.plan && (
                <span style={{ 
                  padding: '2px 8px', 
                  background: '#f0f0f0', 
                  borderRadius: '4px',
                  fontSize: '12px'
                }}>
                  {user.plan === 'free' ? '免費版' : user.plan === 'pro' ? '專業版' : '商業版'}
                </span>
              )}
            </Space>
          </Dropdown>
        ) : (
          <>
            <Button type="text" onClick={() => navigate('/login')}>
              登入
            </Button>
            <Button type="primary" onClick={() => navigate('/register')}>
              註冊
            </Button>
          </>
        )}
      </Space>
    </AntHeader>
  )
}
