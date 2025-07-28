import React from "react";
const ReasonCard = ({ title, description, src }) => {
  return (
    <div className="border border-gray-200 rounded-3xl overflow-hidden flex flex-col h-full mt-8">
      {/* Image wrapper with fixed height */}
      <div className="flex items-center justify-center min-h-[220px] px-6 pt-8">
        <img src={src} alt={title} className="object-contain max-h-[180px]" />
      </div>

      {/* Text content, uniformly aligned */}
      <div className="p-6 flex flex-col justify-start flex-grow">
        <h3
          className="mb-2"
          style={{
            fontFamily: '"DM Sans", sans-serif',
            fontWeight: 500,
            fontSize: "28px",
            lineHeight: "100%",
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </h3>

        <p
          className="text-gray-600"
          style={{
            fontFamily: '"DM Sans", sans-serif',
            fontWeight: 400,
            fontSize: "14px",
            lineHeight: "100%",
            letterSpacing: "-0.05em",
          }}
        >
          {description}
        </p>
      </div>
    </div>
  );
};



const WhyChooseSection = () => {
  const reasons = [
    {
      title: "No More Guesswork",
      description:
        "Our data-driven insights take the uncertainty out of hiring.",
      img: "assets/cpe5.png",
    },
    {
      title: "Pre-Vetted Talent",
      description: "Access by both AI and human experts",
      img: "assets/cpe6.png",
    },
    {
      title: "Reduce Hiring Costs",
      description: "Save on internal recruitment expenses",
      img: "assets/cpe7.png",
    },
    {
      title: "Faster & Smarter Hiring",
      description: "Access job-ready candidates instantly",
      img: "assets/cpe8.png",
    },
  ];

  return (
    <section className="container mx-auto px-4 py-12">
      <h2
        className="text-center mb-12"
        style={{
          fontFamily: '"DM Sans", sans-serif',
          fontWeight: 500,
          fontSize: "clamp(1rem, 2vw, 30px)",
          // Responsive font size
          lineHeight: "100%",
          letterSpacing: "0",
        }}
      >
        Why Choose Zep Talent Hub?
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {reasons.map((reason, index) => (
          <ReasonCard
            key={index}
            title={reason.title}
            description={reason.description}
            src={reason.img}
          />
        ))}
      </div>
    </section>
  );
};

export default WhyChooseSection;
