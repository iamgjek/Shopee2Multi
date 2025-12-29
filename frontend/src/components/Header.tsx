import { Layout, Avatar, Dropdown } from 'antd'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { UserOutlined, LogoutOutlined } from '@ant-design/icons'
import { useAuthStore } from '../store/authStore'

const { Header: AntHeader } = Layout

export default function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const { token, user, clearAuth } = useAuthStore()

  // Dark mode 主題色（黑/綠色）- 統一風格
  const primaryColor = '#00ff88' // 亮綠色
  const darkBg = '#0a0a0a' // 深黑色背景
  const darkCardBg = '#1a1a1a' // 卡片背景
  const darkText = '#ffffff' // 白色文字
  const darkTextSecondary = '#a0a0a0' // 次要文字
  const darkBorder = '#2a2a2a' // 邊框顏色
  
  // 所有頁面統一使用 dark mode
  const headerBg = 'rgba(10, 10, 10, 0.8)'
  const headerText = darkText
  const headerTextSecondary = darkTextSecondary
  const headerBorder = darkBorder
  const headerPrimaryColor = primaryColor

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
        <div style={{ padding: '4px 0', borderBottom: `1px solid ${darkBorder}`, marginBottom: '8px' }}>
          <div style={{ fontSize: '14px', color: headerTextSecondary, marginBottom: '4px' }}>登入身分</div>
          <div style={{ fontSize: '15px', color: headerText, fontWeight: 500 }}>{user?.email}</div>
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
    color: isActive ? headerText : headerTextSecondary,
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: 500,
    padding: '0 20px',
    transition: 'color 0.2s ease',
    display: 'inline-block',
    lineHeight: '64px',
    borderBottom: isActive ? `2px solid ${headerPrimaryColor}` : '2px solid transparent'
  })

  return (
    <AntHeader style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      background: headerBg,
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      boxShadow: '0 1px 0 rgba(255,255,255,0.05)',
      padding: '0 max(24px, calc((100vw - 1200px) / 2))',
      height: '64px',
      borderBottom: `1px solid ${headerBorder}`,
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      {/* Logo */}
      <Link to="/" style={{ 
        fontSize: '20px', 
        fontWeight: 700, 
        color: headerText,
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
          onMouseOver={(e) => { if (location.pathname !== '/') e.currentTarget.style.color = headerText }}
          onMouseOut={(e) => { if (location.pathname !== '/') e.currentTarget.style.color = headerTextSecondary }}
        >
          首頁
        </Link>
        <a 
          href="#pricing-section" 
          onClick={handlePricingClick}
          style={navLinkStyle(location.pathname === '/pricing')}
          onMouseOver={(e) => { if (location.pathname !== '/pricing') e.currentTarget.style.color = headerText }}
          onMouseOut={(e) => { if (location.pathname !== '/pricing') e.currentTarget.style.color = headerTextSecondary }}
        >
          價格方案
        </a>
        <Link 
          to={token ? "/converter" : "/login"} 
          style={navLinkStyle(location.pathname === '/converter' || location.pathname === '/login')}
          onMouseOver={(e) => { if (location.pathname !== '/converter' && location.pathname !== '/login') e.currentTarget.style.color = headerText }}
          onMouseOut={(e) => { if (location.pathname !== '/converter' && location.pathname !== '/login') e.currentTarget.style.color = headerTextSecondary }}
        >
          轉檔工具
        </Link>
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
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <Avatar 
                size={32}
                icon={<UserOutlined />}
                style={{ 
                  background: headerPrimaryColor,
                  fontSize: '14px'
                }}
              />
              {user?.email && (
                <span style={{ 
                  fontSize: '14px',
                  fontWeight: 500,
                  color: headerTextSecondary
                }}>
                  {user.email}
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
                color: headerTextSecondary,
                fontSize: '15px',
                fontWeight: 500,
                padding: '8px 16px',
                cursor: 'pointer',
                transition: 'color 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = headerText}
              onMouseOut={(e) => e.currentTarget.style.color = headerTextSecondary}
            >
              登入
            </button>
            <button
              onClick={() => navigate('/register')}
              style={{
                background: headerPrimaryColor,
                border: 'none',
                color: darkBg,
                fontSize: '15px',
                fontWeight: 500,
                padding: '8px 20px',
                borderRadius: '18px',
                cursor: 'pointer',
                transition: 'opacity 0.2s ease',
                boxShadow: '0 4px 16px rgba(0, 255, 136, 0.3)'
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
