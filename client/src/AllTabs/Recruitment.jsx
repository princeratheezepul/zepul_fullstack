import React, { Fragment } from "react";
import Commontabs from "../Components/TabsForAllPage";
import { RecruiterData } from "../Data/RecruterData";

const RecruitmentTabs = () => {
  return (
    <Fragment>
      <Commontabs data={RecruiterData} />
    </Fragment>
  );
};

export default RecruitmentTabs;
