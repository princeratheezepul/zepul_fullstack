import React from "react";

const TalentHubHeader = () => {
  return (
    <header className="container mx-auto px-4 py-8 md:py-12">
      <div
        className="text-[#024bff] uppercase"
        style={{
          fontFamily: '"DM Sans", sans-serif',
          fontWeight: 500,
          fontSize: "16px",
          lineHeight: "100%",
          letterSpacing: "-0.05em", // -5%
          marginBottom: "0.5rem",
        }}
      >
        ZEP TALENT HUB
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div className="max-w-2xl">
          <h1
            className="text-black mb-4 font-[500] leading-[100%] tracking-[0em]"
            style={{
              fontFamily: '"DM Sans", sans-serif',
            }}
          >
            <span className="text-[32px] sm:text-[42px] md:text-[48px] lg:text-[58px] block">
              Zep Talent Hub:
              <br />
              The Future of Smart Hiring
            </span>
          </h1>
        </div>

        <div className="max-w-md mt-4 md:mt-0">
          <p
            className=" text-[#024bff]"
            style={{
              fontFamily: '"DM Sans", sans-serif',
              fontWeight: 400,
              fontSize: "20px",
              lineHeight: "100%",
              letterSpacing: "-0.05em",
            }}
          >
            De-risk your hiring with Zep Talent Hub – get access to pre-vetted,
            performance-ready talent at competitive rates and rapid turnaround.
            Unlike traditional job portals, we deliver reliable, AI/data-backed
            candidate profiles you can trust.
          </p>
        </div>
      </div>
    </header>
  );
};

export default TalentHubHeader;
