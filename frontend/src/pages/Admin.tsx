import { useEffect, useState } from 'react'
import { 
  Card, 
  Table, 
  Typography, 
  Tag, 
  Button, 
  Select, 
  Input, 
  Space, 
  Row, 
  Col,
  Statistic,
  Modal,
  message,
  Tabs
} from 'antd'
import { 
  CrownOutlined, 
  SearchOutlined,
  EditOutlined,
  ReloadOutlined
} from '@ant-design/icons'
import api from '../api/client'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'
import SEO from '../components/SEO'

const { Title, Text } = Typography

interface User {
  id: string
  email: string
  name?: string
  plan: 'free' | 'pro' | 'biz'
  status: 'active' | 'suspended' | 'deleted'
  role: 'user' | 'admin'
  created_at: string
  stats?: {
    dailyUsage: number
    totalTasks: number
  }
}

export default function Admin() {
  const navigate = useNavigate()
  const { user: currentUser } = useAuthStore()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 })
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editForm, setEditForm] = useState({ plan: 'free', status: 'active', role: 'user' })
  const [stats, setStats] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('users')

  // Dark mode 主題色
  const primaryColor = '#00ff88'
  const darkBg = '#0a0a0a'
  const darkCardBg = '#1a1a1a'
  const darkText = '#ffffff'
  const darkTextSecondary = '#a0a0a0'
  const darkBorder = '#2a2a2a'

  useEffect(() => {
    // Check if user is admin
    if (currentUser?.role !== 'admin') {
      navigate('/dashboard')
      return
    }
  }, [currentUser, navigate])

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      loadData()
    }
  }, [pagination.page, searchText])

  const loadData = async () => {
    try {
      setLoading(true)
      const [usersRes, statsRes] = await Promise.all([
        api.get(`/admin/users?page=${pagination.page}&limit=${pagination.limit}&search=${searchText || ''}`),
        api.get('/admin/stats/plans')
      ])
      setUsers(usersRes.data.data.users)
      setPagination(prev => ({
        ...prev,
        total: usersRes.data.data.pagination.total
      }))
      setStats(statsRes.data.data)
    } catch (error: any) {
      message.error(error.response?.data?.error?.message || '載入失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setEditForm({
      plan: user.plan,
      status: user.status,
      role: user.role
    })
    setEditModalVisible(true)
  }

  const handleUpdate = async () => {
    if (!selectedUser) return

    try {
      await api.patch(`/admin/users/${selectedUser.id}`, editForm)
      message.success('用戶更新成功')
      setEditModalVisible(false)
      loadData()
    } catch (error: any) {
      message.error(error.response?.data?.error?.message || '更新失敗')
    }
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'free': return '#a0a0a0'
      case 'pro': return '#00ff88'
      case 'biz': return '#00cc6a'
      default: return '#a0a0a0'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#00ff88'
      case 'suspended': return '#fa8c16'
      case 'deleted': return '#ff4d4f'
      default: return '#a0a0a0'
    }
  }

  const columns = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (text: string) => <Text style={{ color: darkText }}>{text}</Text>
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text style={{ color: darkTextSecondary }}>{text || '-'}</Text>
    },
    {
      title: '方案',
      dataIndex: 'plan',
      key: 'plan',
      render: (plan: string) => (
        <Tag color={getPlanColor(plan)} style={{ border: 'none' }}>
          {plan === 'free' ? '免費版' : plan === 'pro' ? 'Pro 版' : 'Biz 版'}
        </Tag>
      )
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)} style={{ border: 'none' }}>
          {status === 'active' ? '啟用' : status === 'suspended' ? '暫停' : '已刪除'}
        </Tag>
      )
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'admin' ? primaryColor : darkTextSecondary} style={{ border: 'none' }}>
          {role === 'admin' ? '管理員' : '用戶'}
        </Tag>
      )
    },
    {
      title: '今日使用',
      key: 'dailyUsage',
      render: (_: any, record: User) => (
        <Text style={{ color: darkTextSecondary }}>
          {record.stats?.dailyUsage || 0}
        </Text>
      )
    },
    {
      title: '總任務數',
      key: 'totalTasks',
      render: (_: any, record: User) => (
        <Text style={{ color: darkTextSecondary }}>
          {record.stats?.totalTasks || 0}
        </Text>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: User) => (
        <Button
          type="text"
          icon={<EditOutlined />}
          onClick={() => handleEdit(record)}
          style={{ color: primaryColor }}
        >
          編輯
        </Button>
      )
    }
  ]

  const tabItems = [
    {
      key: 'users',
      label: '用戶管理',
      children: (
        <div>
          <Space style={{ marginBottom: '24px', width: '100%' }} direction="vertical" size="large">
            <Input
              placeholder="搜尋用戶（Email 或姓名）"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={loadData}
              style={{
                maxWidth: '400px',
                background: darkBg,
                borderColor: darkBorder,
                color: darkText
              }}
              allowClear
            />
          </Space>

          <Table
            columns={columns}
            dataSource={users}
            rowKey="id"
            loading={loading}
            pagination={{
              current: pagination.page,
              pageSize: pagination.limit,
              total: pagination.total,
              onChange: (page) => setPagination(prev => ({ ...prev, page })),
              showSizeChanger: false,
              showTotal: (total) => `共 ${total} 位用戶`
            }}
            style={{ background: darkCardBg }}
          />
        </div>
      )
    },
    {
      key: 'stats',
      label: '統計數據',
      children: (
        <div>
          <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
            {stats?.map((stat: any) => (
              <Col xs={24} sm={12} md={8} key={stat.plan}>
                <Card
                  bordered={false}
                  style={{
                    background: darkCardBg,
                    border: `1px solid ${darkBorder}`
                  }}
                >
                  <Statistic
                    title={
                      <Text style={{ color: darkTextSecondary }}>
                        {stat.plan === 'free' ? '免費版' : stat.plan === 'pro' ? 'Pro 版' : 'Biz 版'}
                      </Text>
                    }
                    value={stat.count}
                    prefix={<CrownOutlined style={{ color: getPlanColor(stat.plan) }} />}
                    valueStyle={{ color: darkText }}
                    suffix={
                      <Text style={{ color: darkTextSecondary, fontSize: '14px' }}>
                        ({stat.active} 啟用)
                      </Text>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )
    }
  ]

  return (
    <div style={{ background: darkBg, minHeight: 'calc(100vh - 112px)', padding: '60px 24px' }}>
      <SEO
        title="管理後台 - Shopee2Multi"
        description="Shopee2Multi 管理後台，管理用戶、查看統計數據、監控系統使用情況。"
        keywords="管理後台,系統管理,用戶管理"
        ogTitle="管理後台 - Shopee2Multi"
        ogDescription="Shopee2Multi 管理後台，管理用戶和系統。"
      />
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={1} style={{ color: darkText, margin: 0 }}>
            管理後台
          </Title>
          <Button
            icon={<ReloadOutlined />}
            onClick={loadData}
            style={{
              background: darkCardBg,
              borderColor: darkBorder,
              color: darkText
            }}
          >
            重新整理
          </Button>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          style={{
            background: darkCardBg,
            padding: '24px',
            borderRadius: '24px',
            border: `1px solid ${darkBorder}`
          }}
        />

        <Modal
          title="編輯用戶"
          open={editModalVisible}
          onOk={handleUpdate}
          onCancel={() => setEditModalVisible(false)}
          okText="更新"
          cancelText="取消"
          styles={{
            content: {
              background: darkCardBg
            },
            header: {
              background: darkCardBg,
              borderBottom: `1px solid ${darkBorder}`
            }
          }}
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Text style={{ color: darkTextSecondary, display: 'block', marginBottom: '8px' }}>Email</Text>
              <Text style={{ color: darkText }}>{selectedUser?.email}</Text>
            </div>
            <div>
              <Text style={{ color: darkTextSecondary, display: 'block', marginBottom: '8px' }}>方案</Text>
              <Select
                value={editForm.plan}
                onChange={(value) => setEditForm(prev => ({ ...prev, plan: value }))}
                style={{ width: '100%' }}
                options={[
                  { label: '免費版', value: 'free' },
                  { label: 'Pro 版', value: 'pro' },
                  { label: 'Biz 版', value: 'biz' }
                ]}
              />
            </div>
            <div>
              <Text style={{ color: darkTextSecondary, display: 'block', marginBottom: '8px' }}>狀態</Text>
              <Select
                value={editForm.status}
                onChange={(value) => setEditForm(prev => ({ ...prev, status: value }))}
                style={{ width: '100%' }}
                options={[
                  { label: '啟用', value: 'active' },
                  { label: '暫停', value: 'suspended' },
                  { label: '已刪除', value: 'deleted' }
                ]}
              />
            </div>
            <div>
              <Text style={{ color: darkTextSecondary, display: 'block', marginBottom: '8px' }}>角色</Text>
              <Select
                value={editForm.role}
                onChange={(value) => setEditForm(prev => ({ ...prev, role: value }))}
                style={{ width: '100%' }}
                options={[
                  { label: '用戶', value: 'user' },
                  { label: '管理員', value: 'admin' }
                ]}
              />
            </div>
          </Space>
        </Modal>
      </div>
    </div>
  )
}

