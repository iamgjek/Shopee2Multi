import { useState } from 'react'
import { Form, Input, Button, Card, Typography, Alert, Space } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useAuthStore } from '../store/authStore'

const { Title, Text } = Typography

export default function Login() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 深藍色主題色（Material Design Blue 700）
  const primaryColor = '#1976d2'
  const darkGray = '#212121'
  const mediumGray = '#757575'

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true)
    setError(null)

    try {
      const response = await api.post('/auth/login', values)
      const { token, user } = response.data.data
      setAuth(token, user)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.error?.message || '登入失敗，請檢查帳號密碼')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      background: '#ffffff',
      minHeight: 'calc(100vh - 112px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 24px'
    }}>
      <div style={{ maxWidth: '480px', width: '100%' }}>
        <Card
          bordered={false}
          style={{
            borderRadius: '24px',
            background: '#ffffff',
            boxShadow: '0 2px 16px rgba(0, 0, 0, 0.08)'
          }}
          bodyStyle={{ padding: '48px' }}
        >
          <Space direction="vertical" size={32} style={{ width: '100%' }}>
            {/* 標題區 */}
            <div style={{ textAlign: 'center' }}>
              <Title 
                level={1}
                style={{ 
                  fontSize: '36px',
                  fontWeight: 600,
                  color: darkGray,
                  marginBottom: '12px',
                  letterSpacing: '-0.5px'
                }}
              >
                登入
              </Title>
              <Text style={{ 
                fontSize: '17px',
                color: mediumGray
              }}>
                登入您的 Shopee2Multi 帳號
              </Text>
            </div>

            {/* 錯誤訊息 */}
            {error && (
              <Alert
                message={error}
                type="error"
                showIcon
                closable
                onClose={() => setError(null)}
                style={{ borderRadius: '12px' }}
              />
            )}

            {/* 登入表單 */}
            <Form
              name="login"
              onFinish={onFinish}
              layout="vertical"
              size="large"
            >
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: '請輸入電子郵件' },
                  { type: 'email', message: '請輸入有效的電子郵件' }
                ]}
              >
                <Input
                  prefix={<UserOutlined style={{ color: mediumGray }} />}
                  placeholder="電子郵件"
                  style={{
                    height: '48px',
                    fontSize: '16px',
                    borderRadius: '12px',
                    borderColor: '#e0e0e0'
                  }}
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: '請輸入密碼' }]}
                style={{ marginBottom: '32px' }}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: mediumGray }} />}
                  placeholder="密碼"
                  style={{
                    height: '48px',
                    fontSize: '16px',
                    borderRadius: '12px',
                    borderColor: '#e0e0e0'
                  }}
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  style={{
                    height: '56px',
                    fontSize: '17px',
                    fontWeight: 500,
                    borderRadius: '28px',
                    background: primaryColor,
                    borderColor: primaryColor,
                    boxShadow: 'none',
                    border: 'none'
                  }}
                >
                  登入
                </Button>
              </Form.Item>
            </Form>

            {/* 註冊連結 */}
            <div style={{ textAlign: 'center' }}>
              <Text style={{ fontSize: '16px', color: mediumGray }}>
                還沒有帳號？{' '}
                <Link 
                  to="/register"
                  style={{ 
                    color: primaryColor,
                    fontWeight: 500,
                    textDecoration: 'none'
                  }}
                >
                  立即註冊
                </Link>
              </Text>
            </div>
          </Space>
        </Card>
      </div>
    </div>
  )
}
