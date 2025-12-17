import { Button, Card, Row, Col, Typography, Divider } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const { Title, Paragraph, Text } = Typography

export default function Home() {
  const navigate = useNavigate()
  const { token } = useAuthStore()

  // 深藍色主題色（Material Design Blue 700）
  const primaryColor = '#1976d2'
  const darkGray = '#212121'
  const mediumGray = '#757575'

  // Section 通用樣式
  const sectionStyle = {
    padding: '100px 24px',
    textAlign: 'center' as const,
    maxWidth: '900px',
    margin: '0 auto'
  }

  const heroTitleStyle = {
    fontSize: '72px',
    fontWeight: 600,
    lineHeight: '1.1',
    color: darkGray,
    marginBottom: '24px',
    letterSpacing: '-2px'
  }

  const subtitleStyle = {
    fontSize: '28px',
    fontWeight: 400,
    color: mediumGray,
    marginBottom: '48px',
    lineHeight: '1.4'
  }

  const sectionTitleStyle = {
    fontSize: '48px',
    fontWeight: 600,
    color: darkGray,
    marginBottom: '16px',
    letterSpacing: '-1px'
  }

  const bodyTextStyle = {
    fontSize: '21px',
    lineHeight: '1.6',
    color: mediumGray,
    marginBottom: '24px'
  }

  const primaryButtonStyle = {
    height: '56px',
    fontSize: '17px',
    fontWeight: 500,
    padding: '0 48px',
    borderRadius: '28px',
    background: primaryColor,
    borderColor: primaryColor,
    boxShadow: 'none',
    border: 'none'
  }

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh' }}>
      {/* Hero Section */}
      <div style={sectionStyle}>
        <Title style={heroTitleStyle}>
          30 秒，從蝦皮到全平台。
        </Title>
        <Paragraph style={subtitleStyle}>
          一鍵轉檔，讓你的商品自由移動。
        </Paragraph>
        <Button 
          type="primary" 
          size="large"
          onClick={() => navigate(token ? '/convert' : '/register')}
          style={primaryButtonStyle}
        >
          立即開始免費試用
        </Button>
      </div>

      <Divider style={{ margin: '0', borderColor: '#f0f0f0' }} />

      {/* 從此告別手動上架 */}
      <div style={sectionStyle}>
        <Title level={2} style={sectionTitleStyle}>
          從此告別手動上架。
        </Title>
        <Paragraph style={bodyTextStyle}>
          你不該把時間浪費在複製貼上。
        </Paragraph>
        <Paragraph style={bodyTextStyle}>
          Shopee2Multi 讓商品轉檔變得極其簡單。貼上網址，30 秒內完成。<br />
          不需要學習複雜的系統，不需要昂貴的 ERP，更不需要外包。
        </Paragraph>
        <Paragraph style={{ ...bodyTextStyle, fontSize: '24px', fontWeight: 500, color: darkGray }}>
          只需要一個網址。
        </Paragraph>
      </div>

      <Divider style={{ margin: '0', borderColor: '#f0f0f0' }} />

      {/* 時間是你最寶貴的資產 */}
      <div style={sectionStyle}>
        <Title level={2} style={sectionTitleStyle}>
          時間，是你最寶貴的資產。
        </Title>
        <div style={{ marginTop: '60px' }}>
          <Row gutter={[48, 48]} justify="center">
            <Col xs={24} md={10}>
              <div style={{ fontSize: '64px', fontWeight: 700, color: mediumGray, marginBottom: '12px' }}>
                25 小時
              </div>
              <Text style={{ fontSize: '19px', color: mediumGray }}>傳統方式</Text>
            </Col>
            <Col xs={24} md={4} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '48px', color: mediumGray }}>→</div>
            </Col>
            <Col xs={24} md={10}>
              <div style={{ fontSize: '64px', fontWeight: 700, color: primaryColor, marginBottom: '12px' }}>
                50 分鐘
              </div>
              <Text style={{ fontSize: '19px', color: primaryColor, fontWeight: 500 }}>Shopee2Multi</Text>
            </Col>
          </Row>
          <Paragraph style={{ ...bodyTextStyle, marginTop: '48px' }}>
            100 件商品，從蝦皮搬到 momo。<br />
            省下的 24 小時，你可以做更重要的事。
          </Paragraph>
        </div>
      </div>

      <Divider style={{ margin: '0', borderColor: '#f0f0f0' }} />

      {/* 設計給像你一樣的賣家 */}
      <div style={sectionStyle}>
        <Title level={2} style={sectionTitleStyle}>
          設計給像你一樣的賣家。
        </Title>
        <Paragraph style={{ ...bodyTextStyle, marginTop: '48px' }}>
          <strong style={{ color: darkGray, fontSize: '24px' }}>你不需要懂技術。</strong>
        </Paragraph>
        <Paragraph style={bodyTextStyle}>
          不需要安裝軟體。<br />
          不需要設定參數。<br />
          不需要教育訓練。
        </Paragraph>
        <Paragraph style={{ ...bodyTextStyle, fontSize: '24px', fontWeight: 500, color: darkGray, marginTop: '36px' }}>
          打開瀏覽器，貼上網址，完成。
        </Paragraph>
      </div>

      <Divider style={{ margin: '0', borderColor: '#f0f0f0' }} />

      {/* 智能轉換 */}
      <div style={{ ...sectionStyle, padding: '100px 24px' }}>
        <Title level={2} style={sectionTitleStyle}>
          智能轉換，自動完成。
        </Title>
        <Row gutter={[48, 48]} style={{ marginTop: '60px' }}>
          <Col xs={24} md={8}>
            <Card 
              bordered={false}
              style={{ 
                background: '#fafafa', 
                borderRadius: '24px',
                height: '100%',
                textAlign: 'center',
                padding: '24px'
              }}
            >
              <Title level={4} style={{ fontSize: '24px', fontWeight: 600, color: darkGray, marginBottom: '16px' }}>
                AI 語意解析
              </Title>
              <Paragraph style={{ fontSize: '17px', color: mediumGray, lineHeight: '1.6' }}>
                蝦皮的短描述，自動轉換成 momo 需要的長文案。不用重寫，不用苦惱。
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card 
              bordered={false}
              style={{ 
                background: '#fafafa', 
                borderRadius: '24px',
                height: '100%',
                textAlign: 'center',
                padding: '24px'
              }}
            >
              <Title level={4} style={{ fontSize: '24px', fontWeight: 600, color: darkGray, marginBottom: '16px' }}>
                規格智能映射
              </Title>
              <Paragraph style={{ fontSize: '17px', color: mediumGray, lineHeight: '1.6' }}>
                單層規格變雙層。HTML 描述自動生成。圖片自動裁切符合平台尺寸。
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card 
              bordered={false}
              style={{ 
                background: '#fafafa', 
                borderRadius: '24px',
                height: '100%',
                textAlign: 'center',
                padding: '24px'
              }}
            >
              <Title level={4} style={{ fontSize: '24px', fontWeight: 600, color: darkGray, marginBottom: '16px' }}>
                支援全平台
              </Title>
              <Paragraph style={{ fontSize: '17px', color: mediumGray, lineHeight: '1.6', marginBottom: '8px' }}>
                momo 購物網<br />
                PChome 24h 購物<br />
                Coupang 酷澎
              </Paragraph>
              <Text style={{ fontSize: '15px', color: mediumGray, fontStyle: 'italic' }}>
                更多平台，持續擴展中
              </Text>
            </Card>
          </Col>
        </Row>
      </div>

      <Divider style={{ margin: '0', borderColor: '#f0f0f0' }} />

      {/* 價格方案 */}
      <div id="pricing-section" style={{ ...sectionStyle, padding: '100px 24px', maxWidth: '1200px' }}>
        <Title level={2} style={sectionTitleStyle}>
          價格不該是阻礙。
        </Title>
        <Row gutter={[32, 32]} style={{ marginTop: '60px' }}>
          {[
            {
              name: '免費版',
              price: 0,
              period: '月',
              features: [
                '每日 10 件商品轉檔',
                '基礎 Excel 匯出',
                '體驗核心功能'
              ],
              subtitle: '適合：剛起步的你',
              highlighted: false
            },
            {
              name: 'Pro 版',
              price: 299,
              period: '月',
              features: [
                '無限轉檔次數',
                '支援 momo / PChome 格式',
                '圖片自動裁切',
                '優先客服支援'
              ],
              subtitle: '適合：成長中的你',
              highlighted: true
            },
            {
              name: 'Biz 版',
              price: 599,
              period: '月',
              features: [
                'Pro 版所有功能',
                '支援 Coupang / Yahoo',
                '雲端備份',
                'API 整合（即將推出）'
              ],
              subtitle: '適合：多平台經營的你',
              highlighted: false
            }
          ].map((plan, index) => (
            <Col xs={24} md={8} key={index}>
              <Card
                bordered={false}
                style={{
                  height: '100%',
                  borderRadius: '24px',
                  background: plan.highlighted ? primaryColor : '#fafafa',
                  color: plan.highlighted ? '#ffffff' : darkGray,
                  padding: '16px',
                  boxShadow: plan.highlighted ? '0 12px 48px rgba(25, 118, 210, 0.25)' : 'none',
                  transform: plan.highlighted ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <Title 
                    level={3} 
                    style={{ 
                      fontSize: '28px', 
                      fontWeight: 600, 
                      color: plan.highlighted ? '#ffffff' : darkGray,
                      marginBottom: '8px'
                    }}
                  >
                    {plan.name}
                  </Title>
                  <div style={{ marginTop: '24px', marginBottom: '24px' }}>
                    <span style={{ 
                      fontSize: '56px', 
                      fontWeight: 700,
                      color: plan.highlighted ? '#ffffff' : darkGray
                    }}>
                      {plan.price}
                    </span>
                    <span style={{ 
                      fontSize: '21px',
                      color: plan.highlighted ? 'rgba(255, 255, 255, 0.85)' : mediumGray,
                      marginLeft: '8px'
                    }}>
                      NT$ / {plan.period}
                    </span>
                  </div>
                  
                  <div style={{ marginBottom: '32px', minHeight: '180px', textAlign: 'left', paddingLeft: '24px' }}>
                    {plan.features.map((feature, idx) => (
                      <div key={idx} style={{ 
                        marginBottom: '12px', 
                        fontSize: '17px',
                        color: plan.highlighted ? 'rgba(255, 255, 255, 0.95)' : mediumGray
                      }}>
                        • {feature}
                      </div>
                    ))}
                  </div>

                  <Text style={{ 
                    display: 'block',
                    fontSize: '15px',
                    color: plan.highlighted ? 'rgba(255, 255, 255, 0.85)' : mediumGray,
                    marginBottom: '24px',
                    fontStyle: 'italic'
                  }}>
                    {plan.subtitle}
                  </Text>

                  <Button
                    type={plan.highlighted ? 'default' : 'primary'}
                    size="large"
                    block
                    onClick={() => {
                      if (!token) {
                        navigate('/register')
                      } else {
                        alert('升級功能開發中')
                      }
                    }}
                    style={{
                      height: '48px',
                      fontSize: '17px',
                      fontWeight: 500,
                      borderRadius: '24px',
                      background: plan.highlighted ? '#ffffff' : primaryColor,
                      color: plan.highlighted ? primaryColor : '#ffffff',
                      borderColor: plan.highlighted ? '#ffffff' : primaryColor,
                      boxShadow: 'none',
                      border: 'none'
                    }}
                  >
                    {plan.price === 0 ? '立即開始' : '選擇方案'}
                  </Button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      <Divider style={{ margin: '0', borderColor: '#f0f0f0' }} />

      {/* 最終 CTA */}
      <div style={sectionStyle}>
        <Title level={2} style={sectionTitleStyle}>
          從今天開始，讓商品自由移動。
        </Title>
        <Paragraph style={bodyTextStyle}>
          不要被平台綁住。<br />
          不要被技術困住。<br />
          不要被時間限制。
        </Paragraph>
        <Paragraph style={{ ...bodyTextStyle, marginTop: '36px', marginBottom: '48px' }}>
          <strong style={{ fontSize: '28px', color: darkGray }}>30 秒，從蝦皮到全平台。</strong>
        </Paragraph>
        <Button 
          type="primary" 
          size="large"
          onClick={() => navigate(token ? '/convert' : '/register')}
          style={primaryButtonStyle}
        >
          立即開始免費試用
        </Button>
      </div>

      {/* Footer */}
      <div style={{ 
        textAlign: 'center', 
        padding: '48px 24px',
        background: '#fafafa',
        borderTop: '1px solid #f0f0f0'
      }}>
        <Text style={{ fontSize: '15px', color: mediumGray }}>
          技術為你服務，而非你為技術服務。
        </Text>
        <div style={{ marginTop: '12px' }}>
          <Text style={{ fontSize: '17px', fontWeight: 500, color: darkGray }}>
            Shopee2Multi — 你的電商擴展加速器
          </Text>
        </div>
      </div>
    </div>
  )
}
