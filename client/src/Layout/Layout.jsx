import React, { Fragment } from "react";
import TopScroller from "../Components/TopScroller";
import Router from "../Routes/Router";

const Layout = () => {
  return (
    <Fragment>
      <div className="wrapper d-flex flex-column justify-content-between h-full overflow-hidden" >
      {/* <TopScroller /> */}
      <Router />
      </div>
    </Fragment>
  );
};

export default Layout;
