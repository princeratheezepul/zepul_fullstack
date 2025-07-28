import React from 'react'
import { useEffect, useState } from 'react';
import  RecruiterSignup  from '../../../components/RecruiterSignupByManager.jsx';
import GetRecruitersByManager from '../../../components/GetRecruitresByManager.jsx';
const Myteam = () => {
  return (
    <div>
      <RecruiterSignup />
      <GetRecruitersByManager/>
    </div>
  )
}

export default Myteam
