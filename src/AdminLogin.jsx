
import { useState } from 'react'
import { supabase } from './supabase'

function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(event) {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Login successful!')
      onLogin(data.user)
    }

    setLoading(false)
  }

  return (
    <main>
      <h1>Admin Login</h1>
      <p>Please sign in to manage SCP records.</p>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Login'}
        </button>

        {message && <p>{message}</p>}
      </form>
    </main>
  )
}

export default AdminLogin
