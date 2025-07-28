import React from 'react'
import AdminPassSec from '../../../components/AdminPassSec'
import AdminInfo from '../../../components/AdminInfo'
import AdminLogout from '../../../components/AdminLogout'

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
