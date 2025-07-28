import React, { Fragment } from "react";
import PropTypes from "prop-types";

const TabContent = ({ selectedContent }) => {
  const { title, description, btn_txt, images, communityData } =
    selectedContent;

  return (
    <Fragment>
      <div className="row">
        <div className="col-md-6 d-flex justify-content-center">
          <img src={images || ""} alt={title} className="img-fluid w-md-75" />
        </div>
        <div className="col-md-6 d-flex flex-column justify-content-center align-items-md-start mt-sm-5 ">
          <h1 className="w-sm-100">{title}</h1>
          <p className="w-sm-100">{description}</p>
          <div className="btn-grp d-flex">
            <button className="sign-in-button tabs">{btn_txt}</button>
          </div>
        </div>
      </div>
      <div className="row justify-content-center   py-md-5">
        <section className="row col-md-12 justify-content-start border-2 community m-5">
          {Array.isArray(communityData) &&
            communityData.map((item) => (
              <div
                className={`col-md-4 d-flex align-items-sm-center align-items-md-start flex-column  p-sm-3 ${
                  item.id === 1 || item.id === 2 ? "border-end" : ""
                }`}
                key={item.title}
              >
                <h3>{item.title}</h3>
                <p className="text-sm-center text-md-start">
                  {item.description}
                </p>
              </div>
            ))}
        </section>
      </div>
    </Fragment>
  );
};

TabContent.propTypes = {
  selectedContent: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    btn_txt: PropTypes.string.isRequired,
    images: PropTypes.string,
    communityData: PropTypes.arrayOf(
      PropTypes.shape({
        title: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
      })
    ).isRequired,
  }).isRequired,
};

export default TabContent;
