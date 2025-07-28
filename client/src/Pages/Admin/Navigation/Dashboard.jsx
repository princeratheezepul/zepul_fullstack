import React from 'react'

import GetRecruitersByAdmin from '../../../components/GetRecruitersByAdmin.jsx'
import GetManagersByAdmin from '../../../components/GetManagersbyAdmin.jsx'

const Dashboard = () => {
  return (
    <div>
      <GetRecruitersByAdmin/>
      <GetManagersByAdmin/>
    </div>
  )
}

export default Dashboard
