import { useEffect, useState } from 'react'
import { Card, Typography, Row, Col, Statistic, Table, Tag, Button } from 'antd'
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  ThunderboltOutlined,
  DownloadOutlined
} from '@ant-design/icons'
import api from '../api/client'
import { useAuthStore } from '../store/authStore'

const { Title } = Typography

export default function Dashboard() {
  const { user } = useAuthStore()
  const [profile, setProfile] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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

  const columns = [
    {
      title: '建立時間',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text: string) => new Date(text).toLocaleString('zh-TW')
    },
    {
      title: '來源連結',
      dataIndex: 'source_url',
      key: 'source_url',
      ellipsis: true
    },
    {
      title: '目標平台',
      dataIndex: 'platform_target',
      key: 'platform_target',
      render: (platform: string) => {
        const colors: Record<string, string> = {
          momo: 'blue',
          pchome: 'green',
          coupang: 'orange',
          yahoo: 'purple'
        }
        return <Tag color={colors[platform]}>{platform.toUpperCase()}</Tag>
      }
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig: Record<string, { color: string; icon: any; text: string }> = {
          completed: { color: 'success', icon: <CheckCircleOutlined />, text: '完成' },
          failed: { color: 'error', icon: <CloseCircleOutlined />, text: '失敗' },
          processing: { color: 'processing', icon: <ThunderboltOutlined />, text: '處理中' },
          pending: { color: 'default', icon: null, text: '等待中' }
        }
        const config = statusConfig[status] || statusConfig.pending
        return <Tag color={config.color} icon={config.icon}>{config.text}</Tag>
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        record.status === 'completed' && record.result_path ? (
          <Button
            type="link"
            icon={<DownloadOutlined />}
            onClick={() => handleDownload(record.id)}
          >
            下載
          </Button>
        ) : null
      )
    }
  ]

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={2}>儀表板</Title>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="今日轉檔數"
              value={profile?.usage?.daily || 0}
              suffix={`/ ${profile?.usage?.limit || 10}`}
              prefix={<ThunderboltOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="目前方案"
              value={user?.plan === 'free' ? '免費版' : user?.plan === 'pro' ? '專業版' : '商業版'}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="總轉檔次數"
              value={history.length}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Title level={4}>轉檔歷史</Title>
        <Table
          columns={columns}
          dataSource={history}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  )
}
