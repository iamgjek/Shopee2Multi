import { Layout, Typography } from 'antd'
import { useLocation } from 'react-router-dom'

const { Footer: AntFooter } = Layout
const { Text } = Typography

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const location = useLocation()
  
  // 判斷是否在 Home 頁面
  const isHomePage = location.pathname === '/'
  
  // Dark mode 主題色
  const darkCardBg = '#1a1a1a' // 卡片背景
  const darkTextSecondary = '#a0a0a0' // 次要文字
  const darkBorder = '#2a2a2a' // 邊框顏色
  
  // 根據頁面選擇顏色
  const footerBg = isHomePage ? darkCardBg : '#fafafa'
  const footerBorder = isHomePage ? darkBorder : '#f0f0f0'
  const footerText = isHomePage ? darkTextSecondary : '#757575'

  return (
    <AntFooter style={{ 
      textAlign: 'center',
      background: footerBg,
      borderTop: `1px solid ${footerBorder}`,
      padding: '32px 48px'
    }}>
      <Text style={{ 
        fontSize: '15px',
        color: footerText
      }}>
        © {currentYear} Shopee2Multi. All rights reserved.
      </Text>
    </AntFooter>
  )
}

