import React, { Fragment } from "react";
import Commontabs from "../Components/TabsForAllPage";
import { CompaniesData } from "../Data/CompaniesData";

const CompaniesTabs = () => {
  return (
    <Fragment>
      <Commontabs data={CompaniesData} />
    </Fragment>
  );
};

export default CompaniesTabs;
