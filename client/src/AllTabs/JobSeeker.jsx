import React, { Fragment } from "react";
import Commontabs from "../Components/TabsForAllPage";
import { JobsData } from "../Data/JobsData";

const JobsTabs = () => {
  return (
    <Fragment>
      <Commontabs data={JobsData} />
    </Fragment>
  );
};

export default JobsTabs;
