import React, { Fragment } from "react";
import "../styles/Home.css";
import HeroSection from "../Components/HomeHeroSection";

import RecruitmentPlatform from "../Components/Recruitment-platform";



const Home = () => {
  const data = [
    {
      title: "One Stop Shop",
      description:
        "Your One-Stop Shop from Requisition to Onboarding: Simplify Your Hiring Process Today.",
    },
    {
      title: "ZepDB - AI based Sourcing",
      description:
        "An AI-powered database that instantly sources top talent from a vast pool of profiles, ensuring the lowest TAT.",
    },
    {
      title: "Multi-layer Screening (AI + Human)",
      description:
        "AI-driven screening blended with human evaluation to ensure precise talent scoring and enhanced quality.",
    },
    {
      title: "Comprehensive Report Card",
      description:
        "A comprehensive assessment report based on AI + human evaluation, the candidate's resume, and value-adds like BGV and functional evaluation scores.",
    },
  ];

  const cardData = [
    {
      title: "Expert Sourcing & Screening",
      image: "/assets/4. Expert Sourcing & Screening.png",
    },
    {
      title: "Streamlined Interview Management",
      image: "/assets/5. Streamlined Interview Management.png",
    },
    {
      title: "Comprehensive Assessments",
      image: "/assets/6. Comprehensive Assessments.png",
    },
    {
      title: "  Dedicated Negotiation Team",
      image: "/assets/7. Dedicated  Negotiation Team.png",
    },
    {
      title: "Real-Time Tracking System",
      image: "/assets/8. Real-Time Tracking System.png",
    },
    {
      title: "Seamless Background Verification",
      image: "/assets/9. Seamless Background Verification.png",
    },
  ];
  return (
    <Fragment>
      <div className="container h-full">
        <div className="row ">
          <HeroSection />
          {/* <PartnerCarousel /> */}

          <div className="home p-0 ">
            <section className="intro   mt-5 px-5  py-3 ">
              <h4 className="fw-bold">Who We Are</h4>
              <p className="text-white text">
                Zepul<span class="align-super text-xs">™</span> is a
                comprehensive Talent Acquisition Services Platform that brings
                together all stakeholders onto a single platform & stays true to
                the traditional recruitment model while integrating Artificial
                Intelligence, workload automation tools & procedures to
                streamline hiring processes, reduce pain points, and boost the
                effectiveness of human intervention across the Talent
                Acquisition lifecycle.
              </p>
              <p className="text-white">
                Our on-demand community-based recruitment blended with ZepDB
                <span class="align-super text-xs">™</span> powered by Al can
                source & match accurate candidate profiles with job requirements
                from thousands of active candidate profiles.
              </p>
              <p className="text-white">
                Our multi layer screening system combines Al and human expertise
                to generate a comprehensive scorecard for you to make an
                accurate candidate assessment, while our dynamic application
                tracking system lets you track and govern the overall workflow.
              </p>
            </section>
            <section className="recruitment-platform-section ">
                  <RecruitmentPlatform />
            </section>
            {/* <section className="d-flex row innovation py-md-2  align-items-center">
              <div className="col-md-6 mt-5">
                <div className="home-content">
                  <p className="color-title mb-2 fw-semibold">
                    Unlocking Innovation
                  </p>
                  <h1>
                    Experience the
                    <br /> Power of Zepul 's Features
                  </h1>
                </div>
              </div>
              <div className="col-md-6 mt-md-5">
                <p className="w-md-75">
                  Unleash efficient hiring with our powerful suite of tools.
                  Streamline your workflow, gain data-driven insights to attract
                  top talent, and simplify the entire recruitment process.
                </p>
              </div>
            </section> */}
            {/* <section className="whats-inside d-flex row justify-content-around">
              <div className="col-md-6">
                <h1 className="">See What's inside</h1>
                <p>
                  Uncover the features that unlock efficient and effective
                  <br /> hiring.
                </p>

                <div className="dropdowns mt-5 position-relative">
                  {data.map((item, index) => {
                    return (
                      <div
                        className="dropdowns-item w-md-75 w-xl-50 p-3 mt-3 mb-3"
                        key={index}
                      >
                        <h5>{item.title}</h5>
                        <p className="mb-0 ">{item.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="col-md-6 position-relative d-flex justify-content-center">
                <img
                  src="/assets/2. Experience the  Power of Zepul_s Features.png"
                  alt=""
                  className="w-100"
                />
              </div>
            </section> */}
            {/* <section className="what-we-are-solving    mt-5">
              <div className="row">
                <div className="home-content">
                  <p className="color-title mb-2 fw-semibold">
                    Why Businesses Choose Us
                  </p>
                  <h1>Simplifying Complexities in Recruitment</h1>
                  <p className="w-md-75 mt-sm-4">
                    Struggling with a slow, inefficient recruitment process?
                    You're not alone. Finding the right talent can be
                    time-consuming and frustrating. Choose Zepul to overcome the
                    Talent Acquisition challenges.
                  </p>
                </div>
              </div>
              <div className="row justify-content-center">
                <div className="col-md-6 col-xl-5">
                  <ul className="p-0">
                    <li className="why-list">
                      <div>
                        <FaHome />
                      </div>
                      <span className="list-text">
                        Use it all for free platform which includes ATS
                      </span>
                    </li>
                    <li className="why-list">
                      <div>
                        <FaUser />
                      </div>
                      <span className="list-text">
                        Dedicated Account Manager
                      </span>
                    </li>
                    <li className="why-list">
                      <div>
                        <FaSearch />
                      </div>
                      <span className="list-text">
                        Only active profiles and quality equals few dropouts
                      </span>
                    </li>
                    <li className="why-list">
                      <div>
                        <FaGlobe />
                      </div>
                      <span className="list-text">Free Employer Branding</span>
                    </li>
                    <li className="why-list">
                      <div>
                        <FaCheck />
                      </div>

                      <span className="list-text">Easy to Adapt</span>
                    </li>
                    <li className="why-list">
                      <div>
                        <FaCartPlus />
                      </div>
                      <span className="list-text">
                        One Stop Shop-Right from Requisition to Onboarding
                      </span>
                    </li>
                  </ul>
                </div>
                <div className="col-md-6 col-xl-5">
                  <ul className="p-0">
                    <li className="why-list2">
                      <img src="/assets/why1.png" alt="" />
                      <span className="list-text">
                        Great candidate Experience{" "}
                      </span>
                    </li>
                    <li className="why-list2">
                      <img src="/assets/why2.png" alt="" />
                      <span className="list-text">
                        80% increase in productivity{" "}
                      </span>
                    </li>
                    <li className="why-list2">
                      <img src="/assets/why3.png" alt="" />
                      <span className="list-text">
                        {" "}
                        Data driven decision making
                      </span>
                    </li>
                    <li className="why-list2">
                      <img src="/assets/why4.png" alt="" />
                      <span className="list-text">
                        50% improvement in quality
                      </span>
                    </li>
                    <li className="why-list2">
                      <img src="/assets/why5.png" alt="" />
                      <span className="list-text">Sharp decline in TAT</span>
                    </li>
                    <li className="why-list2">
                      <img src="/assets/why6.png" alt="" />
                      <span className="list-text">
                        Significant Cost Savings
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="d-flex row innovation py-md-3  align-items-center">
              <div className="col-md-6 mt-5">
                <div className="home-content">
                  <p className="color-title mb-2 fw-semibold">What We Offer</p>
                  <h1>
                    Unlock Powerful Solutions <br />
                    Designed for Your Hiring Needs
                  </h1>
                </div>
              </div>
              <div className="col-md-6 mt-2">
                <p className="w-md-75 color-para">
                  Explore a wide range of full-time, Pay per Hour, Pay per Hire
                  services across various geographies and industries.
                </p>
                <p className="w-md-75">
                  Zepul goes beyond just connecting you with candidates. We
                  offer a comprehensive suite of services designed to streamline
                  your entire recruitment process and empower you to make
                  smarter hiring decisions
                </p>
              </div>
            </section>
            <section className="">
              <div className="row">
                <div className="col-md-6 col-sm-6 col-lg-3 cards ">
                  <div className="serviceBox position-relative">
                    <div className="font">
                      <img src="/assets/fulltime.png" alt="" />

                      <h3 className="title">FullTime</h3>
                    </div>
                    <div className="back position-absolute">
                      <p className="description text-white">
                        Candidate on customer payroll and payment to us would be
                        a one time incident.(% of candidate CTC)
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-sm-6 col-lg-3 cards">
                  <div className="serviceBox position-relative ">
                    <div className="font">
                      <img src="/assets/contractual.png" alt="" />
                      <h3 className="title">Contractual</h3>
                    </div>
                    <div className="back position-absolute">
                      <p className="description">
                        Candidate on our payroll and payment to us would be
                        monthly recurring.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-sm-6 col-lg-3 cards">
                  <div className="serviceBox position-relative">
                    <div className="font">
                      <img src="/assets/payper-hour.png" alt="" />
                      <h3 className="title">Gig Workforce</h3>
                    </div>
                    <div className="back position-absolute">
                      <p className="description">
                        Small scale project-we engage resources for the
                        specified projects time and the payment would be on
                        hourly basis.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-sm-6 col-lg-3 cards">
                  <div className="serviceBox position-relative">
                    <div className="font">
                      <img src="/assets/projects.png" alt="" />
                      <h3 className="title">Projects</h3>
                    </div>
                    <div className="back position-absolute">
                      <p className="description">
                        Medium to Large scale development projects wherein we
                        take care of end to end project management including
                        resource allocation untill the completion of projects.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            <section className="cards mt-2  mb-3">
              <div className="row justify-content-between">
                {cardData.map((item, index) => {
                  return (
                    <div
                      className="col-md-5 col-xl-3 card-item d-flex   flex-column justify-content-center align-items-center gap-3 p-0"
                      key={index}
                      style={{ background: `url(${item.image})` }}
                    >
                      <img src={item.image} alt="" />
                      <h3>{item.title}</h3>
                    </div>
                  );
                })}
              </div>
            </section> */}
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default Home;
