import React, { Fragment } from "react";
import { CallToAction } from "../Components/ZepRecruit/CallToAction";
import { FeatureCards } from "../Components/ZepRecruit/FeatureCards";
import { HeroSection } from "../Components/ZepRecruit/HeroSection";
import { ServiceFeatures } from "../Components/ZepRecruit/ServiceFeatures";
import { ServicesSection } from "../Components/ZepRecruit/ServicesSection";
import { WhyChooseUs } from "../Components/ZepRecruit/WhyChooseUs";
import RecruitmentPartner from "../Components/ZepRecruit/RecruitmentPartner";

function ZepRecruit() {
  return (
    <Fragment>
      <HeroSection />
      <FeatureCards />
      <WhyChooseUs />
      <ServicesSection />
      {/* <ServiceFeatures /> */}
      <RecruitmentPartner/>
      {/* <CallToAction /> */}
    </Fragment>
  );
}

export default ZepRecruit;
