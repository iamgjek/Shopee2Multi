import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from 'antd'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Converter from './pages/Converter'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Register from './pages/Register'
import { useAuthStore } from './store/authStore'

function App() {
  const { token } = useAuthStore()

  return (
    <BrowserRouter>
      <Layout style={{ minHeight: '100vh', background: '#ffffff' }}>
        <Header />
        <Layout.Content style={{ background: '#ffffff' }}>
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
          </Routes>
        </Layout.Content>
        <Footer />
      </Layout>
    </BrowserRouter>
  )
}

export default App
