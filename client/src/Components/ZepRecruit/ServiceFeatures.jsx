export function ServiceFeatures() {
    const features = [
      "Dedicated Recruiters Allocation",
      "Focussed Hiring",
      "Dedicated Account Manager",
      "Offer Negotiation Team",
      "Real Time Tracking & Live Analytics",
      "Active Talent Data",
    ]
  
    return (
      <section className="container mx-auto px-4 py-16 border-t border-gray-200">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="border border-gray-200 rounded-3xl p-6 flex items-center">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-md flex items-center justify-center mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium">{feature}</h3>
            </div>
          ))}
        </div>
      </section>
    )
  }
  