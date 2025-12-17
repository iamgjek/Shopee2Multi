import { useState } from 'react'
import { 
  Card, 
  Input, 
  Button, 
  Select, 
  Typography, 
  Space, 
  Alert, 
  Spin
} from 'antd'
import { DownloadOutlined, CheckCircleOutlined } from '@ant-design/icons'
import api from '../api/client'

const { Title, Paragraph, Text } = Typography
const { TextArea } = Input

type Platform = 'momo' | 'pchome' | 'coupang' | 'yahoo'

export default function Converter() {
  const [url, setUrl] = useState('')
  const [platform, setPlatform] = useState<Platform>('momo')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  // 深藍色主題色（Material Design Blue 700）
  const primaryColor = '#1976d2'
  const darkGray = '#212121'
  const mediumGray = '#757575'
  const lightGray = '#fafafa'

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
    <div style={{ 
      background: '#ffffff', 
      minHeight: 'calc(100vh - 112px)',
      padding: '60px 24px'
    }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        {/* 標題區 */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <Title 
            level={1} 
            style={{ 
              fontSize: '48px',
              fontWeight: 600,
              color: darkGray,
              marginBottom: '16px',
              letterSpacing: '-1px'
            }}
          >
            商品轉檔工具
          </Title>
          <Paragraph style={{ 
            fontSize: '21px',
            color: mediumGray,
            lineHeight: '1.6',
            marginBottom: 0
          }}>
            貼上蝦皮商品連結，選擇目標平台，一鍵轉換為 Excel 檔案
          </Paragraph>
        </div>

        {/* 主要轉檔卡片 */}
        <Card
          bordered={false}
          style={{
            borderRadius: '24px',
            background: '#ffffff',
            boxShadow: '0 2px 16px rgba(0, 0, 0, 0.08)',
            marginBottom: '32px'
          }}
          bodyStyle={{ padding: '48px' }}
        >
          <Space direction="vertical" style={{ width: '100%' }} size={32}>
            {/* 商品連結輸入 */}
            <div>
              <Text style={{ 
                display: 'block',
                fontSize: '17px',
                fontWeight: 500,
                color: darkGray,
                marginBottom: '12px'
              }}>
                蝦皮商品連結
              </Text>
              <TextArea
                rows={4}
                placeholder="請貼上蝦皮商品或賣場連結&#10;例如：https://shopee.tw/product/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading}
                style={{
                  fontSize: '16px',
                  borderRadius: '12px',
                  borderColor: '#e0e0e0',
                  padding: '16px'
                }}
              />
            </div>

            {/* 平台選擇 */}
            <div>
              <Text style={{ 
                display: 'block',
                fontSize: '17px',
                fontWeight: 500,
                color: darkGray,
                marginBottom: '12px'
              }}>
                目標平台
              </Text>
              <Select
                size="large"
                style={{ width: '100%' }}
                value={platform}
                onChange={setPlatform}
                disabled={loading}
                options={[
                  { label: 'momo 購物網', value: 'momo' },
                  { label: 'PChome 24h 購物', value: 'pchome' },
                  { label: 'Coupang 酷澎（需商業版）', value: 'coupang', disabled: true },
                  { label: 'Yahoo 購物中心（需商業版）', value: 'yahoo', disabled: true }
                ]}
              />
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

            {/* 轉檔按鈕 */}
            <Button
              type="primary"
              size="large"
              onClick={handleConvert}
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
                border: 'none',
                marginTop: '8px'
              }}
            >
              {loading ? '轉檔中...' : '開始轉檔'}
            </Button>
          </Space>
        </Card>

        {/* 載入狀態 */}
        {loading && (
          <Card
            bordered={false}
            style={{
              borderRadius: '24px',
              background: lightGray,
              textAlign: 'center'
            }}
            bodyStyle={{ padding: '48px' }}
          >
            <Spin size="large" />
            <Paragraph style={{ 
              marginTop: '24px',
              fontSize: '17px',
              color: mediumGray,
              marginBottom: 0
            }}>
              正在解析商品資訊並轉換格式...
            </Paragraph>
          </Card>
        )}

        {/* 轉檔成功結果 */}
        {result && !loading && (
          <Card
            bordered={false}
            style={{
              borderRadius: '24px',
              background: '#ffffff',
              boxShadow: '0 2px 16px rgba(0, 0, 0, 0.08)',
              textAlign: 'center'
            }}
            bodyStyle={{ padding: '48px' }}
          >
            <div style={{ 
              width: '80px',
              height: '80px',
              borderRadius: '40px',
              background: '#f0f9ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              <CheckCircleOutlined style={{ 
                fontSize: '48px',
                color: primaryColor
              }} />
            </div>

            <Title 
              level={2}
              style={{ 
                fontSize: '32px',
                fontWeight: 600,
                color: darkGray,
                marginBottom: '12px'
              }}
            >
              轉檔完成！
            </Title>

            <Paragraph style={{ 
              fontSize: '17px',
              color: mediumGray,
              marginBottom: '32px'
            }}>
              商品已成功轉換為目標平台格式
            </Paragraph>

            {/* 商品資訊 */}
            <div style={{
              background: lightGray,
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '32px',
              textAlign: 'left'
            }}>
              <div style={{ marginBottom: '16px' }}>
                <Text style={{ fontSize: '15px', color: mediumGray, display: 'block', marginBottom: '4px' }}>
                  商品名稱
                </Text>
                <Text style={{ fontSize: '17px', color: darkGray, fontWeight: 500 }}>
                  {result.product?.title || 'N/A'}
                </Text>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <Text style={{ fontSize: '15px', color: mediumGray, display: 'block', marginBottom: '4px' }}>
                  售價
                </Text>
                <Text style={{ fontSize: '17px', color: darkGray, fontWeight: 500 }}>
                  NT$ {result.product?.price || 'N/A'}
                </Text>
              </div>

              <div>
                <Text style={{ fontSize: '15px', color: mediumGray, display: 'block', marginBottom: '4px' }}>
                  任務 ID
                </Text>
                <Text style={{ fontSize: '15px', color: mediumGray, fontFamily: 'monospace' }}>
                  {result.taskId}
                </Text>
              </div>
            </div>

            {/* 下載按鈕 */}
            <Button
              type="primary"
              size="large"
              icon={<DownloadOutlined />}
              onClick={handleDownload}
              style={{
                height: '56px',
                fontSize: '17px',
                fontWeight: 500,
                padding: '0 48px',
                borderRadius: '28px',
                background: primaryColor,
                borderColor: primaryColor,
                boxShadow: 'none',
                border: 'none'
              }}
            >
              下載 Excel 檔案
            </Button>

            {/* 再轉一個 */}
            <div style={{ marginTop: '24px' }}>
              <Button
                type="text"
                onClick={() => {
                  setResult(null)
                  setUrl('')
                  setError(null)
                }}
                style={{
                  fontSize: '16px',
                  color: primaryColor,
                  fontWeight: 500
                }}
              >
                轉換另一個商品
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
