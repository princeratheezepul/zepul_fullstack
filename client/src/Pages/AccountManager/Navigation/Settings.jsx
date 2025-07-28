import React from 'react'
import LogoutButton from '../AccountManagerLogout.jsx'
import AccountManagerInfo from '../../../Components/AccountManagerInfo.jsx'
import AccountManagerPassSec from '../../../Components/AccountManagerPassSec.jsx'

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
