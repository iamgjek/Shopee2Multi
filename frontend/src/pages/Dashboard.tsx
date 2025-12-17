import { useEffect, useState } from 'react'
import { Card, Typography, Row, Col, Table, Tag, Button } from 'antd'
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  ThunderboltOutlined,
  DownloadOutlined,
  CrownOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useAuthStore } from '../store/authStore'

const { Title, Text } = Typography

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [profile, setProfile] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // 深藍色主題色（Material Design Blue 700）
  const primaryColor = '#1976d2'
  const darkGray = '#212121'
  const mediumGray = '#757575'
  const lightGray = '#fafafa'

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [profileRes, historyRes] = await Promise.all([
        api.get('/user/profile'),
        api.get('/conversion/history')
      ])
      setProfile(profileRes.data.data)
      setHistory(historyRes.data.data)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = (taskId: string) => {
    window.open(`/api/conversion/download/${taskId}`, '_blank')
  }

  const getPlanName = () => {
    if (user?.plan === 'free') return '免費版'
    if (user?.plan === 'pro') return 'Pro 版'
    if (user?.plan === 'biz') return 'Biz 版'
    return '免費版'
  }

  const columns = [
    {
      title: '建立時間',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text: string) => (
        <Text style={{ fontSize: '15px', color: darkGray }}>
          {new Date(text).toLocaleString('zh-TW')}
        </Text>
      )
    },
    {
      title: '來源連結',
      dataIndex: 'source_url',
      key: 'source_url',
      ellipsis: true,
      render: (text: string) => (
        <Text style={{ fontSize: '15px', color: mediumGray }}>
          {text}
        </Text>
      )
    },
    {
      title: '目標平台',
      dataIndex: 'platform_target',
      key: 'platform_target',
      render: (platform: string) => {
        const configs: Record<string, { color: string; label: string }> = {
          momo: { color: primaryColor, label: 'momo' },
          pchome: { color: '#52c41a', label: 'PChome' },
          coupang: { color: '#fa8c16', label: 'Coupang' },
          yahoo: { color: '#722ed1', label: 'Yahoo' }
        }
        const config = configs[platform] || { color: primaryColor, label: platform }
        return (
          <Tag 
            style={{ 
              borderRadius: '12px',
              padding: '4px 12px',
              fontSize: '14px',
              fontWeight: 500,
              border: 'none',
              background: `${config.color}15`,
              color: config.color
            }}
          >
            {config.label}
          </Tag>
        )
      }
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig: Record<string, { color: string; bg: string; icon: any; text: string }> = {
          completed: { color: '#52c41a', bg: '#52c41a15', icon: <CheckCircleOutlined />, text: '完成' },
          failed: { color: '#ff4d4f', bg: '#ff4d4f15', icon: <CloseCircleOutlined />, text: '失敗' },
          processing: { color: primaryColor, bg: `${primaryColor}15`, icon: <ThunderboltOutlined />, text: '處理中' },
          pending: { color: mediumGray, bg: `${mediumGray}15`, icon: null, text: '等待中' }
        }
        const config = statusConfig[status] || statusConfig.pending
        return (
          <Tag 
            icon={config.icon}
            style={{ 
              borderRadius: '12px',
              padding: '4px 12px',
              fontSize: '14px',
              fontWeight: 500,
              border: 'none',
              background: config.bg,
              color: config.color
            }}
          >
            {config.text}
          </Tag>
        )
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        record.status === 'completed' && record.result_path ? (
          <Button
            type="text"
            icon={<DownloadOutlined />}
            onClick={() => handleDownload(record.id)}
            style={{
              color: primaryColor,
              fontWeight: 500,
              fontSize: '15px'
            }}
          >
            下載
          </Button>
        ) : null
      )
    }
  ]

  return (
    <div style={{ 
      background: '#ffffff', 
      minHeight: 'calc(100vh - 112px)',
      padding: '60px 24px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* 標題區 */}
        <div style={{ marginBottom: '48px' }}>
          <Title 
            level={1} 
            style={{ 
              fontSize: '48px',
              fontWeight: 600,
              color: darkGray,
              marginBottom: '8px',
              letterSpacing: '-1px'
            }}
          >
            儀表板
          </Title>
          <Text style={{ fontSize: '17px', color: mediumGray }}>
            查看你的轉檔統計與歷史記錄
          </Text>
        </div>

        {/* 統計卡片 */}
        <Row gutter={[24, 24]} style={{ marginBottom: '48px' }}>
          <Col xs={24} sm={12} md={8}>
            <Card
              bordered={false}
              style={{
                borderRadius: '24px',
                background: lightGray,
                height: '100%'
              }}
              bodyStyle={{ padding: '32px' }}
            >
              <div style={{ marginBottom: '12px' }}>
                <ThunderboltOutlined style={{ fontSize: '32px', color: primaryColor }} />
              </div>
              <Text style={{ 
                display: 'block',
                fontSize: '15px',
                color: mediumGray,
                marginBottom: '8px'
              }}>
                今日轉檔數
              </Text>
              <div>
                <span style={{ 
                  fontSize: '48px',
                  fontWeight: 700,
                  color: darkGray,
                  lineHeight: '1'
                }}>
                  {profile?.usage?.daily || 0}
                </span>
                <span style={{ 
                  fontSize: '24px',
                  color: mediumGray,
                  marginLeft: '8px'
                }}>
                  / {profile?.usage?.limit || 10}
                </span>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Card
              bordered={false}
              style={{
                borderRadius: '24px',
                background: user?.plan !== 'free' ? primaryColor : lightGray,
                height: '100%',
                cursor: user?.plan === 'free' ? 'pointer' : 'default'
              }}
              bodyStyle={{ padding: '32px' }}
              onClick={() => {
                if (user?.plan === 'free') {
                  navigate('/')
                  setTimeout(() => {
                    document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' })
                  }, 100)
                }
              }}
            >
              <div style={{ marginBottom: '12px' }}>
                <CrownOutlined style={{ 
                  fontSize: '32px', 
                  color: user?.plan !== 'free' ? '#ffffff' : primaryColor 
                }} />
              </div>
              <Text style={{ 
                display: 'block',
                fontSize: '15px',
                color: user?.plan !== 'free' ? 'rgba(255,255,255,0.85)' : mediumGray,
                marginBottom: '8px'
              }}>
                目前方案
              </Text>
              <div style={{ 
                fontSize: '36px',
                fontWeight: 700,
                color: user?.plan !== 'free' ? '#ffffff' : darkGray,
                lineHeight: '1',
                marginBottom: user?.plan === 'free' ? '12px' : 0
              }}>
                {getPlanName()}
              </div>
              {user?.plan === 'free' && (
                <Text style={{ 
                  fontSize: '14px',
                  color: primaryColor,
                  fontWeight: 500
                }}>
                  點擊升級方案 →
                </Text>
              )}
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Card
              bordered={false}
              style={{
                borderRadius: '24px',
                background: lightGray,
                height: '100%'
              }}
              bodyStyle={{ padding: '32px' }}
            >
              <div style={{ marginBottom: '12px' }}>
                <CheckCircleOutlined style={{ fontSize: '32px', color: '#52c41a' }} />
              </div>
              <Text style={{ 
                display: 'block',
                fontSize: '15px',
                color: mediumGray,
                marginBottom: '8px'
              }}>
                總轉檔次數
              </Text>
              <div style={{ 
                fontSize: '48px',
                fontWeight: 700,
                color: darkGray,
                lineHeight: '1'
              }}>
                {history.length}
              </div>
            </Card>
          </Col>
        </Row>

        {/* 轉檔歷史 */}
        <Card
          bordered={false}
          style={{
            borderRadius: '24px',
            background: '#ffffff',
            boxShadow: '0 2px 16px rgba(0, 0, 0, 0.08)'
          }}
          bodyStyle={{ padding: '32px' }}
        >
          <Title 
            level={3}
            style={{ 
              fontSize: '28px',
              fontWeight: 600,
              color: darkGray,
              marginBottom: '24px'
            }}
          >
            轉檔歷史
          </Title>
          <Table
            columns={columns}
            dataSource={history}
            rowKey="id"
            loading={loading}
            pagination={{ 
              pageSize: 10,
              showSizeChanger: false,
              style: { marginTop: '24px' }
            }}
            style={{
              fontSize: '15px'
            }}
          />
        </Card>
      </div>
    </div>
  )
}
