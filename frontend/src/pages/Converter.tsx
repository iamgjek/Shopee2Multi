import { useState } from 'react'
import { 
  Card, 
  Input, 
  Button, 
  Select, 
  Typography, 
  Space, 
  Alert, 
  Spin,
  Result,
  Descriptions
} from 'antd'
import { ThunderboltOutlined, DownloadOutlined } from '@ant-design/icons'
import api from '../api/client'

const { Title, Paragraph } = Typography
const { TextArea } = Input

type Platform = 'momo' | 'pchome' | 'coupang' | 'yahoo'

export default function Converter() {
  const [url, setUrl] = useState('')
  const [platform, setPlatform] = useState<Platform>('momo')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleConvert = async () => {
    if (!url.trim()) {
      setError('請輸入蝦皮商品連結')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await api.post('/conversion/convert', {
        url: url.trim(),
        platform
      })

      setResult(response.data.data)
    } catch (err: any) {
      setError(err.response?.data?.error?.message || '轉檔失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (result?.downloadUrl) {
      window.open(`/api${result.downloadUrl}`, '_blank')
    }
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Title level={2}>商品轉檔工具</Title>
      <Paragraph>
        貼上蝦皮商品連結，選擇目標平台，一鍵轉換為 Excel 檔案
      </Paragraph>

      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Title level={5}>蝦皮商品連結</Title>
            <TextArea
              rows={3}
              placeholder="請貼上蝦皮商品或賣場連結，例如：https://shopee.tw/product/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <Title level={5}>目標平台</Title>
            <Select
              style={{ width: '100%' }}
              value={platform}
              onChange={setPlatform}
              disabled={loading}
              options={[
                { label: 'momo 購物網', value: 'momo' },
                { label: 'PChome 24h 購物', value: 'pchome' },
                { label: 'Coupang 酷澎 (需商業版)', value: 'coupang', disabled: true },
                { label: 'Yahoo 購物中心 (需商業版)', value: 'yahoo', disabled: true }
              ]}
            />
          </div>

          {error && (
            <Alert
              message="轉檔失敗"
              description={error}
              type="error"
              showIcon
              closable
              onClose={() => setError(null)}
            />
          )}

          <Button
            type="primary"
            size="large"
            icon={<ThunderboltOutlined />}
            onClick={handleConvert}
            loading={loading}
            block
          >
            開始轉檔
          </Button>
        </Space>
      </Card>

      {loading && (
        <Card style={{ marginTop: '24px', textAlign: 'center' }}>
          <Spin size="large" />
          <Paragraph style={{ marginTop: '16px' }}>
            正在解析商品資訊並轉換格式...
          </Paragraph>
        </Card>
      )}

      {result && !loading && (
        <Card style={{ marginTop: '24px' }}>
          <Result
            status="success"
            title="轉檔完成！"
            subTitle="商品已成功轉換為目標平台格式"
            extra={[
              <Button
                type="primary"
                key="download"
                icon={<DownloadOutlined />}
                onClick={handleDownload}
                size="large"
              >
                下載 Excel 檔案
              </Button>
            ]}
          >
            <Descriptions title="商品資訊" bordered column={1}>
              <Descriptions.Item label="商品名稱">
                {result.product?.title || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="售價">
                NT$ {result.product?.price || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="任務 ID">
                {result.taskId}
              </Descriptions.Item>
            </Descriptions>
          </Result>
        </Card>
      )}
    </div>
  )
}
