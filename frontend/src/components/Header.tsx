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

  // 深藍色主題色（Material Design Blue 700）
  const primaryColor = '#1976d2'
  const darkGray = '#212121'

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
      label: <Link to="/" style={{ color: 'inherit' }}>首頁</Link>,
    },
    {
      key: '/pricing',
      icon: <DollarOutlined />,
      label: <a href="#pricing-section" onClick={handlePricingClick} style={{ color: 'inherit' }}>價格方案</a>,
    },
  ]

  if (token) {
    menuItems.push(
      {
        key: '/converter',
        icon: <ToolOutlined />,
        label: <Link to="/converter" style={{ color: 'inherit' }}>轉檔工具</Link>,
      },
      {
        key: '/dashboard',
        icon: <DashboardOutlined />,
        label: <Link to="/dashboard" style={{ color: 'inherit' }}>儀表板</Link>,
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

  const getPlanName = () => {
    if (user?.plan === 'free') return '免費版'
    if (user?.plan === 'pro') return 'Pro'
    if (user?.plan === 'biz') return 'Biz'
    return '免費版'
  }

  return (
    <AntHeader style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      background: '#ffffff',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      padding: '0 48px',
      height: '64px',
      borderBottom: '1px solid #f0f0f0'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
        <Link to="/" style={{ 
          fontSize: '22px', 
          fontWeight: 700, 
          color: darkGray,
          marginRight: '48px',
          textDecoration: 'none',
          whiteSpace: 'nowrap',
          letterSpacing: '-0.5px'
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
            lineHeight: '64px',
            fontSize: '15px',
            fontWeight: 500
          }}
          overflowedIndicator={null}
          triggerSubMenuAction="click"
        />
      </div>
      <Space size={16}>
        {token ? (
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar 
                icon={<UserOutlined />}
                style={{ background: primaryColor }}
              />
              <span style={{ 
                fontSize: '15px',
                color: darkGray,
                fontWeight: 500
              }}>
                {user?.email}
              </span>
              {user?.plan && (
                <span style={{ 
                  padding: '4px 12px', 
                  background: user.plan === 'free' ? '#f5f5f5' : `${primaryColor}15`,
                  color: user.plan === 'free' ? darkGray : primaryColor,
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: 500
                }}>
                  {getPlanName()}
                </span>
              )}
            </Space>
          </Dropdown>
        ) : (
          <>
            <Button 
              type="text" 
              onClick={() => navigate('/login')}
              style={{
                fontSize: '15px',
                fontWeight: 500,
                color: darkGray,
                height: '40px'
              }}
            >
              登入
            </Button>
            <Button 
              type="primary" 
              onClick={() => navigate('/register')}
              style={{
                height: '40px',
                fontSize: '15px',
                fontWeight: 500,
                borderRadius: '20px',
                background: primaryColor,
                borderColor: primaryColor,
                boxShadow: 'none',
                border: 'none',
                padding: '0 24px'
              }}
            >
              註冊
            </Button>
          </>
        )}
      </Space>
    </AntHeader>
  )
}
