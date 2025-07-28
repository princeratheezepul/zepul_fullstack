import React from 'react'
import LogoutButton from '../../../components/Logout'
import ManagerInfo from '../../../components/ManagerInfo'
import Passwordsec from '../../../components/Passwordsec'

const Settings = () => {
  return (
    <div>
        <ManagerInfo/>
        <Passwordsec/>
      <LogoutButton />
    </div>
  )
}

export default Settings
