import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { register as registerApi } from '../api/auth'
import toast from 'react-hot-toast'
import styles from './Auth.module.css'

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await registerApi(form)
      login(res.data)
      toast.success('Account created!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logo}>⚡ TaskFlow</div>
        <h1 className={styles.title}>Create account</h1>
        <p className={styles.subtitle}>Start managing your tasks</p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Username</label>
            <input type="text" placeholder="spoorthi" value={form.username} onChange={e => setForm({...form, username: e.target.value})} required />
          </div>
          <div className={styles.field}>
            <label>Email</label>
            <input type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          </div>
          <div className={styles.field}>
            <label>Password</label>
            <input type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required minLength={6} />
          </div>
          <button type="submit" className={styles.btn} disabled={loading}>{loading ? 'Creating...' : 'Create account'}</button>
        </form>
        <p className={styles.switch}>Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  )
}
