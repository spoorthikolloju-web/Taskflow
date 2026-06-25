import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh',color:'#6366f1'}}>Loading...</div>
  return isAuthenticated ? children : <Navigate to="/login" replace />
}
