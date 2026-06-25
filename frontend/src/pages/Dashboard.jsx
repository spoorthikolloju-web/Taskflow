import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getTasks, createTask, updateTask, deleteTask, toggleComplete, getTaskStats } from '../api/tasks'
import toast from 'react-hot-toast'
import { LogOut, Plus, CheckCircle2, Circle, Trash2, Pencil, X, Check } from 'lucide-react'
import styles from './Dashboard.module.css'

const PRIORITY_COLORS = { high: '#ef4444', medium: '#f59e0b', low: '#22c55e' }
const STATUS_LABELS = { todo: 'To Do', in_progress: 'In Progress', done: 'Done' }
const EMPTY_FORM = { title: '', description: '', priority: 'medium', status: 'todo', due_date: '' }

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [tasks, setTasks] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [filter, setFilter] = useState({ status: '', priority: '' })
  const [form, setForm] = useState(EMPTY_FORM)

  const fetchData = async () => {
    try {
      const params = {}
      if (filter.status) params.status = filter.status
      if (filter.priority) params.priority = filter.priority
      const [tasksRes, statsRes] = await Promise.all([getTasks(params), getTaskStats()])
      setTasks(tasksRes.data)
      setStats(statsRes.data)
    } catch { toast.error('Failed to load tasks') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [filter])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {...form, due_date: form.due_date   ? `${form.due_date}T00:00:00`   : null}
      if (editingTask) {
        await updateTask(editingTask.id, payload)
        toast.success('Task updated!')
      } else {
        await createTask(payload)
        toast.success('Task created!')
      }
      resetForm()
      fetchData()
    } catch (err) { toast.error(err.response?.data?.detail || 'Something went wrong') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return
    try { await deleteTask(id); toast.success('Deleted'); fetchData() }
    catch { toast.error('Failed to delete') }
  }

  const handleToggle = async (id) => {
    try { await toggleComplete(id); fetchData() }
    catch { toast.error('Failed to update') }
  }

  const startEdit = (task) => {
    setEditingTask(task)
    setForm({ title: task.title, description: task.description || '', priority: task.priority, status: task.status, due_date: task.due_date ? task.due_date.split('T')[0] : '' })
    setShowForm(true)
  }

  const resetForm = () => { setForm(EMPTY_FORM); setEditingTask(null); setShowForm(false) }

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>⚡ TaskFlow</div>
        {stats && (
          <>
            <div className={styles.statsBox}>
              <div className={styles.statItem}><span className={styles.statNum}>{stats.total}</span><span className={styles.statLabel}>Total</span></div>
              <div className={styles.statItem}><span className={styles.statNum} style={{color:'#22c55e'}}>{stats.completed}</span><span className={styles.statLabel}>Done</span></div>
              <div className={styles.statItem}><span className={styles.statNum} style={{color:'#f59e0b'}}>{stats.pending}</span><span className={styles.statLabel}>Pending</span></div>
            </div>
            <div className={styles.priorityBreakdown}>
              <p className={styles.sectionLabel}>By Priority</p>
              {['high','medium','low'].map(p => (
                <div key={p} className={styles.priorityRow}>
                  <span className={styles.dot} style={{background: PRIORITY_COLORS[p]}}></span>
                  <span className={styles.priorityName}>{p}</span>
                  <span className={styles.priorityCount}>{stats.by_priority[p]}</span>
                </div>
              ))}
            </div>
          </>
        )}
        <div className={styles.sidebarFooter}>
          <span className={styles.username}>@{user?.username}</span>
          <button onClick={logout} className={styles.logoutBtn}><LogOut size={16}/></button>
        </div>
      </aside>

      <main className={styles.main}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.heading}>My Tasks</h1>
            <p className={styles.subheading}>Manage and track your work</p>
          </div>
          <button className={styles.addBtn} onClick={() => setShowForm(true)}><Plus size={16}/> New Task</button>
        </div>

        <div className={styles.filters}>
          <select value={filter.status} onChange={e => setFilter({...filter, status: e.target.value})}>
            <option value="">All Status</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <select value={filter.priority} onChange={e => setFilter({...filter, priority: e.target.value})}>
            <option value="">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {showForm && (
          <div className={styles.overlay} onClick={e => e.target === e.currentTarget && resetForm()}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h2>{editingTask ? 'Edit Task' : 'New Task'}</h2>
                <button onClick={resetForm}><X size={20}/></button>
              </div>
              <form onSubmit={handleSubmit} className={styles.modalForm}>
                <div className={styles.field}>
                  <label>Title *</label>
                  <input type="text" placeholder="Task title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
                </div>
                <div className={styles.field}>
                  <label>Description</label>
                  <textarea placeholder="Optional description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} />
                </div>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label>Priority</label>
                    <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label>Status</label>
                    <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  </div>
                </div>
                <div className={styles.field}>
                  <label>Due Date</label>
                  <input type="date" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} />
                </div>
                <div className={styles.modalActions}>
                  <button type="button" onClick={resetForm} className={styles.cancelBtn}>Cancel</button>
                  <button type="submit" className={styles.submitBtn}>
                    {editingTask ? <><Check size={14}/> Save</> : <><Plus size={14}/> Create</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <div className={styles.empty}>Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className={styles.empty}>
            <p>No tasks yet.</p>
            <button className={styles.addBtn} onClick={() => setShowForm(true)}><Plus size={14}/> Add your first task</button>
          </div>
        ) : (
          <div className={styles.taskList}>
            {tasks.map(task => (
              <div key={task.id} className={`${styles.taskCard} ${task.is_completed ? styles.completed : ''}`}>
                <button className={styles.toggleBtn} onClick={() => handleToggle(task.id)}>
                  {task.is_completed ? <CheckCircle2 size={20} color="#22c55e"/> : <Circle size={20} color="#475569"/>}
                </button>
                <div className={styles.taskContent}>
                  <div className={styles.taskTitle}>{task.title}</div>
                  {task.description && <div className={styles.taskDesc}>{task.description}</div>}
                  <div className={styles.taskMeta}>
                    <span className={styles.badge} style={{background: PRIORITY_COLORS[task.priority] + '22', color: PRIORITY_COLORS[task.priority]}}>{task.priority}</span>
                    <span className={styles.statusBadge}>{STATUS_LABELS[task.status]}</span>
                    {task.due_date && <span className={styles.due}>Due: {new Date(task.due_date).toLocaleDateString()}</span>}
                  </div>
                </div>
                <div className={styles.taskActions}>
                  <button onClick={() => startEdit(task)}><Pencil size={15}/></button>
                  <button onClick={() => handleDelete(task.id)} className={styles.deleteBtn}><Trash2 size={15}/></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
