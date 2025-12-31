import { Layout, Avatar, Dropdown, Drawer, Button } from 'antd'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { UserOutlined, LogoutOutlined, MenuOutlined } from '@ant-design/icons'
import { useAuthStore } from '../store/authStore'
import { useState } from 'react'

const { Header: AntHeader } = Layout

export default function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const { token, user, clearAuth } = useAuthStore()
  const [drawerVisible, setDrawerVisible] = useState(false)

  // Dark mode 主題色（黑/綠色）- 統一風格
  const primaryColor = '#00ff88' // 亮綠色
  const darkBg = '#0a0a0a' // 深黑色背景
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
    ...(user?.role === 'admin' ? [{
      key: 'admin',
      label: '管理後台',
      onClick: () => navigate('/admin'),
    }] : []),
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

  const mobileNavLinkStyle = (isActive: boolean) => ({
    color: isActive ? headerPrimaryColor : headerText,
    textDecoration: 'none',
    fontSize: '18px',
    fontWeight: 500,
    padding: '16px 0',
    display: 'block',
    borderBottom: `1px solid ${darkBorder}`,
    transition: 'color 0.2s ease'
  })

  const closeDrawer = () => {
    setDrawerVisible(false)
  }

  return (
    <>
      <AntHeader style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        background: headerBg,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.05)',
        padding: '0 24px',
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
          marginRight: '20px',
          whiteSpace: 'nowrap'
        }}>
          Shopee2Multi
        </Link>

        {/* Desktop Navigation Links */}
        <nav style={{ 
          display: 'flex', 
          alignItems: 'center',
          flex: 1,
          gap: '4px'
        }} className="desktop-nav">
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '20px' }}>
          {token ? (
            <>
              {/* Desktop: Show email */}
              <div className="desktop-user">
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
                    <span style={{ 
                      fontSize: '14px',
                      fontWeight: 500,
                      color: headerTextSecondary,
                      whiteSpace: 'nowrap'
                    }}>
                      {user?.email}
                    </span>
                  </div>
                </Dropdown>
              </div>
              {/* Mobile: Only avatar */}
              <div className="mobile-user">
                <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
                  <div style={{ 
                    cursor: 'pointer',
                    padding: '4px'
                  }}>
                    <Avatar 
                      size={32}
                      icon={<UserOutlined />}
                      style={{ 
                        background: headerPrimaryColor,
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </Dropdown>
              </div>
            </>
          ) : (
            <>
              {/* Desktop: Show both buttons */}
              <div className="desktop-auth">
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
              </div>
              {/* Mobile: Only register button */}
              <div className="mobile-auth">
                <button
                  onClick={() => navigate('/register')}
                  style={{
                    background: headerPrimaryColor,
                    border: 'none',
                    color: darkBg,
                    fontSize: '14px',
                    fontWeight: 500,
                    padding: '6px 16px',
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
              </div>
            </>
          )}
          
          {/* Mobile Menu Button */}
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setDrawerVisible(true)}
            style={{
              color: headerText,
              fontSize: '18px',
              padding: '4px 8px',
              display: 'none'
            }}
            className="mobile-menu-btn"
          />
        </div>
      </AntHeader>

      {/* Mobile Drawer */}
      <Drawer
        title="選單"
        placement="right"
        onClose={closeDrawer}
        open={drawerVisible}
        style={{
          background: darkBg
        }}
        styles={{
          body: {
            background: darkBg,
            padding: 0
          },
          header: {
            background: darkBg,
            borderBottom: `1px solid ${darkBorder}`,
            padding: '16px 24px'
          }
        }}
      >
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          padding: '24px 0'
        }}>
          <Link 
            to="/" 
            onClick={closeDrawer}
            style={mobileNavLinkStyle(location.pathname === '/')}
          >
            首頁
          </Link>
          <a 
            href="#pricing-section" 
            onClick={(e) => {
              handlePricingClick(e)
              closeDrawer()
            }}
            style={mobileNavLinkStyle(location.pathname === '/pricing')}
          >
            價格方案
          </a>
          <Link 
            to={token ? "/converter" : "/login"} 
            onClick={closeDrawer}
            style={mobileNavLinkStyle(location.pathname === '/converter' || location.pathname === '/login')}
          >
            轉檔工具
          </Link>
          {token && (
            <>
              {user?.role === 'admin' && (
                <Link 
                  to="/admin" 
                  onClick={closeDrawer}
                  style={mobileNavLinkStyle(location.pathname === '/admin')}
                >
                  管理後台
                </Link>
              )}
              <Link 
                to="/dashboard" 
                onClick={closeDrawer}
                style={mobileNavLinkStyle(location.pathname === '/dashboard')}
              >
                儀表板
              </Link>
              <div style={{ 
                padding: '16px 0',
                borderTop: `1px solid ${darkBorder}`,
                marginTop: '16px'
              }}>
                <div style={{ 
                  fontSize: '14px', 
                  color: headerTextSecondary, 
                  marginBottom: '8px' 
                }}>
                  登入身分
                </div>
                <div style={{ 
                  fontSize: '16px', 
                  color: headerText, 
                  fontWeight: 500,
                  marginBottom: '16px'
                }}>
                  {user?.email}
                </div>
                <button
                  onClick={() => {
                    handleLogout()
                    closeDrawer()
                  }}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: `1px solid ${darkBorder}`,
                    color: headerText,
                    fontSize: '16px',
                    fontWeight: 500,
                    padding: '12px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                    e.currentTarget.style.borderColor = headerPrimaryColor
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.borderColor = darkBorder
                  }}
                >
                  登出
                </button>
              </div>
            </>
          )}
          {!token && (
            <div style={{ 
              padding: '16px 0',
              borderTop: `1px solid ${darkBorder}`,
              marginTop: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <button
                onClick={() => {
                  navigate('/login')
                  closeDrawer()
                }}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: `1px solid ${darkBorder}`,
                  color: headerText,
                  fontSize: '16px',
                  fontWeight: 500,
                  padding: '12px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                  e.currentTarget.style.borderColor = headerPrimaryColor
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.borderColor = darkBorder
                }}
              >
                登入
              </button>
              <button
                onClick={() => {
                  navigate('/register')
                  closeDrawer()
                }}
                style={{
                  width: '100%',
                  background: headerPrimaryColor,
                  border: 'none',
                  color: darkBg,
                  fontSize: '16px',
                  fontWeight: 500,
                  padding: '12px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s ease',
                  boxShadow: '0 4px 16px rgba(0, 255, 136, 0.3)'
                }}
                onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
              >
                註冊
              </button>
            </div>
          )}
        </div>
      </Drawer>
    </>
  )
}
