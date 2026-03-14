import React, { useState } from 'react'
import { apiService } from '../../service/api'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await apiService.post('/affiliate/Auth/login', {
        userId: username,
        password,
      })

      const token = res?.data?.token
      if (token) {
        apiService.setToken(token)
        localStorage.setItem('token', token)
      }

      // Save token, redirect, etc.
      setError('')
      window.location.href = '/dashboard'
    } catch (err) {
      setError('Login failed')
    }
  }

  return (
    <div className="auth-container">
      <h2>Admin Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
        {error && <div className="error">{error}</div>}
      </form>
    </div>
  )
}

export default Login
