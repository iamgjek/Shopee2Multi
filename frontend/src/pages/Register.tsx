import { useState } from 'react'
import { Form, Input, Button, Card, Typography, Alert, Space } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useAuthStore } from '../store/authStore'

const { Title, Paragraph } = Typography

export default function Register() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onFinish = async (values: { email: string; password: string; name?: string }) => {
    setLoading(true)
    setError(null)

    try {
      const response = await api.post('/auth/register', values)
      const { token, user } = response.data.data
      setAuth(token, user)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.error?.message || '註冊失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      maxWidth: '400px', 
      margin: '60px auto',
      padding: '0 20px'
    }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <Title level={2}>註冊</Title>
            <Paragraph>建立您的 Shopee2Multi 帳號</Paragraph>
          </div>

          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              closable
              onClose={() => setError(null)}
            />
          )}

          <Form
            name="register"
            onFinish={onFinish}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="name"
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="姓名（選填）"
              />
            </Form.Item>

            <Form.Item
              name="email"
              rules={[
                { required: true, message: '請輸入電子郵件' },
                { type: 'email', message: '請輸入有效的電子郵件' }
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="電子郵件"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: '請輸入密碼' },
                { min: 6, message: '密碼至少需要 6 個字元' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="密碼（至少 6 個字元）"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
              >
                註冊
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: 'center' }}>
            <Paragraph>
              已經有帳號？ <Link to="/login">立即登入</Link>
            </Paragraph>
          </div>
        </Space>
      </Card>
    </div>
  )
}
