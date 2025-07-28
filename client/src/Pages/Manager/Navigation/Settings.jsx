import React from 'react'
import LogoutButton from '../../../Components/Logout'
import ManagerInfo from '../../../Components/ManagerInfo'
import Passwordsec from '../../../Components/Passwordsec'

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
