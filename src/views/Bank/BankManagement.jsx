import React, { useEffect, useState } from 'react'
import { apiService } from '../../service/api'

const BankManagement = () => {
  const [banks, setBanks] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    apiService
      .get('/affiliate/banks')
      .then((res) => setBanks(res?.data || []))
      .catch(() => setError('Failed to load banks'))
  }, [])

  // Add create, update, delete logic here

  return (
    <div className="bank-container">
      <h2>Bank Management</h2>
      {error && <div>{error}</div>}
      <ul>
        {banks.map((bank) => (
          <li key={bank.id}>
            {bank.bankName} - {bank.bankBranch}
          </li>
        ))}
      </ul>
      {/* Add forms for create/update/delete */}
    </div>
  )
}

export default BankManagement
