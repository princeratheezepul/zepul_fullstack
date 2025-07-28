import React, { Fragment } from 'react'
import FeatureCards from '../Components/TalentHub/FeatureCards'
import TalentHubHeader from '../Components/TalentHub/TalentHubHeader'
import WhyChooseSection from '../Components/TalentHub/WhyChooseSection'
import CtaBanner from '../Components/TalentHub/CtaBanner'

function TalentHub() {
  return (
    <Fragment>
        <TalentHubHeader/>
        <FeatureCards/>
        <WhyChooseSection/>
        <CtaBanner/>

        
    </Fragment>
  )
}

export default TalentHub