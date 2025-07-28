import {
  UserCircle,
  MapPin,
  Calendar,
  Users,
  BarChart,
  CheckCircle,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom"; 
export default function RecruitmentPlatform() {
  const navigate = useNavigate();

  return (
    <div className="w-full mt-4 max-w-10xl mx-auto px-4 py-8 md:py-12">
      <div className="text-xs uppercase tracking-wider text-blue-600 font-semibold mb-2">
        UNLOCKING INNOVATION
      </div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 leading-tight">
            Purpose-Driven Products &<br className="hidden md:block" />
            Services for Modern Recruitment
          </h1>
        </div>
        <div>
          <p className="text-sm md:text-base text-[#024bff] font-[400] text-[16px] mb-8 max-w-2xl hidden lg:flex ml-4">
            Unleash efficient hiring with our powerful suite of tools.
            Streamline your workflow, gain data-driven insights to attract top
            talent, and simplify the entire recruitment process.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
        {/* Zep Recruit Card */}
        <div className="overflow-hidden border rounded-xl  shadow-sm bg-white md:h-[50vh] lg:h-[45vh] ">
          <div className="flex flex-col justify-between h-full">
            <div className="p-6 pb-0 flex flex-col md:gap-12">
              <div>
                <div className="uppercase text-xs text-blue-600 font-semibold mb-2 ">
                  SEAMLESS RECRUITMENT FROM SOURCE TO HIRE
                </div>
                <h2 className="text-2xl font-bold mb-2">Zep Recruit</h2>
              </div>
              <div className="md:w-[40%] lg:w-[50%] w-[80%]">
                <p className="text-sm text-gray-600">
                  A Legacy ‘Pay After Successful Placement’ Model, Reimagined
                  with AI to Reduce Cost, Time, and Complexity.
                </p>
              </div>
            </div>
            <div className="md:p-6 py-2 px-4 pt-0">
              <button
                style={{ borderRadius: "6px" }}
                onClick={() => navigate("/zeprecruit")}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 md:w-[10rem] w-full text-sm transition-colors duration-200 shadow-sm"
              >
                Try Zepul
              </button>
            </div>
          </div>

          <div className="p-6 pt-4 relative min-h-[200px]">
            <div className="absolute  md:bottom-[12.5rem] bottom-[15.5rem] md:right-2  right-[12%]">
              <img
                src="/assets/rce.png?height=180&width=120"
                alt="Recruiter illustration"
                className="  h-[14rem] lg:h-[14rem] md:h-[12rem] 3xl:h-[22rem] 2xl:h-[19rem] "
              />
            </div>
          </div>
        </div>
        {/* Zep Pro Recruiter Card */}
        <div className="overflow-hidden border rounded-xl  shadow-sm bg-white md:h-[50vh] lg:h-[45vh] ">
          <div className="flex flex-col justify-between h-full">
            <div className="p-6 pb-0 flex flex-col md:gap-12">
              <div>
                <div className="uppercase text-xs text-blue-600 font-semibold mb-2 ">
                  DESIGNED FOR RECRUITERS. DRIVEN BY INTELLIGENCE.
                </div>
                <h2 className="text-2xl font-bold mb-2">Zep Pro Recruiter</h2>
              </div>
              <div className="md:w-[40%] lg:w-[50%] w-[80%]">
                <p className="text-sm text-gray-600">
                  Built for every recruiter. Boost productivity, hire quality
                  talent, move fast.
                </p>
              </div>
            </div>
            <div className="md:p-6 py-2 px-4 pt-0">
              <button
                style={{ borderRadius: "6px" }}
                onClick={() => navigate("/prorecruitor")}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 md:w-[10rem] w-full text-sm transition-colors duration-200 shadow-sm"
              >
                Try Zepul
              </button>
            </div>
          </div>

          <div className="p-6 pt-4 relative min-h-[200px]">
            <div className="absolute  md:bottom-[13.5rem] bottom-[15.5rem] md:right-2 right-[30%]">
              <img
                src="/assets/rce2.png?height=180&width=120"
                alt="Recruiter illustration"
                className="  h-[14rem] md:h-[12rem] lg:h-[14rem] 3xl:h-[22rem] 2xl:h-[18rem] "
              />
            </div>
          </div>
        </div>
        {/* Zep Talent Hub Card */}
        <div className="overflow-hidden border rounded-xl  shadow-sm bg-white md:h-[50vh] lg:h-[45vh] ">
          <div className="flex flex-col justify-between h-full">
            <div className="p-6 pb-0 flex flex-col md:gap-12">
              <div>
                <div className="uppercase text-xs text-blue-600 font-semibold mb-2 ">
                  BUY LESS TIME. WASTED. BUY VETTED TALENT.
                </div>
                <h2 className="text-2xl font-bold mb-2">Zep Talent Hub</h2>
              </div>
              <div className="md:w-[40%] lg:w-[50%] w-[80%]">
                <p className="text-sm text-gray-600">
                  Access pre-vetted talent data - curated and ready for hire.
                </p>
              </div>
            </div>
            <div className="md:p-6 py-2 px-4 pt-0">
              <button
                style={{ borderRadius: "6px" }}
                onClick={() => navigate("/zepTalentHub")}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 md:w-[10rem] w-full text-sm transition-colors duration-200 shadow-sm"
              >
                Try Zepul
              </button>
            </div>
          </div>

          <div className="p-6 pt-4 relative min-h-[200px]">
            <div className="absolute  md:bottom-[14.5rem] bottom-[15.5rem] md:right-2 right-[30%] 2xl:bottom-[12.5rem] 3xl:bottom-[15.5rem]">
              <img
                src="/assets/rce3.png?height=180&width=120"
                alt="Recruiter illustration"
                className="  h-[14rem] md:h-[12rem] lg:h-[14rem] 3xl:h-[22rem] 2xl:h-[18rem]"
              />
            </div>
          </div>
        </div>
        {/* Zep On demand Card */}
        <div className="overflow-hidden border rounded-xl  shadow-sm bg-white md:h-[50vh] lg:h-[45vh] ">
          <div className="flex flex-col justify-between h-full">
            <div className="p-6 pb-0 flex flex-col md:gap-12">
              <div>
                <div className="uppercase text-xs text-blue-600 font-semibold mb-2 ">
                  SCALE YOUR TEAM. MINUS THE OVERHEAD.
                </div>
                <h2 className="text-2xl font-bold mb-2">Zep On demand</h2>
              </div>
              <div className="md:w-[40%] lg:w-[50%] w-[80%]">
                <p className="text-sm text-gray-600">
                  Flexible recruitment support, available whenever you need it.
                </p>
              </div>
            </div>
            <div className="md:p-6 py-2 px-4 pt-0">
              <button
                style={{ borderRadius: "6px" }}
        
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 md:w-[10rem] w-full text-sm transition-colors duration-200 shadow-sm"
              >
                Try Zepul
              </button>
            </div>
          </div>

          <div className="p-6 pt-4 relative min-h-[200px]">
            <div className="absolute  md:bottom-[14.5rem] bottom-[15.5rem] md:right-2 right-[30%] 2xl:bottom-[13.5rem] 3xl:bottom-[15.5rem]">
              <img
                src="/assets/zepondemand.png?height=180&width=120"
                alt="Recruiter illustration"
                className="  h-[14rem] md:h-[12rem] lg:h-[14rem] 3xl:h-[22rem] 2xl:h-[18rem]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
