import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { login as loginApi } from '../api/auth'
import toast from 'react-hot-toast'
import styles from './Auth.module.css'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await loginApi(form)
      login(res.data)
      toast.success(`Welcome back, ${res.data.user.username}!`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logo}>⚡ TaskFlow</div>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>Sign in to your account</p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Email</label>
            <input type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          </div>
          <div className={styles.field}>
            <label>Password</label>
            <input type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
          </div>
          <button type="submit" className={styles.btn} disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
        </form>
        <p className={styles.switch}>Don't have an account? <Link to="/register">Register</Link></p>
      </div>
    </div>
  )
}
