import React, { Fragment, useState } from "react";
import { Tabs, Tab } from "@mui/material";
import PropTypes from "prop-types";
import "../styles/Tabs.css";
import TabContent from "./TabsContent";

const Commontabs = ({ data }) => {
  const { tab_title, tab_Content } = data;
  const [value, setValue] = useState(1);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  // const selectedContent = tab_Content.find((content) => content.id === value);

  return (
    <Fragment>
      <section className="tabs mt-md-2">
        <div className="container-fluid ">
          <Tabs
            value={value}
            onChange={handleChange}
            className="tabs d-flex gap-5 flex-wrap"
          >
            {tab_title.map((item) => (
              <Tab
                className="tab"
                key={item.id}
                label={item.title}
                value={item.id}
              />
            ))}
          </Tabs>

          {/* Render content based on the selected tab value */}
          {tab_Content.map((content) => (
            <div
              key={content.id}
              hidden={content.id !== value}
              className="my-1"
            >
              <TabContent selectedContent={content} />
            </div>
          ))}
          
        </div>
      </section>
    </Fragment>
  );
};

Commontabs.propTypes = {
  data: PropTypes.shape({
    tab_title: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        title: PropTypes.string.isRequired,
      })
    ).isRequired,
    tab_Content: PropTypes.array.isRequired,
  }).isRequired,
};

export default Commontabs;
