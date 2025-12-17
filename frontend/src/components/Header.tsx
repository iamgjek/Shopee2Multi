import { Layout, Avatar, Dropdown } from 'antd'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { UserOutlined, LogoutOutlined } from '@ant-design/icons'
import { useAuthStore } from '../store/authStore'

const { Header: AntHeader } = Layout

export default function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const { token, user, clearAuth } = useAuthStore()

  // 深藍色主題色（Material Design Blue 700）
  const primaryColor = '#1976d2'
  const darkGray = '#212121'
  const mediumGray = '#757575'

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

  const userMenuItems = [
    {
      key: 'email',
      label: (
        <div style={{ padding: '4px 0', borderBottom: '1px solid #f0f0f0', marginBottom: '8px' }}>
          <div style={{ fontSize: '14px', color: mediumGray, marginBottom: '4px' }}>登入身分</div>
          <div style={{ fontSize: '15px', color: darkGray, fontWeight: 500 }}>{user?.email}</div>
        </div>
      ),
      disabled: true
    },
    {
      key: 'dashboard',
      label: '儀表板',
      onClick: () => navigate('/dashboard'),
    },
    {
      type: 'divider' as const
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

  const navLinkStyle = (isActive: boolean) => ({
    color: isActive ? darkGray : mediumGray,
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: 500,
    padding: '0 20px',
    transition: 'color 0.2s ease',
    display: 'inline-block',
    lineHeight: '64px',
    borderBottom: isActive ? `2px solid ${primaryColor}` : '2px solid transparent'
  })

  return (
    <AntHeader style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      boxShadow: '0 1px 0 rgba(0,0,0,0.05)',
      padding: '0 max(24px, calc((100vw - 1200px) / 2))',
      height: '64px',
      borderBottom: '1px solid rgba(0,0,0,0.05)',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      {/* Logo */}
      <Link to="/" style={{ 
        fontSize: '20px', 
        fontWeight: 700, 
        color: darkGray,
        textDecoration: 'none',
        letterSpacing: '-0.5px',
        marginRight: '60px'
      }}>
        Shopee2Multi
      </Link>

      {/* Navigation Links - Apple Style */}
      <nav style={{ 
        display: 'flex', 
        alignItems: 'center',
        flex: 1,
        gap: '4px'
      }}>
        <Link 
          to="/" 
          style={navLinkStyle(location.pathname === '/')}
          onMouseOver={(e) => { if (location.pathname !== '/') e.currentTarget.style.color = darkGray }}
          onMouseOut={(e) => { if (location.pathname !== '/') e.currentTarget.style.color = mediumGray }}
        >
          首頁
        </Link>
        <a 
          href="#pricing-section" 
          onClick={handlePricingClick}
          style={navLinkStyle(location.pathname === '/pricing')}
          onMouseOver={(e) => { if (location.pathname !== '/pricing') e.currentTarget.style.color = darkGray }}
          onMouseOut={(e) => { if (location.pathname !== '/pricing') e.currentTarget.style.color = mediumGray }}
        >
          價格方案
        </a>
        {token && (
          <>
            <Link 
              to="/converter" 
              style={navLinkStyle(location.pathname === '/converter')}
              onMouseOver={(e) => { if (location.pathname !== '/converter') e.currentTarget.style.color = darkGray }}
              onMouseOut={(e) => { if (location.pathname !== '/converter') e.currentTarget.style.color = mediumGray }}
            >
              轉檔工具
            </Link>
            <Link 
              to="/dashboard" 
              style={navLinkStyle(location.pathname === '/dashboard')}
              onMouseOver={(e) => { if (location.pathname !== '/dashboard') e.currentTarget.style.color = darkGray }}
              onMouseOut={(e) => { if (location.pathname !== '/dashboard') e.currentTarget.style.color = mediumGray }}
            >
              儀表板
            </Link>
          </>
        )}
      </nav>

      {/* Right Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {token ? (
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              cursor: 'pointer',
              padding: '6px 12px',
              borderRadius: '20px',
              transition: 'background 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#f5f5f5'}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <Avatar 
                size={32}
                icon={<UserOutlined />}
                style={{ 
                  background: primaryColor,
                  fontSize: '14px'
                }}
              />
              {user?.plan && (
                <span style={{ 
                  fontSize: '14px',
                  fontWeight: 500,
                  color: user.plan === 'free' ? mediumGray : primaryColor
                }}>
                  {getPlanName()}
                </span>
              )}
            </div>
          </Dropdown>
        ) : (
          <>
            <button
              onClick={() => navigate('/login')}
              style={{
                background: 'transparent',
                border: 'none',
                color: mediumGray,
                fontSize: '15px',
                fontWeight: 500,
                padding: '8px 16px',
                cursor: 'pointer',
                transition: 'color 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = darkGray}
              onMouseOut={(e) => e.currentTarget.style.color = mediumGray}
            >
              登入
            </button>
            <button
              onClick={() => navigate('/register')}
              style={{
                background: primaryColor,
                border: 'none',
                color: '#ffffff',
                fontSize: '15px',
                fontWeight: 500,
                padding: '8px 20px',
                borderRadius: '18px',
                cursor: 'pointer',
                transition: 'opacity 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
            >
              註冊
            </button>
          </>
        )}
      </div>
    </AntHeader>
  )
}
