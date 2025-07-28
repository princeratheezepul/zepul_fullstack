import React from "react";

const FeatureCard = ({ title, description, src }) => {
  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-8 flex flex-col h-full">
      <div className="flex flex-1">
        <div className="flex flex-col items-center justify-start w-full">
          <h2
            style={{
              fontFamily: '"DM Sans", sans-serif',
              fontWeight: 400,
              fontSize: "38px",
              lineHeight: "100%",
              letterSpacing: "0%",
            }}
            className="mb-4 text-[32px] md:text-[44px]"
          >
            {title}
          </h2>
          <img src={src} alt="" className="md:hidden w-[60%] mb-4" />
        </div>
        <div className="hidden md:flex items-start">
          <img src={src} alt="" />
        </div>
      </div>

      {/* Description at the bottom with 1rem (mb-4) */}
      <p
        style={{
          fontFamily: '"DM Sans", sans-serif',
          fontWeight: 400,
          fontSize: "16px",
          lineHeight: "100%",
          letterSpacing: "-0.05em",
          color: "#4D4D4D",
        }}
        className="mb-16 sm:text-[20px] text-[18px] md:text-[24px]"
      >
        {description}
      </p>
    </div>
  );
};

const FeatureCards = () => {
  const features = [
    {
      title: "AI-Based Resume Score",
      description:
        "Evaluates skills, experience, and job relevance using advanced AI",
      img: "assets/cpe.png",
    },
    {
      title: "Comprehensive Human Evaluation",
      description:
        "Our experts assess soft skills, cultural fit, and job readiness",
      img: "assets/cpe2.png",
    },
    {
      title: "Enhanced insights",
      description:
        "Additional checks like BGV and functional scores ensure quality hires",
      img: "assets/cpe3.png",
    },
    {
      title: "Verified Candidate Resume",
      description:
        "Access comprehensive scorecard for an in-depth candidate review",
      img: "assets/cpe4.png",
    },
  ];

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            title={feature.title}
            description={feature.description}
            src={feature.img}
          />
        ))}
      </div>
    </section>
  );
};

export default FeatureCards;
