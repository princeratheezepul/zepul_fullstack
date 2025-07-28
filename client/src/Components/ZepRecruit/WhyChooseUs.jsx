import features from "../../Data/WhyChooseUsFeatures";
export function WhyChooseUs() {
  return (
    <section className="container mx-auto px-4 py-16 bg-white">
      <div className="mb-12">
        <div
          className="text-[#024bff] uppercase mb-4"
          style={{
            fontFamily: '"DM Sans", sans-serif',
            fontWeight: 500,
            fontSize: "16px",
            lineHeight: "100%",
            letterSpacing: "-0.05em", // -5% letter spacing
          }}
        >
          WHY BUSINESSES CHOOSE US
        </div>

        <h2
          style={{
            fontFamily: '"DM Sans", sans-serif',
            fontWeight: 500,
            fontSize: "58px",
            lineHeight: "100%",
            letterSpacing: "0%",
          }}
          className="mb-4 leading-[100%] text-[42px] sm:text-[50px] md:text-[58px]" // Responsive font sizing
        >
          Recruitment,
          <br />
          Uncomplicated.
        </h2>

        <p
          style={{
            fontFamily: '"DM Sans", sans-serif',
            fontWeight: 400,
            fontSize: "20px",
            lineHeight: "100%",
            letterSpacing: "-0.05em", // -5%
            color: "#024bff",
          }}
          className="max-w-2xl mb-4"
        >
          Struggling with slow, inefficient hiring? You're not alone. Zepul
          helps you overcome talent acquisition challenges with ease.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <div key={index} className="border border-gray-200 rounded-3xl p-6">
            <div className="w-12 h-12 bg-[#0449FF] rounded-lg mb-4 flex items-center justify-center">
              <img src={feature.img} alt="" />
            </div>
            <h3
              style={{
                fontFamily: '"DM Sans", sans-serif',
                fontWeight: 500,
                fontSize: "18px",
                lineHeight: "20px",
                letterSpacing: "-0.02em", // -2%
                verticalAlign: "middle",
              }}
              className="mb-2"
            >
              {feature.title}
            </h3>

            <p
              style={{
                fontFamily: '"DM Sans", sans-serif',
                fontWeight: 400,
                fontSize: "16px",
                lineHeight: "100%",
                letterSpacing: "-0.05em", // -5%
                verticalAlign: "middle",
                color: "#4B5563", // Tailwind's text-gray-600
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
