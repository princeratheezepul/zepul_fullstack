import React from 'react'
import AdminPassSec from '../../../Components/AdminPassSec'
import AdminInfo from '../../../Components/AdminInfo'
import AdminLogout from '../../../Components/AdminLogout'

const AdminSettings = () => {
  return (
    <div>
        <AdminInfo/>
        <AdminPassSec/>
      <AdminLogout/>
    </div>
  )
}

export default AdminSettings
