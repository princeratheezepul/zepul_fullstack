export function HeroSection() {
  return (
    <section className="container mx-auto px-4 pt-12 pb-4 md:py-24">
      <div className="grid md:grid-cols-2 gap-12 items-start">
        {/* Left Section: Heading */}
        <div>
          <div
            className="mb-4 uppercase"
            style={{
              fontFamily: '"DM Sans", sans-serif',
              fontWeight: 500,
              fontSize: "16px",
              lineHeight: "100%",
              letterSpacing: "-0.05em", // -5%
              color: "#024bff",
            }}
          >
            ZEP RECRUIT
          </div>

          <h1
            style={{
              fontFamily: '"DM Sans", sans-serif',
              fontWeight: 500,
              fontSize: "58px",
              lineHeight: "100%",
              letterSpacing: "0%",
            }}
          >
            A Traditional Hiring Model, Re-Imagined with AI
          </h1>
        </div>

        {/* Right Section: Paragraph */}
        <div className="flex items-center justify-center md:pt-[5rem]">
          <p
            style={{
              fontFamily: '"DM Sans", sans-serif',
              fontWeight: 400,
              fontSize: "clamp(18px, 2vw, 20px)", // Responsive between 18px–20px
              color: "#024bff",
              lineHeight: "1", // 100%
              letterSpacing: "-0.05em", // -5%
            }}
          >
            With our ‘pay after successful placement’ approach, you invest only
            in results. Combined with AI-driven automation and human expertise,
            we reduce hiring costs, cut down time-to-fill, and deliver
            measurable ROI on every hire.
          </p>
        </div>
      </div>
    </section>
  );
}
