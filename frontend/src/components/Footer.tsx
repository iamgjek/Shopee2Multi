import { Layout, Typography } from 'antd'

const { Footer: AntFooter } = Layout
const { Text } = Typography

export default function Footer() {
  const currentYear = new Date().getFullYear()
  
  // Dark mode 主題色（黑/綠色）- 統一風格
  const darkCardBg = '#1a1a1a' // 卡片背景
  const darkTextSecondary = '#a0a0a0' // 次要文字
  const darkBorder = '#2a2a2a' // 邊框顏色
  
  // 所有頁面統一使用 dark mode
  const footerBg = darkCardBg
  const footerBorder = darkBorder
  const footerText = darkTextSecondary

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

