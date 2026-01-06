import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from 'antd'
import { Suspense, lazy } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import { useAuthStore } from './store/authStore'

// 路由級別的代碼分割 - 只加載需要的組件
const Home = lazy(() => import('./pages/Home'))
const Converter = lazy(() => import('./pages/Converter'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Admin = lazy(() => import('./pages/Admin'))

// 加載中的佔位組件
const LoadingFallback = () => (
  <div style={{ 
    minHeight: '100vh', 
    background: '#0a0a0a', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center' 
  }}>
    <div style={{ color: '#00ff88', fontSize: '18px' }}>載入中...</div>
  </div>
)

function App() {
  const { token } = useAuthStore()

  return (
    <BrowserRouter>
      <Layout style={{ minHeight: '100vh', background: '#0a0a0a' }}>
        <Header />
        <Layout.Content style={{ background: '#0a0a0a' }}>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/pricing" element={<Navigate to="/" replace />} />
              <Route 
                path="/login" 
                element={token ? <Navigate to="/dashboard" /> : <Login />} 
              />
              <Route 
                path="/register" 
                element={token ? <Navigate to="/dashboard" /> : <Register />} 
              />
              <Route 
                path="/converter" 
                element={token ? <Converter /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/dashboard" 
                element={token ? <Dashboard /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/admin" 
                element={
                  token ? (
                    <Admin />
                  ) : (
                    <Navigate to="/login" />
                  )
                } 
              />
            </Routes>
          </Suspense>
        </Layout.Content>
        <Footer />
      </Layout>
    </BrowserRouter>
  )
}

export default App
