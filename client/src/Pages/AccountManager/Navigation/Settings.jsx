import React from 'react'
import LogoutButton from '../AccountManagerLogout.jsx'
import AccountManagerInfo from '../../../components/AccountManagerInfo.jsx'
import AccountManagerPassSec from '../../../components/AccountManagerPassSec.jsx'

const AccountManagerSettings = () => {
  return (
    <div>
        <AccountManagerInfo/>
        <AccountManagerPassSec/>
      <LogoutButton/>
    </div>
  )
}

export default AccountManagerSettings
