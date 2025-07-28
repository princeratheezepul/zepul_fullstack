import React, { Fragment } from "react";
import "../styles/HeroSection.css";

const HeroSection = () => {
  return (
    <Fragment>
      <div className="container-fluid">
        <div className="row d-flex justify-content-between align-items-center">
          <div className="col-md-6 col-sm-12 col-xl-5 ">
            <div className="content">
              <h1 className="hero-title ">
                The{" "}
                <span className="blue">
                  Future Of <br />
                  Recruitment
                </span>{" "}
                Is Here.
              </h1>
              <p className="hero-text mt-3 ">
                Achieve your hiring goals{" "}
                <span className="fs-4 text-primary fw-bold">10x</span> faster by
                outsourcing talent acquisition to us, right from requisition to
                onboarding.
              </p>
              <p className="hero-text mt-3 blue">
                Leave the hiring to us, so you can focus on what matters the
                most.
              </p>
            </div>
            <div className="btn-grp mt-5 d-flex gap-4">
              {/* <a className="sign-in-button hero" href="https://app.zepul.com/login">Try Zepul</a> */}
              <button
                className="btn btn-secondary w-[8rem]"
                type="button"
                id="loginDropdown"
                style={{ backgroundColor: "blue", color: "white" }}
                onClick={() =>
                  (window.location.href = "/login")
                }
              >
                Try Zepul
              </button>

              {/* <button className="sign-in-button hero">Try Zepul</button> */}
              {/* <button className="learn-more-button hero">Learn more</button> */}
            </div>
          </div>
          <div className="col-md-5 col-sm-12 col-xl-7 order-lg-2 order-sm-first ">
            <img src="/assets/1.TFOR.png" alt="" className="hero-img" />
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default HeroSection;
