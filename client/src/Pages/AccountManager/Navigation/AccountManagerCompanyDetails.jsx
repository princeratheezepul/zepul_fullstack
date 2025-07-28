import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const AccountManagerCompanyDetails = () => {
  const { companyId } = useParams();
  const [company, setCompany] = useState(null);
  const [managers, setManagers] = useState([]); // populated manager details
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        if (!userInfo?.data?.user?._id) {
          setError("Admin not logged in");
          return;
        }

        // Fetch company data (without populated managers)
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/company/getcompany/${companyId}`,
          {
            headers: {
              Authorization: `Bearer ${userInfo.data.accessToken}`,
            },
          }
        );

        if (!res.ok) {
          setError("Failed to fetch company data");
          return;
        }

        const data = await res.json();
        setCompany(data.company);

        // Fetch manager details for each assigned manager
        if (data.company.assignedTo?.length > 0) {
          const managerDetails = await Promise.all(
            data.company.assignedTo.map(async (assign) => {
              const mgrRes = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/manager/${assign.managerId}`,
                {
                  headers: {
                    Authorization: `Bearer ${userInfo.data.accessToken}`,
                  },
                }
              );
              if (!mgrRes.ok) return null;
              const mgrData = await mgrRes.json();
              return {
                ...assign,
                managerDetails: mgrData.manager, // assume API returns { manager: {...} }
              };
            })
          );
          setManagers(managerDetails.filter(Boolean)); // filter out nulls if any fetch failed
        }
      } catch (err) {
        console.error(err);
        setError("Server error");
      }
    };

    fetchCompany();
  }, [companyId]);

  if (error) return <div className="text-red-500 p-4">{error}</div>;

  if (!company) return <div className="p-4 text-white">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-800 text-white rounded-lg shadow-lg">
      <button
        className="mb-4 bg-gray-600 px-3 py-1 rounded hover:bg-gray-700"
        onClick={() => navigate(-1)}
      >
        Back
      </button>

      <h1 className="text-3xl font-bold mb-4">{company.name}</h1>

      <p>
        <strong>Description:</strong> {company.description || "N/A"}
      </p>
      <p>
        <strong>Location:</strong> {company.location || "N/A"}
      </p>
      <p>
        <strong>Website:</strong>{" "}
        {company.website ? (
          <a
            href={company.website}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-blue-400"
          >
            {company.website}
          </a>
        ) : (
          "N/A"
        )}
      </p>
      <p>
        <strong>Contact:</strong> {company.contact || "N/A"}
      </p>
      <p>
        <strong>Industry Size:</strong> {company.industrysize || "N/A"}
      </p>

      <div className="mt-4">
        <strong>Managers Assigned:</strong>
        {managers.length === 0 ? (
          <p>No managers assigned</p>
        ) : (
          managers.map(({ managerDetails, note }, index) => (
            <p key={index}>
              {managerDetails?.fullname} ({managerDetails?.email}) {note && `- Note: ${note}`}
            </p>
          ))
        )}
      </div>
    </div>
  );
};

export default AccountManagerCompanyDetails;
