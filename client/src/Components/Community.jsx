import React, { Fragment } from "react";
import PropTypes from "prop-types";

const Community = ({ data }) => {
  return (
    <Fragment>
      <div className="row  py-5 p-sm-4 ">
        <section className="row col-md-12 justify-content-between border-2 community m-5">
          {data.map((item) => {
            return (
              <div
                className="col-md-4 d-flex align-items-sm-center align-items-md-start flex-column border-md-end p-sm-3"
                key={item.title}
              >
                <h3>{item.title}</h3>
                <p className="text-sm-center text-md-start">
                  {item.description}
                </p>
              </div>
            );
          })}
        </section>
      </div>
    </Fragment>
  );
};
Community.propTypes = {
  data: PropTypes.object.isRequired,
};

export default Community;
