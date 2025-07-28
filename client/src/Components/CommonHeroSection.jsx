import React, { Fragment } from "react";
import "../styles/HeroSection.css";

// eslint-disable-next-line react/prop-types
const CommonHeroSection = ({ title, subtitle, btnText, image,btnUrl }) => {
  return (
    <Fragment>
      <div className="container-fluid">
        <div className="row d-flex justify-content-between align-items-center">
          <div className="col-md-6 col-sm-12 col-xl-5">
            <div className="content">
              <h1 className="hero-title">{title}</h1>
              <p className="hero-text mt-3 ">{subtitle}</p>
            </div>
            <div className="btn-grp mt-5 d-flex gap-4">
              {/* <button className="sign-in-button hero">{btnText}</button> */}
              <a className="sign-in-button hero" href={btnUrl}>{btnText}</a>
            </div>
          </div>
          <div className="col-md-5 col-sm-12 col-xl-7 d-flex justify-content-center">
            <img src={image} alt="" className="hero-img w-md-50   mt-0" />
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default CommonHeroSection;
