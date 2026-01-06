import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    // 當路由變化時，滾動到頁面頂部
    // 使用 requestAnimationFrame 確保在 DOM 更新後執行
    const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    
    // 對於 lazy-loaded 組件，需要等待一下確保內容已渲染
    const timer = setTimeout(() => {
      requestAnimationFrame(scrollToTop)
    }, 0)

    return () => clearTimeout(timer)
  }, [pathname])

  return null
}

