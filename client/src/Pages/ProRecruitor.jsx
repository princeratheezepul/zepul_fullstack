import React from 'react';

const ProRecruitor = () => {
  return (
    <div className="font-sans text-black">
      <section className="bg-white px-6 md:px-20 py-12">
        <p className="text-sm text-blue-700 font-medium mb-2">ZEP PRO RECRUITER</p>
        <h1 className="text-2xl md:text-5xl font-bold max-w-4xl mb-6">
          AI–Powered Comprehensive Recruitment Management Suite: Transforming Recruiters into Pro Recruiters
        </h1>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-36">
          <img src="/assets/prorecruit1.png" alt="Hero" className="w-full md:w-1/2 rounded-md" />
          <div className="md:w-1/2 space-y-4 text-gray-600 text-base">
            <p className='leading-relaxed'>
              In the fast-evolving world of talent acquisition, staying ahead demands more than just experience—
              it demands intelligent efficiency and automation. Zep Pro Recruiter, an AI-Powered Comprehensive
              Recruitment Management Suite, is the future of recruitment.
            </p>
            <p className='leading-relaxed'>
              Designed to empower recruiters while streamlining hiring processes, we ensure data-driven decisions,
              improved candidate engagement, and intelligent automation that makes recruitment faster, smarter, and
              more effective.
            </p>
            <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">
              Try Zepul
            </button>
          </div>
        </div>
      </section>

      <section className="px-6 md:px-20 py-16 bg-gray-50">
        <p className="text-sm text-blue-700 font-medium mb-2">ZEP PRO RECRUITER</p>
        <h1 className="text-2xl md:text-5xl font-bold max-w-3xl mb-10">
          Unlocking Efficiency: Optimizing Resources for Maximum Business Impact
        </h1>

        <div className="flex flex-col lg:flex-row gap-10">
          <div className="flex flex-col gap-6 lg:w-2/3">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 border border-gray-300 rounded-xl p-4 bg-white">
                <img src="/assets/features1.png" alt="AI-Driven" className="mb-4 w-full h-40 object-contain" />
                <h2 className="text-lg font-semibold mb-2">AI-Driven Candidate Sourcing</h2>
                <p className="text-sm text-gray-600">
                  Intelligent algorithms scan internal & external databases and social networks to find the best talent. Automated candidate ranking based on skill match, experience, and cultural fit.
                </p>
              </div>

              <div className="flex-1 border border-gray-300 rounded-xl p-4 bg-white">
                <img src="/assets/features2.png" alt="Smart Resume" className="mb-4 w-full h-40 object-contain" />
                <h2 className="text-lg font-semibold mb-2">Smart Resume Parsing & Screening</h2>
                <p className="text-sm text-gray-600">
                  AI-powered parsing extracts key candidate information instantly. Our automated scoring system ranks candidates based on job requirements while allowing your recruiters to screen them at stage two to generate a comprehensive report card.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-6 border border-gray-300 rounded-xl bg-white p-4">
              <div className="flex-1">
                <h2 className="text-lg font-semibold mb-2">Advanced Candidate Engagement & Assessment</h2>
                <p className="text-sm text-gray-600">
                  Automated pre-screening questions filter out unqualified applicants, thus reducing the pre-screening process.
                </p>
              </div>
              <img src="/assets/features3.png" alt="Engagement" className="h-40 w-full md:w-1/2 object-contain" />
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-6">
            <div className="border border-gray-300 rounded-xl p-4 bg-white">
              <div className="flex flex-col xl:flex-row ">
              <h2 className="text-lg font-semibold mb-2">Intelligent Interview Scheduling</h2>
              <img src="/assets/features4.png" alt="Interview Scheduling" className="mb-4 w-full h-40 object-contain" />
              </div>
              <p className="text-sm text-gray-600">
                AI-driven scheduling syncs with recruiters' and candidates' calendars. Our automated reminders and rescheduling reduce no-shows. Virtual interview integrations with video conferencing tools.
              </p>
            </div>

            <div className="border border-gray-300 rounded-xl p-4 bg-white">
            <div className="flex flex-col xl:flex-row ">

             <h2 className="text-lg font-semibold mb-2">Predictive Analytics & Data-Driven Insights</h2>
             <img src="/assets/features5.png" alt="Analytics" className="mb-4 w-full h-40 object-contain" />
             </div>
              <p className="text-sm text-gray-600">
                AI analyzes historical hiring data to predict job success rates. Recruitment trend insights help optimize hiring strategies. Customizable dashboards track recruitment KPIs in real time.
              </p>
            </div>
          </div>
        </div>
      </section>

      
      <section className="px-6 md:px-20 py-16 bg-white flex flex-col lg:flex-row gap-10">
        <div className="flex-1">
          <p className="text-sm text-blue-700 font-medium mb-2">WHY BUSINESSES CHOOSE US</p>
          <h1 className="text-2xl md:text-5xl font-bold max-w-3xl mb-6">
            Benefits of Our AI–Powered Suite
          </h1>
          <p className="text-gray-600 max-w-xl mb-10">
            Automated tedious tasks, allowing recruiters to focus on high-value interactions.
          </p>
          <ul className="space-y-6 text-gray-800">
            {[
              { icon: "benefits1.png", title: "Faster Hiring", desc: "Automates tedious tasks, allowing recruiters to focus on high-value interactions." },
              { icon: "benefits2.png", title: "Better Talent Matches", desc: "AI-driven insights ensure the right candidates are shortlisted." },
              { icon: "benefits3.png", title: "Enhanced Candidate Experience", desc: "Personalized communication and efficient scheduling." },
              { icon: "benefits4.png", title: "Data-Backed Decisions", desc: "Minimize hiring biases and make recruitment truly strategic." },
              { icon: "benefits5.png", title: "Scalability", desc: "Adaptable to businesses of all sizes, from startups to enterprise." }
            ].map(({ icon, title, desc }, idx) => (
              <li key={idx} className="flex items-start space-x-4">
                <img src={`/assets/${icon}`} className="h-5 w-5 mt-1" alt={title} />
                <div>
                  <h5 className="font-medium">{title}</h5>
                  <p className="text-sm text-gray-600">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <img src="/assets/prorecruit2.png" alt="Benefits" className="w-full lg:w-[40%] object-contain" />
      </section>

      <section className="px-6 md:px-20 py-16 bg-gray-50 flex flex-col-reverse lg:flex-row items-center justify-between gap-10">
        <div className="flex-1">
          <p className="text-sm text-blue-700 font-medium mb-2">WHY BUSINESSES CHOOSE US</p>
          <h1 className="text-2xl md:text-3xl font-semibold max-w-3xl mb-6">
            Unlocking Efficiency: <br /> Optimizing Resources for <br /> Maximum Business Impact
          </h1>
          <p className="text-gray-700">
            With our AI-Powered Comprehensive Recruitment <br />
            Management Suite, recruiters evolve from traditional <br />
            hiring professionals to <span className="text-blue-700 font-medium">Pro Recruiters.</span>
          </p>
        </div>
        <img src="/assets/prorecruit3.png" alt="Final Visual" className="flex-1 max-w-full object-contain w-80  h-80" />
      </section>
      
      <section className="bg-blue-700 text-white px-6 md:px-20 py-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-lg md:text-xl font-semibold">Make Smarter Hiring Decisions <br /> with Zep Pro Recruiter</h2>
            <p className="text-sm opacity-80">Say goodbye to hiring inefficiencies and hello to Higher- <br /> quality time</p>
          </div>
          <button className="bg-white text-black w-56 h-12 font-medium px-6 py-2 rounded hover:bg-gray-100 transition">
            Try Zepul
          </button>
        </div>
      </section>
    </div>
  );
};

export default ProRecruitor;