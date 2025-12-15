import { Layout, Typography } from 'antd'

const { Footer: AntFooter } = Layout
const { Text } = Typography

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <AntFooter style={{ 
      textAlign: 'center',
      background: '#fff',
      borderTop: '1px solid #f0f0f0',
      padding: '24px 50px'
    }}>
      <Text type="secondary">
        © {currentYear} Shopee2Multi. All rights reserved.
      </Text>
    </AntFooter>
  )
}

