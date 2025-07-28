import React, { Fragment } from "react";
import "../styles/Header.css";
import { Link } from "react-router-dom";
import { FaBars, FaBurger } from "react-icons/fa6";
const Header = () => {
  return (
    <Fragment>
      <div className="container-fluid d-flex justify-content-between">
        <div className="container">
          <div className="d-flex justify-md-content-center  align-items-center justify-content-sm-between header col-md-12 col-sm-12 w-100">
            <div className=" logo">
              <Link to="/">
                <img src="/assets/logo.png" alt="logo" />
              </Link>
            </div>
            <nav className="navbar w-100">
              <ul className="nav-list d-flex w-100 justify-content-center gap-5 mb-0 p-0">
                <li className="nav-item">
                  <div className="flex flex-col leading-none">
                    <Link
                      to="/ZepRecruit"
                      className="nav-link uppercase"
                      style={{
                        color: "#024bff",
                        fontFamily: '"DM Sans", sans-serif',
                        fontWeight: 500,
                        fontSize: "16px",
                        lineHeight: 1,
                        letterSpacing: "-0.05em",
                        margin: 0,
                        padding: 0,
                        display: "block",
                      }}
                    >
                      Zep Recruit
                    </Link>
                    <p
                      style={{
                        fontSize: "12px",
                        margin: 0,
                        padding: 0,
                        color: "#666",
                        lineHeight: 1,
                        display: "block",
                        textAlign: "center", // <-- Center the text
                      }}
                    >
                      (For Employers)
                    </p>
                  </div>
                </li>

                <li className="nav-item">
                  <div className="flex flex-col leading-none">
                    <Link
                      to="/zepTalentHub"
                      className="nav-link uppercase"
                      style={{
                        color: "#024bff",
                        fontFamily: '"DM Sans", sans-serif',
                        fontWeight: 500,
                        fontSize: "16px",
                        lineHeight: 1,
                        letterSpacing: "-0.05em",
                        margin: 0,
                        padding: 0,
                        display: "block",
                      }}
                    >
                      Zep Talenthub
                    </Link>
                    <p
                      style={{
                        fontSize: "12px",
                        margin: 0,
                        padding: 0,
                        color: "#666",
                        lineHeight: 1,
                        display: "block",
                        textAlign: "center", // <-- Center the text
                      }}
                    >
                      (For Employers)
                    </p>
                  </div>
                </li>

                <li className="nav-item">
                  <div className="flex flex-col leading-none">
                    <Link
                      to="/prorecruitor"
                      className="nav-link uppercase"
                      style={{
                        color: "#024bff",
                        fontFamily: '"DM Sans", sans-serif',
                        fontWeight: 500,
                        fontSize: "16px",
                        lineHeight: 1,
                        letterSpacing: "-0.05em",
                        margin: 0,
                        padding: 0,
                        display: "block",
                      }}
                    >
                      Zep Pro Recruiter
                    </Link>
                    <p
                      style={{
                        fontSize: "12px",
                        margin: 0,
                        padding: 0,
                        color: "#666",
                        lineHeight: 1,
                        display: "block",
                        textAlign: "center", // <-- Center the text
                      }}
                    >
                      (For Recruiters)
                    </p>
                  </div>
                </li>

                <li className="nav-item">
                  <div className="flex flex-col leading-none">
                    <a
                      href="https://careers.zepul.com/"
                      className="nav-link uppercase"
                      style={{
                        color: "#024bff",
                        fontFamily: '"DM Sans", sans-serif',
                        fontWeight: 500,
                        fontSize: "16px",
                        lineHeight: 1,
                        letterSpacing: "-0.05em",
                        margin: 0,
                        padding: 0,
                        display: "block",
                      }}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Zep Jobs
                    </a>
                    <p
                      style={{
                        fontSize: "12px",
                        margin: 0,
                        padding: 0,
                        color: "#666",
                        lineHeight: 1,
                        display: "block",
                        textAlign: "center", // <-- Center the text
                      }}
                    >
                      (For Job Seeker)
                    </p>
                  </div>
                </li>
              </ul>
            </nav>

            <div className=" d-flex justify-content-end btn-grp align-items-center ">
              <nav className="mob-nav ">
                <button
                  type="button"
                  className="btn fs-4 border-0"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <FaBars />
                </button>
                <ul className=" dropdown-menu ">
                  <li className="nav-item">
                    <Link to="/ZepRecruit" className="nav-link dropdown-item" style={{
                        color: "#024bff",
                        fontFamily: '"DM Sans", sans-serif',
                        fontWeight: 500,
                        fontSize: "16px",
                        lineHeight: 1,
                        letterSpacing: "-0.05em",
                        margin: 0,
                        padding: 0,
                        display: "block",
                      }}>
                      Zep Recruit
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/zepTalentHub" className="nav-link dropdown-item" style={{
                        color: "#024bff",
                        fontFamily: '"DM Sans", sans-serif',
                        fontWeight: 500,
                        fontSize: "16px",
                        lineHeight: 1,
                        letterSpacing: "-0.05em",
                        margin: 0,
                        padding: 0,
                        display: "block",
                      }}>
                      Zep Talenthub
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/prorecruitor" className="nav-link dropdown-item" style={{
                        color: "#024bff",
                        fontFamily: '"DM Sans", sans-serif',
                        fontWeight: 500,
                        fontSize: "16px",
                        lineHeight: 1,
                        letterSpacing: "-0.05em",
                        margin: 0,
                        padding: 0,
                        display: "block",
                      }}>
                      Zep Pro Recruiter
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="https://careers.zepul.com" className="nav-link dropdown-item" style={{
                        color: "#024bff",
                        fontFamily: '"DM Sans", sans-serif',
                        fontWeight: 500,
                        fontSize: "16px",
                        lineHeight: 1,
                        letterSpacing: "-0.05em",
                        margin: 0,
                        padding: 0,
                        display: "block",
                      }}>
                      Zep Jobs
                    </Link>
                  </li>
                </ul>
              </nav>
              {/* <button className="sign-in-button btnn">sign In</button> */}
              <div className="attr-nav">
                <div className="dropdown">
                  <button
                    className="btn btn-secondary w-[8rem]"
                    type="button"
                    id="loginDropdown"
                    style={{ backgroundColor: "blue" }}
                    onClick={() => (window.location.href = "/login")}
                  >
                    Try Zepul
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default Header;
