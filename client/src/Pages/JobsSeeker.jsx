import React, { Fragment } from "react";
import CommonHeroSection from "../Components/CommonHeroSection";
import PartnerCarousel from "../Components/PartnerCarousel";
import Standout from "../Components/Standout";
import JobsTabs from "../AllTabs/JobSeeker";

const JobsSeeker = () => {
  const data = {
    title: "STAND OUT WITH US",
    main_title: "Try Zepul",
    percentige: [
      {
        title: "86%",
        subtitle: "More Opportunities",
      },
      {
        title: "57%",
        subtitle: "Increase in Visibility",
      },
      {
        title: "20%",
        subtitle: " Increase Access to Global Opportunities",
      },
    ],
  };

  return (
    <Fragment>
      <div className="container">
        <CommonHeroSection
          title="Shape your 
        Career with Zepul"
          subtitle=" Find your dream job at Zepul. Explore opportunities, connect with top companies across the Globe, and showcase your skills. Launch your career journey today.


          "
          btnText="Get Hired"
          image="/assets/21. Shape your  Career with Zepul.png"
          btnUrl="https://candidate.zepul.com/login"
        />
        {/* <div className="mt-5">
          <PartnerCarousel />
        </div> */}
        <div className="row">
          <section className="d-flex row innovation py-md-5 mt-5 align-items-center">
            <div className="col-md-6">
              <div className="home-content">
                <p className="color-title mb-2 fw-semibold">Unlocking Innovation</p>
                <h1>
                  Land your dream job, join Zepul's 
                  thriving talent community.
                </h1>
              </div>
            </div>
            <div className="col-md-6">
              <p className="w-md-75">
                Connect directly with innovative companies seeking your unique
                abilities. Zepul's dynamic platform empowers you to stand out
                from the crowd and secure the perfect position with a dedicated
                team who understand your career aspirations
              </p>
            </div>
          </section>
        </div>
        <JobsTabs />

        <Standout data={data} />
      </div>
    </Fragment>
  );
};

export default JobsSeeker;
