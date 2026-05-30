import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Home from './pages/Home'
import Login from './pages/Login'
import Registro from './pages/Registro'
import UsernameSetup from './pages/UsernameSetup'
import Dashboard from './pages/Dashboard'
import Sala from './pages/Sala'
import ProtectedRoute from './components/layout/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/username-setup" element={<UsernameSetup />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sala/:id"
          element={
            <ProtectedRoute>
              <Sala />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
    </AuthProvider>
  )
}

export default App
