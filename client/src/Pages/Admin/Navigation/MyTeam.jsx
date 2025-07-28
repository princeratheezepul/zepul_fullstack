import React from 'react'
import Recruiter from '../../Recruiter'
import RecruiterSignup from '../../../Components/RecruiterSignupByManager.jsx'
import ManagerSignup from '../../../Components/ManagerSignup.jsx'
import RecruiterSignupbyAdmin from '../../../Components/RecruiterSignupbyAdmin.jsx'
import AccountManagerSignup from '../../../Components/AccountManagerSignup.jsx'

const MyTeam = () => {
  return (
    <div>
        <ManagerSignup />
      <RecruiterSignupbyAdmin/>
      <AccountManagerSignup/>
    </div>
  )
}

export default MyTeam
