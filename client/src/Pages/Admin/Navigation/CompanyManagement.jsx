import { useEffect, useState } from "react";

const CompanyManagement = () => {
  const [managers, setManagers] = useState([]);
  const [company, setCompany] = useState([]);
  const [error, setError] = useState("");

  const [assignNote, setAssignNote] = useState("");
  const [pendingAssign, setPendingAssign] = useState(null); 
  const [showAssignConfirm, setShowAssignConfirm] = useState(false);

  const [formData, setFormData] = useState({
    companytitle: "",
    description: "",
    website: "",
    location: "",
    industrysize: "",
    contact: "",
    adminId: "",
    managerId: "",
    note: "",  
  });
  const [showCreateConfirm, setShowCreateConfirm] = useState(false);

  const [editingIndustryId, setEditingIndustryId] = useState(null);
  const [industryEditValue, setIndustryEditValue] = useState("");

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const fetchData = async () => {
    try {
      if (!userInfo?.data?.user?._id) {
        setError("Admin not logged in");
        return;
      }

      const adminId = userInfo.data.user._id;

      const [adminRes, companyRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/getmanagerbyadmin/${adminId}`, {
          headers: { 'Authorization': `Bearer ${userInfo.data.accessToken}` }
        }),
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/get-company/${adminId}`, {
          headers: { 'Authorization': `Bearer ${userInfo.data.accessToken}` }
        })
      ]);

      if (!adminRes.ok || !companyRes.ok) {
        setError("Failed to fetch data from server");
        return;
      }

      const managerData = await adminRes.json();
      const companyData = await companyRes.json();

      setManagers(managerData?.managers || []);
      setCompany(Array.isArray(companyData?.companies) ? companyData.companies : []);
      setFormData(prev => ({ ...prev, adminId }));
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Server error");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowCreateConfirm(true);
  };

  const confirmCreateCompany = async () => {
    setShowCreateConfirm(false);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/create-company`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${userInfo.data.accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (data.success) {
        alert("Company created successfully");
        setFormData({
          companytitle: "",
          description: "",
          website: "",
          location: "",
          industrysize: "",
          contact: "",
          adminId: formData.adminId,
          managerId: "",
          note: "",
        });
        fetchData();
      } else {
        alert(data.message || "Failed to create company");
      }
    } catch (err) {
      console.error("Error creating company:", err);
      alert("Something went wrong.");
    }
  };

  const handleAssignChange = (companyId, managerId) => {
    if (!managerId) return;
    setPendingAssign({ companyId, managerId });
    setAssignNote("");
    setShowAssignConfirm(true);
  };

  const confirmAssignManager = async () => {
    setShowAssignConfirm(false);
    if (!pendingAssign) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/assign-manager/${pendingAssign.companyId}`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${userInfo.data.accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          managerId: pendingAssign.managerId,
          note: assignNote  
        })
      });

      const data = await res.json();
      if (data.success) {
        alert("Recruiter assigned successfully");
        fetchData();
      } else {
        alert(data.message || "Failed to assign manager");
      }
    } catch (err) {
      console.error("Error assigning manager:", err);
      alert("Something went wrong.");
    }
    setPendingAssign(null);
    setAssignNote("");
  };

  const handleIndustryEditClick = (companyId, currentValue) => {
    setEditingIndustryId(companyId);
    setIndustryEditValue(currentValue || "");
  };

  const handleIndustryChange = (e) => {
    setIndustryEditValue(e.target.value);
  };

  const handleIndustrySave = async (companyId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/update-company-industrysize/${companyId}`, {
        method: "PUT",
        headers: {
          'Authorization': `Bearer ${userInfo.data.accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ industrysize: industryEditValue })
      });

      const data = await res.json();
      if (data.success) {
        alert("Industry size updated successfully");
        setEditingIndustryId(null);
        setIndustryEditValue("");
        fetchData();
      } else {
        alert(data.message || "Failed to update industry size");
      }
    } catch (err) {
      console.error("Error updating industry size:", err);
      alert("Something went wrong.");
    }
  };

  const handleIndustryCancel = () => {
    setEditingIndustryId(null);
    setIndustryEditValue("");
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-800 text-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">Create New Company</h1>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="companytitle" value={formData.companytitle} onChange={handleChange} placeholder="Company Title" required className="w-full p-2 rounded bg-gray-700" />
        <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" required className="w-full p-2 rounded bg-gray-700" />
        <input name="location" value={formData.location} onChange={handleChange} placeholder="Location" required className="w-full p-2 rounded bg-gray-700" />
        <input name="website" value={formData.website} onChange={handleChange} placeholder="Website" required className="w-full p-2 rounded bg-gray-700" />
        <input name="industrysize" value={formData.industrysize} onChange={handleChange} placeholder="Industry Size" required className="w-full p-2 rounded bg-gray-700" />
        <input name="contact" value={formData.contact} onChange={handleChange} placeholder="Contact Number" required className="w-full p-2 rounded bg-gray-700" />

        <input
          name="note"
          value={formData.note}
          onChange={handleChange}
          placeholder="Add a note (optional)"
          className="w-full p-2 rounded bg-gray-700"
        />

        <select name="managerId" value={formData.managerId} onChange={handleChange} required className="w-full p-2 rounded bg-gray-700">
          <option value="">Select Recruiter</option>
          {managers.map(r => (
            <option key={r._id} value={r._id}>{r.email}</option>
          ))}
        </select>

        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded font-semibold">
          Create Company
        </button>
      </form>

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Company Posted by You</h2>

        {company.length === 0 ? (
          <p>No company found.</p>
        ) : (
          <ul className="space-y-4">
           {company.map(company => {
  const unassignedManagers = managers.filter(
    (manager) =>
      !company.assignedTo?.some(
        (assigned) => assigned.managerId?.toString() === manager._id.toString()
      )
  );

  return (
    <li key={company._id} className="p-4 bg-gray-700 rounded text-white">
      <h3 className="text-lg font-bold">{company.name}</h3>
      <p><strong>Description:</strong> {company.description || "N/A"}</p>
      <p><strong>Location:</strong> {company.location || "N/A"}</p>
      <p><strong>Website:</strong> {company.website || "N/A"}</p>
      
      <p>
        <strong>Industry Size:</strong>{" "}
        {editingIndustryId === company._id ? (
          <>
            <input
              type="text"
              value={industryEditValue}
              onChange={handleIndustryChange}
              className="p-1 rounded bg-gray-600 text-white"
            />
            <button
              onClick={() => handleIndustrySave(company._id)}
              className="ml-2 bg-green-600 px-2 py-1 rounded hover:bg-green-700"
            >
              Save
            </button>
            <button
              onClick={handleIndustryCancel}
              className="ml-2 bg-red-600 px-2 py-1 rounded hover:bg-red-700"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            {company.industrysize || "N/A"}{" "}
            <button
              onClick={() => handleIndustryEditClick(company._id, company.industrysize)}
              className="ml-2 bg-blue-600 px-2 py-1 rounded hover:bg-blue-700"
            >
              Edit
            </button>
          </>
        )}
      </p>

      <p><strong>Contact:</strong> {company.contact || "N/A"}</p>

      <p>
        <strong>Assigned To:</strong>{" "}
        {company.assignedTo && company.assignedTo.length > 0
          ? company.assignedTo
              .map(assigned => {
                if (!assigned.managerId) return "Unknown";
                const manager = managers.find(
                  m => m._id.toString() === assigned.managerId.toString()
                );
                return manager
                  ? `${manager.email} <Note: ${assigned.note || "No note"}>`
                  : "Unknown";
              })
              .join(", ")
          : "No managers assigned"}
      </p>

      <div className="mt-3">
        <select
          onChange={e => handleAssignChange(company._id, e.target.value)}
          defaultValue=""
          className="w-full p-2 rounded bg-gray-600 text-white"
        >
          <option value="">Assign Recruiter</option>
          {unassignedManagers.length === 0 ? (
            <option disabled>No recruiters available</option>
          ) : (
            unassignedManagers.map(r => (
              <option key={r._id} value={r._id}>{r.email}</option>
            ))
          )}
        </select>
      </div>
    </li>
  );
})}

          </ul>
        )}
      </div>

      {/* Confirmation modal for creating company */}
      {showCreateConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <div className="bg-gray-900 p-6 rounded max-w-md w-full text-white">
            <h2 className="text-xl mb-4 font-bold">Confirm Company Creation</h2>
            <p>Are you sure you want to create this company?</p>
            <p className="mt-3"><strong>Note:</strong> {formData.note || "No note provided"}</p>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setShowCreateConfirm(false)}
                className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={confirmCreateCompany}
                className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

{showAssignConfirm && pendingAssign && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
    <div className="bg-gray-900 p-6 rounded max-w-md w-full text-white">
      <h2 className="text-xl mb-4 font-bold">Confirm Recruiter Assignment</h2>
      <p>
        Assign recruiter:{" "}
        {managers.find(m => m._id === pendingAssign.managerId)?.email || "Unknown"} to company:{" "}
        {company.find(c => c._id === pendingAssign.companyId)?.name || "Unknown"}
      </p>

      <textarea
        placeholder="Add a note (optional)"
        value={assignNote}
        onChange={(e) => setAssignNote(e.target.value)}
        className="w-full p-2 mt-3 rounded bg-gray-700 text-white resize-none"
        rows={4}
      />

      <div className="mt-6 flex justify-end space-x-4">
        <button
          onClick={() => {
            setShowAssignConfirm(false);
            setPendingAssign(null);
            setAssignNote("");
          }}
          className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          onClick={confirmAssignManager}
          className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
)}


    </div>
  );
};

export default CompanyManagement;
