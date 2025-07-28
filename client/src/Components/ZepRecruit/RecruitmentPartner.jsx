const RecruitmentPartner = () => {
  return (
    <div className="bg-blue-600 text-white w-full">
      <div className="container mx-auto px-8 md:px-12 pt-12 pb-4 flex flex-col">
        {/* Header - only visible on desktop */}
        <p
          className="hidden md:block mb-4 uppercase"
          style={{
            fontFamily: '"Helvetica Now Display", sans-serif',
            fontWeight: 500,
            fontSize: "16px",
            lineHeight: "100%",
            letterSpacing: "0",
            textTransform: "uppercase",
          }}
        >
          STAND OUT WITH US
        </p>

        <div className="mt-auto md:flex md:justify-between md:items-center">
          <div className="mb-8 md:mb-0 max-w-xl">
            <h2
              className="font-bold leading-[100%] tracking-[0%] mb-2"
              style={{
                fontFamily: "DM Sans",
                fontSize: "clamp(28px, 6vw, 44px)", // Responsive from 28px up to 44px
              }}
            >
              Make Smarter Hiring Decisions with Zep Talent Hub
            </h2>
          </div>

          {/* Sign In button */}
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

        {/* Stats section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-4 mb-4 mt-12 md:mb-36 sm:ml-0 ml-8">
          {/* 80% Stat */}
          <div>
            <div
              className="font-normal leading-[100%] md:text-[100px] text-[64px]"
              style={{
                fontFamily: "DM Sans",
                letterSpacing: "0%",
              }}
            >
              3X
            </div>

            <div
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 200,
                fontSize: "20px",
                lineHeight: "100%",
                letterSpacing: "-0.05em",
              }}
            >
              Increase in Productivity
            </div>
          </div>

          {/* 20% Stat */}
          <div>
            <div
              className="font-normal leading-[100%] md:text-[100px] text-[64px]"
              style={{
                fontFamily: "DM Sans",
                letterSpacing: "0%",
              }}
            >
              40%
            </div>
            <div
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 200,
                fontSize: "20px",
                lineHeight: "100%",
                letterSpacing: "-0.05em",
              }}
            >
              Increase in Hiring Speed
            </div>
          </div>

          {/* 50% Stat */}
          <div>
            <div
              className="font-normal leading-[100%] md:text-[100px] text-[64px]"
              style={{
                fontFamily: "DM Sans",
                letterSpacing: "0%",
              }}
            >
              80%
            </div>
            <div
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 200,
                fontSize: "20px",
                lineHeight: "100%",
                letterSpacing: "-0.05em",
              }}
            >
              Improved Quality Hire
            </div>
          </div>
        </div>

        {/* Bottom section */}
      </div>
    </div>
  );
};

export default RecruitmentPartner;
