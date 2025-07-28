import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // or `next/router` if Next.js

const AccountManagerCompanyManagement = () => {
  const [company, setCompany] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate(); // For React Router (use useRouter for Next.js)

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  const fetchData = async () => {
    try {
      if (!userInfo?.data?.user?._id) {
        setError("Admin not logged in");
        return;
      }

      const companyRes = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/company/getcompany`,
        {
          headers: {
            Authorization: `Bearer ${userInfo.data.accessToken}`,
          },
        }
      );

      if (!companyRes.ok) {
        setError("Failed to fetch data from server");
        return;
      }

      const companyData = await companyRes.json();

      setCompany(
        Array.isArray(companyData?.companies)
          ? companyData.companies.filter((c) => c.name && c.name.trim() !== "")
          : []
      );
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Server error");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-800 text-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">Created Companies</h1>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="mt-10">
        {company.length === 0 ? (
          <p>No company found.</p>
        ) : (
          <ul className="space-y-4">
            {company.map((company) => (
              <li
                key={company._id}
                className="p-4 bg-gray-700 rounded flex justify-between items-center"
              >
                <h3 className="text-lg font-bold">{company.name}</h3>
                <button
                  onClick={() => navigate(`/accountmanager/companymanagement/${company._id}`)} // For React Router
                  // For Next.js, use: router.push(`/company/${company._id}`)
                  className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-700"
                >
                  Show
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AccountManagerCompanyManagement;
