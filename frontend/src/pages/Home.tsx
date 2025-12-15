import { Button, Card, Row, Col, Typography, Space, List, Tag } from 'antd'
import { useNavigate } from 'react-router-dom'
import { 
  RocketOutlined, 
  ThunderboltOutlined, 
  SafetyOutlined,
  CheckCircleOutlined,
  CheckOutlined,
  CrownOutlined
} from '@ant-design/icons'
import { useAuthStore } from '../store/authStore'

const { Title, Paragraph } = Typography

export default function Home() {
  const navigate = useNavigate()
  const { token } = useAuthStore()

  const features = [
    {
      icon: <ThunderboltOutlined style={{ fontSize: '48px', color: '#1890ff' }} />,
      title: '一鍵轉檔',
      description: '30 秒內完成蝦皮商品轉換，支援 momo、PChome 等多平台格式'
    },
    {
      icon: <RocketOutlined style={{ fontSize: '48px', color: '#52c41a' }} />,
      title: '智能解析',
      description: '自動解析商品資訊，無需手動輸入，節省 90% 時間'
    },
    {
      icon: <SafetyOutlined style={{ fontSize: '48px', color: '#faad14' }} />,
      title: '安全可靠',
      description: '本地處理，資料不外洩，符合個資法規範'
    }
  ]

  const benefits = [
    '無需安裝，瀏覽器即可使用',
    '支援批次處理多個商品',
    '自動格式轉換，符合各平台要求',
    '圖片自動優化與裁切',
    '免費版每日 10 件商品轉檔'
  ]

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Hero Section */}
      <div style={{ 
        textAlign: 'center', 
        padding: '80px 20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '8px',
        marginBottom: '60px',
        color: '#fff'
      }}>
        <Title level={1} style={{ color: '#fff', marginBottom: '20px' }}>
          電商跨平台自動化轉檔工具
        </Title>
        <Paragraph style={{ fontSize: '18px', color: '#fff', marginBottom: '40px' }}>
          一鍵將蝦皮商品轉換為 momo、PChome 等平台的 Excel 檔案<br />
          專為台灣小型電商賣家設計的輕量級 SaaS 工具
        </Paragraph>
        <Space size="large">
          <Button 
            type="primary" 
            size="large"
            onClick={() => navigate('/register')}
            style={{ height: '50px', fontSize: '16px', padding: '0 40px' }}
          >
            免費開始使用
          </Button>
          <Button 
            size="large"
            onClick={() => {
              document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' })
            }}
            style={{ height: '50px', fontSize: '16px', padding: '0 40px', background: '#fff' }}
          >
            查看價格方案
          </Button>
        </Space>
      </div>

      {/* Features */}
      <Row gutter={[24, 24]} style={{ marginBottom: '60px' }}>
        {features.map((feature, index) => (
          <Col xs={24} sm={24} md={8} key={index}>
            <Card 
              hoverable
              style={{ textAlign: 'center', height: '100%' }}
              bodyStyle={{ padding: '40px 20px' }}
            >
              <div style={{ marginBottom: '20px' }}>{feature.icon}</div>
              <Title level={4}>{feature.title}</Title>
              <Paragraph>{feature.description}</Paragraph>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Benefits */}
      <Card style={{ marginBottom: '60px' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '40px' }}>
          為什麼選擇 Shopee2Multi？
        </Title>
        <List
          dataSource={benefits}
          renderItem={(item) => (
            <List.Item>
              <Space>
                <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
                <span style={{ fontSize: '16px' }}>{item}</span>
              </Space>
            </List.Item>
          )}
        />
      </Card>

      {/* Pricing Section */}
      <div id="pricing-section" style={{ marginBottom: '60px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Title level={2}>價格方案</Title>
          <Paragraph style={{ fontSize: '16px' }}>
            選擇最適合您的方案，隨時可以升級或降級
          </Paragraph>
        </div>

        <Row gutter={[24, 24]}>
          {[
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
          ].map((plan, index) => (
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
                    onClick={() => {
                      if (!token) {
                        navigate('/register')
                      } else {
                        // TODO: Implement upgrade flow
                        alert('升級功能開發中')
                      }
                    }}
                  >
                    {plan.buttonText}
                  </Button>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* CTA */}
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <Title level={2}>準備開始了嗎？</Title>
        <Paragraph style={{ fontSize: '16px', marginBottom: '30px' }}>
          立即註冊，免費版每日可轉檔 10 件商品
        </Paragraph>
        <Button 
          type="primary" 
          size="large"
          onClick={() => navigate('/register')}
          style={{ height: '50px', fontSize: '16px', padding: '0 40px' }}
        >
          立即註冊
        </Button>
      </div>
    </div>
  )
}
