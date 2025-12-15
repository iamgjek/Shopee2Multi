import { Card, Row, Col, Typography, Button, List, Space, Tag } from 'antd'
import { CheckOutlined, CrownOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const { Title, Paragraph } = Typography

export default function Pricing() {
  const navigate = useNavigate()
  const { token } = useAuthStore()

  const plans = [
    {
      name: '免費版',
      plan: 'free',
      price: 0,
      period: '永久免費',
      features: [
        '每日 10 件商品轉檔',
        'Excel 匯出功能',
        '基本商品解析',
        '社群支援'
      ],
      buttonText: '立即開始',
      popular: false
    },
    {
      name: '專業版',
      plan: 'pro',
      price: 299,
      period: '每月',
      features: [
        '無限商品轉檔',
        '支援 momo 購物網',
        '支援 PChome 24h',
        '圖片自動裁切',
        '優先客服支援'
      ],
      buttonText: '升級專業版',
      popular: true
    },
    {
      name: '商業版',
      plan: 'biz',
      price: 599,
      period: '每月',
      features: [
        '專業版所有功能',
        '支援 Coupang 酷澎',
        '支援 Yahoo 購物中心',
        '雲端備份',
        '專屬客服支援',
        'API 存取（未來）'
      ],
      buttonText: '升級商業版',
      popular: false
    }
  ]

  const handleUpgrade = (plan: string) => {
    if (!token) {
      navigate('/register')
    } else {
      // TODO: Implement upgrade flow
      alert('升級功能開發中')
    }
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <Title level={1}>價格方案</Title>
        <Paragraph style={{ fontSize: '16px' }}>
          選擇最適合您的方案，隨時可以升級或降級
        </Paragraph>
      </div>

      <Row gutter={[24, 24]}>
        {plans.map((plan, index) => (
          <Col xs={24} sm={24} md={8} key={index}>
            <Card
              style={{
                height: '100%',
                position: 'relative',
                border: plan.popular ? '2px solid #1890ff' : '1px solid #d9d9d9'
              }}
              bodyStyle={{ padding: '32px' }}
            >
              {plan.popular && (
                <Tag
                  color="blue"
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px'
                  }}
                >
                  <CrownOutlined /> 推薦
                </Tag>
              )}

              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div>
                  <Title level={3}>{plan.name}</Title>
                  <div style={{ marginTop: '16px' }}>
                    <span style={{ fontSize: '36px', fontWeight: 'bold' }}>
                      NT$ {plan.price}
                    </span>
                    {plan.price > 0 && (
                      <span style={{ color: '#8c8c8c', marginLeft: '8px' }}>
                        / {plan.period}
                      </span>
                    )}
                  </div>
                </div>

                <List
                  dataSource={plan.features}
                  renderItem={(item) => (
                    <List.Item style={{ border: 'none', padding: '8px 0' }}>
                      <Space>
                        <CheckOutlined style={{ color: '#52c41a' }} />
                        <span>{item}</span>
                      </Space>
                    </List.Item>
                  )}
                />

                <Button
                  type={plan.popular ? 'primary' : 'default'}
                  size="large"
                  block
                  onClick={() => handleUpgrade(plan.plan)}
                >
                  {plan.buttonText}
                </Button>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      <Card style={{ marginTop: '60px', textAlign: 'center' }}>
        <Title level={3}>常見問題</Title>
        <Paragraph>
          如有任何問題，請聯繫客服或查看使用說明
        </Paragraph>
      </Card>
    </div>
  )
}
