import { Button, Card, Row, Col, Typography, Divider, Form, Input, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useEffect, useRef, useState } from 'react'
import { 
  ThunderboltOutlined, 
  RocketOutlined, 
  ClockCircleOutlined,
  CheckCircleOutlined,
  BulbOutlined,
  SettingOutlined,
  GlobalOutlined,
  FileTextOutlined,
  ScissorOutlined,
  ArrowRightOutlined,
  MailOutlined,
  UserOutlined,
  MessageOutlined
} from '@ant-design/icons'
import SEO from '../components/SEO'
import api from '../api/client'

const { Title, Paragraph, Text } = Typography

export default function Home() {
  const navigate = useNavigate()
  const { token } = useAuthStore()
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)
  
  // 為需要視差效果的 section 創建 refs
  const section1Ref = useRef<HTMLDivElement>(null)
  const section2Ref = useRef<HTMLDivElement>(null)
  const section3Ref = useRef<HTMLDivElement>(null)
  const section4Ref = useRef<HTMLDivElement>(null)
  const section5Ref = useRef<HTMLDivElement>(null)
  const section6Ref = useRef<HTMLDivElement>(null)

  // 滾動視差效果 - 優化性能版本
  useEffect(() => {
    const sections = [
      section1Ref,
      section2Ref,
      section3Ref,
      section4Ref,
      section5Ref,
      section6Ref
    ]

    // 使用 requestAnimationFrame 優化滾動性能
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY || window.pageYOffset
          const windowHeight = window.innerHeight
          
          sections.forEach((ref) => {
            if (ref.current) {
              const rect = ref.current.getBoundingClientRect()
              // 只在元素接近視窗時應用視差（減少計算）
              if (rect.top < windowHeight * 1.5 && rect.bottom > -windowHeight * 0.5) {
                const elementTop = rect.top + scrollY
                const elementCenter = elementTop + rect.height / 2
                const viewportCenter = scrollY + windowHeight / 2
                const distanceFromCenter = viewportCenter - elementCenter
                const parallaxSpeed = 0.3
                const parallaxOffset = distanceFromCenter * parallaxSpeed
                ref.current.style.transform = `translateY(${parallaxOffset}px)`
              } else {
                // 元素遠離視窗時重置位置
                ref.current.style.transform = 'translateY(0px)'
              }
            }
          })
          ticking = false
        })
        ticking = true
      }
    }

    // 使用 passive 事件監聽器提升滾動性能
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll, { passive: true })
    handleScroll() // 初始調用以設置初始位置

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  // Dark mode 主題色（黑/綠色）
  const primaryColor = '#00ff88' // 亮綠色
  const primaryColorDark = '#00cc6a' // 深綠色
  const darkBg = '#0a0a0a' // 深黑色背景
  const darkCardBg = '#1a1a1a' // 卡片背景
  const darkText = '#ffffff' // 白色文字
  const darkTextSecondary = '#a0a0a0' // 次要文字
  const darkBorder = '#2a2a2a' // 邊框顏色

  // Section 通用樣式
  const sectionStyle = {
    padding: '120px 24px',
    textAlign: 'center' as const,
    maxWidth: '900px',
    margin: '0 auto',
    position: 'relative' as const
  }

  const heroTitleStyle = {
    fontSize: '72px',
    fontWeight: 700,
    lineHeight: '1.1',
    color: darkText,
    marginBottom: '24px',
    letterSpacing: '-2px',
    textShadow: '0 0 20px rgba(0, 255, 136, 0.3)'
  }

  const subtitleStyle = {
    fontSize: '28px',
    fontWeight: 400,
    color: darkTextSecondary,
    marginBottom: '48px',
    lineHeight: '1.4'
  }

  const sectionTitleStyle = {
    fontSize: '48px',
    fontWeight: 600,
    color: darkText,
    marginBottom: '16px',
    letterSpacing: '-1px'
  }

  const bodyTextStyle = {
    fontSize: '21px',
    lineHeight: '1.6',
    color: darkTextSecondary,
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
    color: darkBg,
    boxShadow: '0 4px 20px rgba(0, 255, 136, 0.4)',
    border: 'none',
    transition: 'all 0.3s ease'
  }

  return (
    <div style={{ background: darkBg, minHeight: '100vh', color: darkText }}>
      <SEO
        title="Shopee2Multi - 30秒從蝦皮到全平台 | 電商跨平台自動化轉檔"
        description="30秒從蝦皮到全平台，一鍵轉檔讓商品自由移動。支援 momo、PChome、EasyStore、Coupang 等平台，智能轉換商品格式，節省 24 小時上架時間。免費試用，立即開始！"
        keywords="蝦皮轉檔,電商轉檔,商品轉檔,momo轉檔,PChome轉檔,EasyStore轉檔,Coupang轉檔,電商自動化,商品上架,跨平台轉檔,蝦皮商品轉換,電商工具"
        ogTitle="Shopee2Multi - 30秒從蝦皮到全平台"
        ogDescription="一鍵轉檔，讓你的商品自由移動。支援 momo、PChome、EasyStore、Coupang 等平台，智能轉換商品格式。"
      />
      {/* Hero Section - 全屏背景 */}
      <div 
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          backgroundImage: 'url(https://images.unsplash.com/photo-1557804506-669a67965ba3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=75)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          willChange: 'transform'
        }}
      >
        {/* 深色遮罩層 */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(10, 10, 10, 0.85) 0%, rgba(0, 0, 0, 0.9) 100%)',
          zIndex: 1
        }} />
        
        {/* 速度感光效 */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(90deg, transparent 0%, rgba(0, 255, 136, 0.1) 50%, transparent 100%)',
          animation: 'speedSweep 3s ease-in-out infinite',
          zIndex: 2
        }} />

        <div style={{
          position: 'relative',
          zIndex: 3,
          textAlign: 'center',
          padding: '120px 24px',
          maxWidth: '900px',
          width: '100%'
        }} className="fade-in-up">
          <Title style={heroTitleStyle}>
            30 秒，從蝦皮到全平台
          </Title>
          <Paragraph style={subtitleStyle}>
            一鍵轉檔，讓你的商品自由移動
          </Paragraph>
          <Button 
            type="primary" 
            size="large"
            onClick={() => navigate(token ? '/converter' : '/register')}
            style={primaryButtonStyle}
            icon={<RocketOutlined />}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)'
              e.currentTarget.style.boxShadow = '0 6px 30px rgba(0, 255, 136, 0.6)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 255, 136, 0.4)'
            }}
          >
            立即開始免費試用
          </Button>
        </div>
      </div>

      <Divider style={{ margin: '0', borderColor: darkBorder }} />

      {/* 從此告別手動上架 */}
      <div ref={section1Ref} style={{ ...sectionStyle, animationDelay: '0.1s' }} className="fade-in-up parallax-section">
        <Title level={2} style={sectionTitleStyle}>
          從此告別手動上架
        </Title>
        <Paragraph style={bodyTextStyle}>
          你不該把時間浪費在複製貼上
        </Paragraph>
        <Paragraph style={bodyTextStyle}>
          Shopee2Multi 讓商品轉檔變得極其簡單貼上網址，30 秒內完成<br />
          不需要學習複雜的系統，不需要昂貴的 ERP，更不需要外包
        </Paragraph>
        <Paragraph style={{ ...bodyTextStyle, fontSize: '24px', fontWeight: 500, color: primaryColor }}>
          只需要一個網址
        </Paragraph>
      </div>

      <Divider style={{ margin: '0', borderColor: darkBorder }} />

      {/* 時間是你最寶貴的資產 */}
      <div ref={section2Ref} style={{ ...sectionStyle, animationDelay: '0.2s' }} className="fade-in-up parallax-section">
        <Title level={2} style={sectionTitleStyle}>
          時間，是你最寶貴的資產
        </Title>
        <div style={{ marginTop: '60px' }}>
          <Row gutter={[48, 48]} justify="center">
            <Col xs={24} md={10} style={{ animationDelay: '0.3s' }} className="fade-in-up">
              <ClockCircleOutlined style={{ fontSize: '48px', color: darkTextSecondary, marginBottom: '16px' }} />
              <div style={{ fontSize: '64px', fontWeight: 700, color: darkTextSecondary, marginBottom: '12px' }}>
                25 小時
              </div>
              <Text style={{ fontSize: '19px', color: darkTextSecondary }}>傳統方式</Text>
            </Col>
            <Col xs={24} md={4} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowRightOutlined style={{ fontSize: '48px', color: primaryColor }} />
            </Col>
            <Col xs={24} md={10} style={{ animationDelay: '0.4s' }} className="fade-in-up">
              <ThunderboltOutlined style={{ fontSize: '48px', color: primaryColor, marginBottom: '16px' }} />
              <div style={{ fontSize: '64px', fontWeight: 700, color: primaryColor, marginBottom: '12px' }}>
                50 分鐘
              </div>
              <Text style={{ fontSize: '19px', color: primaryColor, fontWeight: 500 }}>Shopee2Multi</Text>
            </Col>
          </Row>
          <Paragraph style={{ ...bodyTextStyle, marginTop: '48px' }}>
            100 件商品，從蝦皮搬到 momo<br />
            省下的 24 小時，你可以做更重要的事
          </Paragraph>
        </div>
      </div>

      <Divider style={{ margin: '0', borderColor: darkBorder }} />

      {/* 設計給像你一樣的賣家 */}
      <div ref={section3Ref} style={{ ...sectionStyle, animationDelay: '0.3s' }} className="fade-in-up parallax-section">
        <Title level={2} style={sectionTitleStyle}>
          設計給像你一樣的賣家
        </Title>
        <Paragraph style={{ ...bodyTextStyle, marginTop: '48px' }}>
          <strong style={{ color: primaryColor, fontSize: '24px' }}>你不需要懂技術</strong>
        </Paragraph>
        <Row gutter={[32, 24]} justify="center" style={{ marginTop: '48px', maxWidth: '900px', marginLeft: 'auto', marginRight: 'auto' }}>
          <Col xs={24} sm={8} style={{ animationDelay: '0.4s' }} className="fade-in-up">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <CheckCircleOutlined style={{ fontSize: '32px', color: primaryColor }} />
              <Text style={{ fontSize: '17px', color: darkTextSecondary, textAlign: 'center' }}>不需要安裝軟體</Text>
            </div>
          </Col>
          <Col xs={24} sm={8} style={{ animationDelay: '0.5s' }} className="fade-in-up">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <CheckCircleOutlined style={{ fontSize: '32px', color: primaryColor }} />
              <Text style={{ fontSize: '17px', color: darkTextSecondary, textAlign: 'center' }}>不需要設定參數</Text>
            </div>
          </Col>
          <Col xs={24} sm={8} style={{ animationDelay: '0.6s' }} className="fade-in-up">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <CheckCircleOutlined style={{ fontSize: '32px', color: primaryColor }} />
              <Text style={{ fontSize: '17px', color: darkTextSecondary, textAlign: 'center' }}>不需要教育訓練</Text>
            </div>
          </Col>
        </Row>
        <Paragraph style={{ ...bodyTextStyle, fontSize: '24px', fontWeight: 500, color: primaryColor, marginTop: '36px' }}>
          打開瀏覽器，貼上網址，完成
        </Paragraph>
      </div>

      <Divider style={{ margin: '0', borderColor: darkBorder }} />

      {/* 智能轉換 */}
      <div ref={section4Ref} style={{ ...sectionStyle, padding: '120px 24px' }} className="parallax-section">
        <Title level={2} style={sectionTitleStyle}>
          智能轉換，自動完成
        </Title>
        <Row gutter={[48, 48]} style={{ marginTop: '60px' }}>
          <Col xs={24} md={8} style={{ animationDelay: '0.1s' }} className="fade-in-up">
            <Card 
              bordered={false}
              style={{ 
                background: darkCardBg, 
                borderRadius: '24px',
                height: '100%',
                textAlign: 'center',
                padding: '32px 24px',
                border: `1px solid ${darkBorder}`,
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)'
                e.currentTarget.style.borderColor = primaryColor
                e.currentTarget.style.boxShadow = `0 16px 32px rgba(0, 255, 136, 0.15)`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.borderColor = darkBorder
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <BulbOutlined style={{ fontSize: '48px', color: primaryColor, marginBottom: '24px' }} />
              <Title level={4} style={{ fontSize: '24px', fontWeight: 600, color: darkText, marginBottom: '16px' }}>
                AI 語意解析
              </Title>
              <Paragraph style={{ fontSize: '17px', color: darkTextSecondary, lineHeight: '1.6' }}>
                蝦皮的短描述，自動轉換成 momo 需要的長文案不用重寫，不用苦惱
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={8} style={{ animationDelay: '0.2s' }} className="fade-in-up">
            <Card 
              bordered={false}
              style={{ 
                background: darkCardBg, 
                borderRadius: '24px',
                height: '100%',
                textAlign: 'center',
                padding: '32px 24px',
                border: `1px solid ${darkBorder}`,
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)'
                e.currentTarget.style.borderColor = primaryColor
                e.currentTarget.style.boxShadow = `0 16px 32px rgba(0, 255, 136, 0.15)`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.borderColor = darkBorder
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <SettingOutlined style={{ fontSize: '48px', color: primaryColor, marginBottom: '24px' }} />
              <Title level={4} style={{ fontSize: '24px', fontWeight: 600, color: darkText, marginBottom: '16px' }}>
                規格智能映射
              </Title>
              <Paragraph style={{ fontSize: '17px', color: darkTextSecondary, lineHeight: '1.6' }}>
                單層規格變雙層<br />
                <FileTextOutlined style={{ fontSize: '20px', margin: '8px 4px 0' }} /> HTML 描述自動生成<br />
                <ScissorOutlined style={{ fontSize: '20px', margin: '8px 4px 0' }} /> 圖片自動裁切符合平台尺寸
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={8} style={{ animationDelay: '0.3s' }} className="fade-in-up">
            <Card 
              bordered={false}
              style={{ 
                background: darkCardBg, 
                borderRadius: '24px',
                height: '100%',
                textAlign: 'center',
                padding: '32px 24px',
                border: `1px solid ${darkBorder}`,
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)'
                e.currentTarget.style.borderColor = primaryColor
                e.currentTarget.style.boxShadow = `0 16px 32px rgba(0, 255, 136, 0.15)`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.borderColor = darkBorder
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <GlobalOutlined style={{ fontSize: '48px', color: primaryColor, marginBottom: '24px' }} />
              <Title level={4} style={{ fontSize: '24px', fontWeight: 600, color: darkText, marginBottom: '16px' }}>
                支援全平台
              </Title>
              <Paragraph style={{ fontSize: '17px', color: darkTextSecondary, lineHeight: '1.6', marginBottom: '8px' }}>
                momo 購物網<br />
                PChome 24h 購物<br />
                EasyStore<br />
                Coupang 酷澎
              </Paragraph>
              <Text style={{ fontSize: '15px', color: darkTextSecondary, fontStyle: 'italic' }}>
                更多平台，持續擴展中
              </Text>
            </Card>
          </Col>
        </Row>
      </div>

      <Divider style={{ margin: '0', borderColor: darkBorder }} />

      {/* 價格方案 */}
      <div id="pricing-section" ref={section5Ref} style={{ ...sectionStyle, padding: '120px 24px', maxWidth: '1200px', animationDelay: '0.4s' }} className="fade-in-up parallax-section">
        <Title level={2} style={sectionTitleStyle}>
          價格不該是阻礙
        </Title>
        <Row gutter={[32, 32]} style={{ marginTop: '60px' }}>
          {[
            {
              name: '免費版',
              price: 0,
              period: '月',
              features: [
                '每月 10 件商品轉檔',
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
                '支援 momo / PChome / EasyStore 格式',
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
            <Col xs={24} md={8} key={index} style={{ animationDelay: `${0.5 + index * 0.1}s` as any }} className="fade-in-up">
              <Card
                bordered={false}
                style={{
                  height: '100%',
                  borderRadius: '24px',
                  background: plan.highlighted ? `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColorDark} 100%)` : darkCardBg,
                  color: plan.highlighted ? darkBg : darkText,
                  padding: '16px',
                  boxShadow: plan.highlighted ? '0 12px 48px rgba(0, 255, 136, 0.3)' : 'none',
                  border: `1px solid ${plan.highlighted ? primaryColor : darkBorder}`,
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
                      color: plan.highlighted ? darkBg : darkText,
                      marginBottom: '8px'
                    }}
                  >
                    {plan.name}
                  </Title>
                  <div style={{ marginTop: '24px', marginBottom: '24px' }}>
                    <span style={{ 
                      fontSize: '56px', 
                      fontWeight: 700,
                      color: plan.highlighted ? darkBg : darkText
                    }}>
                      {plan.price}
                    </span>
                    <span style={{ 
                      fontSize: '21px',
                      color: plan.highlighted ? 'rgba(10, 10, 10, 0.7)' : darkTextSecondary,
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
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: plan.highlighted ? 'rgba(10, 10, 10, 0.9)' : darkTextSecondary
                      }}>
                        <CheckCircleOutlined style={{ fontSize: '16px', color: plan.highlighted ? darkBg : primaryColor }} />
                        {feature}
                      </div>
                    ))}
                  </div>

                  <Text style={{ 
                    display: 'block',
                    fontSize: '15px',
                    color: plan.highlighted ? 'rgba(10, 10, 10, 0.7)' : darkTextSecondary,
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
                      background: plan.highlighted ? darkBg : primaryColor,
                      color: plan.highlighted ? primaryColor : darkBg,
                      borderColor: plan.highlighted ? darkBg : primaryColor,
                      boxShadow: plan.highlighted ? 'none' : '0 4px 16px rgba(0, 255, 136, 0.3)',
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

      <Divider style={{ margin: '0', borderColor: darkBorder }} />

      {/* 最終 CTA */}
      <div ref={section6Ref} style={{ ...sectionStyle, animationDelay: '0.5s' }} className="fade-in-up parallax-section">
        <Title level={2} style={sectionTitleStyle}>
          從今天開始，讓商品自由移動
        </Title>
        <Row gutter={[32, 24]} justify="center" style={{ marginTop: '48px', maxWidth: '900px', marginLeft: 'auto', marginRight: 'auto' }}>
          <Col xs={24} sm={8} style={{ animationDelay: '0.6s' }} className="fade-in-up">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <CheckCircleOutlined style={{ fontSize: '32px', color: primaryColor }} />
              <Text style={{ fontSize: '17px', color: darkTextSecondary, textAlign: 'center' }}>不要被平台綁住</Text>
            </div>
          </Col>
          <Col xs={24} sm={8} style={{ animationDelay: '0.7s' }} className="fade-in-up">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <CheckCircleOutlined style={{ fontSize: '32px', color: primaryColor }} />
              <Text style={{ fontSize: '17px', color: darkTextSecondary, textAlign: 'center' }}>不要被技術困住</Text>
            </div>
          </Col>
          <Col xs={24} sm={8} style={{ animationDelay: '0.8s' }} className="fade-in-up">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <CheckCircleOutlined style={{ fontSize: '32px', color: primaryColor }} />
              <Text style={{ fontSize: '17px', color: darkTextSecondary, textAlign: 'center' }}>不要被時間限制</Text>
            </div>
          </Col>
        </Row>
        <Paragraph style={{ ...bodyTextStyle, marginTop: '36px', marginBottom: '48px' }}>
          <strong style={{ fontSize: '28px', color: primaryColor }}>30 秒，從蝦皮到全平台</strong>
        </Paragraph>
        <Button 
          type="primary" 
          size="large"
          onClick={() => navigate(token ? '/converter' : '/register')}
          style={primaryButtonStyle}
          icon={<RocketOutlined />}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)'
            e.currentTarget.style.boxShadow = '0 6px 30px rgba(0, 255, 136, 0.6)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 255, 136, 0.4)'
          }}
        >
          立即開始免費試用
        </Button>
      </div>

      <Divider style={{ margin: '0', borderColor: darkBorder }} />

      {/* 聯絡我們 */}
      <div style={{ ...sectionStyle, padding: '120px 24px', maxWidth: '800px' }} className="fade-in-up">
        <Title level={2} style={sectionTitleStyle}>
          聯絡我們
        </Title>
        <Paragraph style={bodyTextStyle}>
          有任何問題或建議？我們很樂意聽到您的聲音
        </Paragraph>
        
        <Card
          bordered={false}
          style={{
            borderRadius: '24px',
            background: darkCardBg,
            border: `1px solid ${darkBorder}`,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            marginTop: '48px'
          }}
          bodyStyle={{ padding: '48px' }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={async (values) => {
              setSubmitting(true)
              try {
                const response = await api.post('/contact/submit', {
                  name: values.name,
                  email: values.email,
                  subject: values.subject,
                  message: values.message
                })
                message.success(response.data.data.message || '訊息已送出！我們會盡快回覆您。')
                form.resetFields()
              } catch (error: any) {
                const errorMessage = error.response?.data?.error?.message || '送出失敗，請稍後再試'
                message.error(errorMessage)
              } finally {
                setSubmitting(false)
              }
            }}
          >
            <Form.Item
              name="name"
              rules={[{ required: true, message: '請輸入您的姓名' }]}
            >
              <Input
                prefix={<UserOutlined style={{ color: darkTextSecondary }} />}
                placeholder="姓名"
                size="large"
                style={{
                  height: '48px',
                  fontSize: '16px',
                  borderRadius: '12px',
                  borderColor: darkBorder,
                  background: darkBg,
                  color: darkText
                }}
              />
            </Form.Item>

            <Form.Item
              name="email"
              rules={[
                { required: true, message: '請輸入您的電子郵件' },
                { type: 'email', message: '請輸入有效的電子郵件' }
              ]}
            >
              <Input
                prefix={<MailOutlined style={{ color: darkTextSecondary }} />}
                placeholder="電子郵件"
                size="large"
                style={{
                  height: '48px',
                  fontSize: '16px',
                  borderRadius: '12px',
                  borderColor: darkBorder,
                  background: darkBg,
                  color: darkText
                }}
              />
            </Form.Item>

            <Form.Item
              name="subject"
              rules={[{ required: true, message: '請輸入主旨' }]}
            >
              <Input
                prefix={<MessageOutlined style={{ color: darkTextSecondary }} />}
                placeholder="主旨"
                size="large"
                style={{
                  height: '48px',
                  fontSize: '16px',
                  borderRadius: '12px',
                  borderColor: darkBorder,
                  background: darkBg,
                  color: darkText
                }}
              />
            </Form.Item>

            <Form.Item
              name="message"
              rules={[{ required: true, message: '請輸入您的訊息' }]}
            >
              <Input.TextArea
                rows={6}
                placeholder="請輸入您的訊息..."
                style={{
                  fontSize: '16px',
                  borderRadius: '12px',
                  borderColor: darkBorder,
                  background: darkBg,
                  color: darkText,
                  padding: '16px'
                }}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={submitting}
                block
                style={{
                  height: '56px',
                  fontSize: '17px',
                  fontWeight: 500,
                  borderRadius: '28px',
                  background: primaryColor,
                  borderColor: primaryColor,
                  color: darkBg,
                  boxShadow: '0 4px 20px rgba(0, 255, 136, 0.4)',
                  border: 'none'
                }}
              >
                {submitting ? '送出中...' : '送出訊息'}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>

      {/* Footer */}
      <div style={{ 
        textAlign: 'center', 
        padding: '48px 24px',
        background: darkCardBg,
        borderTop: `1px solid ${darkBorder}`
      }}>
        <Text style={{ fontSize: '15px', color: darkTextSecondary }}>
          技術為你服務，而非你為技術服務
        </Text>
        <div style={{ marginTop: '12px' }}>
          <Text style={{ fontSize: '17px', fontWeight: 500, color: darkText }}>
            Shopee2Multi — 你的電商擴展加速器
          </Text>
        </div>
      </div>
    </div>
  )
}
