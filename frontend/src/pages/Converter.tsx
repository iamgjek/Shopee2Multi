import { useState, useEffect } from 'react'
import { 
  Card, 
  Input, 
  Button, 
  Select, 
  Typography, 
  Space, 
  Alert, 
  Spin,
  message
} from 'antd'
import { DownloadOutlined, CheckCircleOutlined } from '@ant-design/icons'
import api from '../api/client'
import { useAuthStore } from '../store/authStore'
import SEO from '../components/SEO'

const { Title, Paragraph, Text } = Typography
const { TextArea } = Input

type Platform = 'momo' | 'pchome' | 'coupang' | 'yahoo' | 'easystore'

export default function Converter() {
  const { user, token } = useAuthStore()
  const [url, setUrl] = useState('')
  const [platform, setPlatform] = useState<Platform>('momo')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  // 檢查平台是否可用
  const isPlatformAvailable = (platformValue: Platform): boolean => {
    if (!token || !user) {
      // 未登入用戶只能使用免費平台
      return platformValue === 'momo' || platformValue === 'pchome'
    }

    switch (platformValue) {
      case 'momo':
      case 'pchome':
        // 所有方案都可以使用
        return true
      case 'easystore':
        // 需要 Pro 或 Biz
        return user.plan === 'pro' || user.plan === 'biz'
      case 'coupang':
      case 'yahoo':
        // 需要 Biz
        return user.plan === 'biz'
      default:
        return false
    }
  }

  // 獲取平台選項
  const getPlatformOptions = () => {
    const options = [
      { 
        label: 'momo 購物網', 
        value: 'momo' as Platform,
        disabled: false
      },
      { 
        label: 'PChome 24h 購物', 
        value: 'pchome' as Platform,
        disabled: false
      },
      { 
        label: 'EasyStore（需專業版）', 
        value: 'easystore' as Platform,
        disabled: !isPlatformAvailable('easystore')
      },
      { 
        label: 'Coupang 酷澎（需商業版）', 
        value: 'coupang' as Platform,
        disabled: !isPlatformAvailable('coupang')
      },
      { 
        label: 'Yahoo 購物中心（需商業版）', 
        value: 'yahoo' as Platform,
        disabled: !isPlatformAvailable('yahoo')
      }
    ]
    return options
  }

  // 處理平台變更，如果選擇的平台不可用，自動切換到第一個可用平台
  const handlePlatformChange = (value: Platform) => {
    if (isPlatformAvailable(value)) {
      setPlatform(value)
    } else {
      // 如果選擇的平台不可用，切換到第一個可用平台
      const availablePlatform = getPlatformOptions().find(opt => !opt.disabled)
      if (availablePlatform) {
        setPlatform(availablePlatform.value)
      }
    }
  }

  // 當用戶登入狀態或方案改變時，檢查當前平台是否可用
  useEffect(() => {
    // 檢查當前平台是否可用
    let currentPlatformAvailable = false
    if (!token || !user) {
      currentPlatformAvailable = platform === 'momo' || platform === 'pchome'
    } else {
      switch (platform) {
        case 'momo':
        case 'pchome':
          currentPlatformAvailable = true
          break
        case 'easystore':
          currentPlatformAvailable = user.plan === 'pro' || user.plan === 'biz'
          break
        case 'coupang':
        case 'yahoo':
          currentPlatformAvailable = user.plan === 'biz'
          break
        default:
          currentPlatformAvailable = false
      }
    }

    if (!currentPlatformAvailable) {
      // 如果當前平台不可用，切換到第一個可用平台
      const options = getPlatformOptions()
      const availablePlatform = options.find(opt => !opt.disabled)
      if (availablePlatform && availablePlatform.value !== platform) {
        setPlatform(availablePlatform.value)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user?.plan])

  // Dark mode 主題色（黑/綠色）
  const primaryColor = '#00ff88' // 亮綠色
  const darkBg = '#0a0a0a' // 深黑色背景
  const darkCardBg = '#1a1a1a' // 卡片背景
  const darkText = '#ffffff' // 白色文字
  const darkTextSecondary = '#a0a0a0' // 次要文字
  const darkBorder = '#2a2a2a' // 邊框顏色

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

  const handleDownload = async () => {
    if (result?.downloadUrl) {
      try {
        // 使用 api 實例下載，這樣會自動包含認證 token
        const response = await api.get(result.downloadUrl, {
          responseType: 'blob'
        })
        
        // 創建 blob URL 並下載
        const blob = new Blob([response.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `shopee2multi-${platform}-${result.taskId}.xlsx`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } catch (error: any) {
        message.error(error.response?.data?.error?.message || '下載失敗')
      }
    }
  }

  return (
    <div style={{ 
      background: darkBg, 
      minHeight: 'calc(100vh - 112px)',
      padding: '60px 24px'
    }}>
      <SEO
        title="商品轉檔工具 - Shopee2Multi"
        description="貼上蝦皮商品連結，選擇目標平台（momo、PChome、EasyStore、Coupang），一鍵轉換為 Excel 檔案。智能轉換商品格式，自動處理規格映射、圖片裁切、HTML 描述生成。"
        keywords="蝦皮轉檔工具,商品轉檔,momo轉檔,PChome轉檔,EasyStore轉檔,Coupang轉檔,蝦皮商品轉換,Excel轉檔"
        ogTitle="商品轉檔工具 - Shopee2Multi"
        ogDescription="貼上蝦皮商品連結，一鍵轉換為目標平台格式。支援 momo、PChome、EasyStore、Coupang 等平台。"
      />
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        {/* 標題區 */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <Title 
            level={1} 
            style={{ 
              fontSize: '48px',
              fontWeight: 600,
              color: darkText,
              marginBottom: '16px',
              letterSpacing: '-1px'
            }}
          >
            商品轉檔工具
          </Title>
          <Paragraph style={{ 
            fontSize: '21px',
            color: darkTextSecondary,
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
            background: darkCardBg,
            border: `1px solid ${darkBorder}`,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
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
                color: darkText,
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
                  borderColor: darkBorder,
                  background: darkBg,
                  color: darkText,
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
                color: darkText,
                marginBottom: '12px'
              }}>
                目標平台
              </Text>
              <Select
                size="large"
                style={{ width: '100%' }}
                value={platform}
                onChange={handlePlatformChange}
                disabled={loading}
                options={getPlatformOptions()}
              />
              {/* 權限提示 */}
              {!token && (
                <Text style={{ 
                  display: 'block',
                  fontSize: '14px',
                  color: darkTextSecondary,
                  marginTop: '8px',
                  fontStyle: 'italic'
                }}>
                  💡 登入後可解鎖更多平台選項
                </Text>
              )}
              {token && user?.plan === 'free' && (
                <Text style={{ 
                  display: 'block',
                  fontSize: '14px',
                  color: darkTextSecondary,
                  marginTop: '8px',
                  fontStyle: 'italic'
                }}>
                  💡 升級至 Pro 版或 Biz 版可解鎖更多平台
                </Text>
              )}
              {token && user?.plan === 'pro' && (
                <Text style={{ 
                  display: 'block',
                  fontSize: '14px',
                  color: darkTextSecondary,
                  marginTop: '8px',
                  fontStyle: 'italic'
                }}>
                  💡 升級至 Biz 版可解鎖 Coupang 和 Yahoo
                </Text>
              )}
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
                    color: darkBg,
                    boxShadow: '0 4px 20px rgba(0, 255, 136, 0.4)',
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
              background: darkCardBg,
              border: `1px solid ${darkBorder}`,
              textAlign: 'center'
            }}
            bodyStyle={{ padding: '48px' }}
          >
            <Spin size="large" />
            <Paragraph style={{ 
              marginTop: '24px',
              fontSize: '17px',
              color: darkTextSecondary,
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
              background: darkCardBg,
              border: `1px solid ${darkBorder}`,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              textAlign: 'center'
            }}
            bodyStyle={{ padding: '48px' }}
          >
            <div style={{ 
              width: '80px',
              height: '80px',
              borderRadius: '40px',
              background: `${primaryColor}20`,
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
                color: darkText,
                marginBottom: '12px'
              }}
            >
              轉檔完成！
            </Title>

            <Paragraph style={{ 
              fontSize: '17px',
              color: darkTextSecondary,
              marginBottom: '32px'
            }}>
              商品已成功轉換為目標平台格式
            </Paragraph>

            {/* 商品資訊 */}
            <div style={{
              background: darkBg,
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '32px',
              textAlign: 'left',
              border: `1px solid ${darkBorder}`
            }}>
              <div style={{ marginBottom: '16px' }}>
                <Text style={{ fontSize: '15px', color: darkTextSecondary, display: 'block', marginBottom: '4px' }}>
                  商品名稱
                </Text>
                <Text style={{ fontSize: '17px', color: darkText, fontWeight: 500 }}>
                  {result.product?.title || 'N/A'}
                </Text>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <Text style={{ fontSize: '15px', color: darkTextSecondary, display: 'block', marginBottom: '4px' }}>
                  售價
                </Text>
                <Text style={{ fontSize: '17px', color: darkText, fontWeight: 500 }}>
                  NT$ {result.product?.price || 'N/A'}
                </Text>
              </div>

              <div>
                <Text style={{ fontSize: '15px', color: darkTextSecondary, display: 'block', marginBottom: '4px' }}>
                  任務 ID
                </Text>
                <Text style={{ fontSize: '15px', color: darkTextSecondary, fontFamily: 'monospace' }}>
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
                color: darkBg,
                boxShadow: '0 4px 20px rgba(0, 255, 136, 0.4)',
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
