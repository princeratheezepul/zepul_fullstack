import React, { Fragment } from "react";
import { Outlet } from "react-router-dom";
import Header from "../Shared/Header";
import Footer from "../Shared/Footer";

const PublicLayout = () => {
  return (
    <Fragment>
      <div className="wrapper d-flex flex-column justify-content-between h-full overflow-hidden">
        <Header />
        <Outlet />
        <Footer />
      </div>
    </Fragment>
  );
};

export default PublicLayout; 