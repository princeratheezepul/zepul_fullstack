export function FeatureCards() {
  const features = [
    {
      title: "One Stop Shop",
      description:
        "Your One-Stop Shop from Requisition to Onboarding: Simplify Your Hiring Process Today.",
      img: "assets/zeprecruit/zp1.png",
    },
    {
      title: "ZepDB - AI based Sourcing",
      description:
        "An AI-powered database that instantly sources top talent from a vast pool of profiles, ensuring the lowest TAT.",
      img: "assets/zeprecruit/zp2.png",
    },
    {
      title: "Multi-layer Screening (AI + Human)",
      description:
        "AI-driven screening blended with human evaluation to ensure unbiased, precise talent scoring and enhanced quality.",
      img: "assets/zeprecruit/zp3.png",
    },
    {
      title: "Comprehensive Report Card",
      description:
        "A comprehensive report card combining AI and human evaluations, the candidate's resume, and value-adds like background verification (BGV) and functional assessment scores.",
      img: "assets/zeprecruit/zp4.png",
    },
  ];

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-3xl p-6 h-full flex flex-col"
          >
            {/* Unified space for image and title */}
            <div style={{ minHeight: "280px" }} className="flex flex-col">
              <div className="mb-4">
                <img
                  src={feature.img}
                  alt=""
                  className="w-full h-[180px] object-contain"
                />
              </div>

              <h3
                style={{
                  fontFamily: '"DM Sans", sans-serif',
                  fontWeight: 500,
                  fontSize: "28px",
                  lineHeight: "100%",
                  height: "72px",
                  display: "flex",
                  // alignItems: "center",
                }}
              >
                {feature.title}
              </h3>
            </div>

            {/* Description, aligned uniformly */}
            <p
              className="text-gray-600 mt-4"
              style={{
                fontFamily: '"DM Sans", sans-serif',
                fontWeight: 400,
                fontSize: "16px",
                lineHeight: "140%",
                minHeight: "120px", // Reserve space for longest description
                display: "flex",
                alignItems: "flex-start",
              }}
            >
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
