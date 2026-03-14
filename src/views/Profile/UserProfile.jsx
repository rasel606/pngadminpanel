import React, { useEffect, useState } from 'react'
import { apiService } from '../../service/api'

const UserProfile = () => {
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    apiService
      .get('/affiliate/Auth/me')
      .then((res) => setProfile(res?.data || null))
      .catch(() => setError('Failed to load profile'))
  }, [])

  if (error) return <div>{error}</div>
  if (!profile) return <div>Loading...</div>

  return (
    <div className="profile-container">
      <h2>User Profile</h2>
      <div>Username: {profile.username}</div>
      <div>Email: {profile.email}</div>
      {/* Add more fields as needed */}
    </div>
  )
}

export default UserProfile
