import React, { Fragment } from "react";
import "../styles/TopScroll.css";

const TopScroller = () => {
  return (
    <Fragment>
      <marquee>
        <p className="m-0 text-white">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Ut
          perferendis minus doloribus quam ipsam molestias commodi eos corporis
          expedita nisi!
        </p>
      </marquee>
    </Fragment>
  );
};

export default TopScroller;
