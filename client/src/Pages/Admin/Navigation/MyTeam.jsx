import React from 'react'
import Recruiter from '../../Recruiter'
import RecruiterSignup from '../../../components/RecruiterSignupByManager'
import ManagerSignup from '../../../components/ManagerSignup'
import RecruiterSignupbyAdmin from '../../../components/RecruiterSignupbyAdmin'
import AccountManagerSignup from '../../../components/AccountManagerSignup'

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
