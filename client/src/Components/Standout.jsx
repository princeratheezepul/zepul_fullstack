import React, { Fragment } from "react";
import "../styles/Standout.css";
const Standout = ({ data }) => {
  const { title, main_title, percentige } = data;
  return (
    <Fragment>
      <section className="standout p-md-1">
        <div className="row">
          <div className="py-3  w-75 ">
            <p className="text-start text-white color-title mb-0">{title}</p>
            <h2 className="text-start text-white ">{main_title}</h2>
          </div>
        </div>
        <div className="row py-md-1">
          {percentige.map((item) => {
            return (
              <div
                className="col-md-4 col-sm-4 d-flex align-items-md-center flex-column align-items-start "
                key={item.title}
              >
                <h1 className="fw-semibold">{item.title}</h1>
                <p className="text-white">{item.subtitle}</p>
              </div>
            );
          })}
        </div>
      </section>
    </Fragment>
  );
};

export default Standout;
