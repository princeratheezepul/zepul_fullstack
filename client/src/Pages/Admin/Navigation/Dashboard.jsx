import React from 'react'

import GetRecruitersByAdmin from '../../../Components/GetRecruitersByAdmin.jsx'
import GetManagersByAdmin from '../../../Components/GetManagersbyAdmin.jsx'

const Dashboard = () => {
  return (
    <div>
      <GetRecruitersByAdmin/>
      <GetManagersByAdmin/>
    </div>
  )
}

export default Dashboard
