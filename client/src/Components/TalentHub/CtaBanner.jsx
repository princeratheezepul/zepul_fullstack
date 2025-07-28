import React from "react";

const CtaBanner = () => {
  return (
    <section className="bg-[#0449FF] text-white py-12 px-4">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="mb-6 md:mb-0">
          <h2
            className="text-white mb-2"
            style={{
              fontFamily: '"DM Sans", sans-serif',
              fontWeight: 700,
              fontSize: "44px",
              lineHeight: "100%",
              letterSpacing: "0%",
            }}
          >
            Make Smarter Hiring Decisions with Zep Talent Hub
          </h2>

          <p
            className="text-white"
            style={{
              fontFamily: '"DM Sans", sans-serif',
              fontWeight: 400,
              fontSize: "16px",
              lineHeight: "100%",
              letterSpacing: "-0.05em",
            }}
          >
            Say goodbye to hiring inefficiencies and hello to higher-quality
            hire
          </p>
        </div>
        <button
          className="bg-white text-black py-3 rounded-md hover:bg-gray-100 transition-colors w-[18rem] md:w-[15rem] lg:w-[20rem]"
          style={{
            fontFamily: '"DM Sans", sans-serif',
            fontWeight: 700,
            fontSize: "20px",
            lineHeight: "100%",
            letterSpacing: "-0.05em",
          }}
        >
          Try Zepul
        </button>
      </div>
    </section>
  );
};

export default CtaBanner;
