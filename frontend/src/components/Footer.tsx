import { Layout, Typography } from 'antd'

const { Footer: AntFooter } = Layout
const { Text } = Typography

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const mediumGray = '#757575'

  return (
    <AntFooter style={{ 
      textAlign: 'center',
      background: '#fafafa',
      borderTop: '1px solid #f0f0f0',
      padding: '32px 48px'
    }}>
      <Text style={{ 
        fontSize: '15px',
        color: mediumGray
      }}>
        © {currentYear} Shopee2Multi. All rights reserved.
      </Text>
    </AntFooter>
  )
}

