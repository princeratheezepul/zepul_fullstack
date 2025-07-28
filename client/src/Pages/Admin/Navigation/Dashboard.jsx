import React from 'react'
import GetRecruiters from '../../../components/GetRecruitresByManager'
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
