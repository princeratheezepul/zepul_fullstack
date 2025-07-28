import React, { useState, useEffect } from 'react';
import { FaEdit, FaClock, FaUsers, FaBuilding } from 'react-icons/fa';
import { useApi } from '../../../hooks/useApi';
import { useAuth } from '../../../context/AuthContext';

const AdminCompanyDetails = () => {
  const { get } = useApi();
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [showAssignManager, setShowAssignManager] = useState(false);
  const [assignManagerData, setAssignManagerData] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCompanyDetails, setShowCompanyDetails] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);

  // Fetch companies from DB on mount
  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await get(`${import.meta.env.VITE_BACKEND_URL}/api/company/getcompany`);
        const data = await res.json();
        setCompanies(Array.isArray(data.companies) ? data.companies : []);
      } catch (err) {
        setError('Failed to fetch companies');
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  // Mock data for the job cards
  const jobs = [
    {
      id: 1,
      company: "Code Sphere",
      companyLogo: "CS",
      jobTitle: "Senior Frontend Developer",
      status: "Urgent",
      statusColor: "bg-yellow-100 text-yellow-800",
      department: "Engineering",
      location: "Hyderabad",
      postedDate: "May 15, 2025",
      applicants: 28,
      jobType: ["Remote", "Full time"],
      actionButton: "Assign Manager"
    },
    {
      id: 2,
      company: "Capital Flow",
      companyLogo: "CF",
      jobTitle: "Product Management",
      status: "New",
      statusColor: "bg-blue-100 text-blue-800",
      department: "Management",
      location: "Remote",
      postedDate: "May 18, 2025",
      applicants: 12,
      jobType: ["Remote", "Full time"],
      actionButton: "Assign Manager"
    },
    {
      id: 3,
      company: "Plant Core",
      companyLogo: "PC",
      jobTitle: "Data Scientist",
      status: "Closed",
      statusColor: "bg-gray-100 text-gray-800",
      department: "Analytics",
      location: "Mumbai",
      postedDate: "May 10, 2025",
      applicants: 45,
      jobType: ["On-site", "Full time"],
      actionButton: "Assign Manager"
    },
    {
      id: 4,
      company: "Tech Flow",
      companyLogo: "TF",
      jobTitle: "UX Designer",
      status: "New",
      statusColor: "bg-blue-100 text-blue-800",
      department: "Design",
      location: "Bangalore",
      postedDate: "May 20, 2025",
      applicants: 15,
      jobType: ["Hybrid", "Full time"],
      actionButton: "Assign Manager"
    },
    {
      id: 5,
      company: "Data Hub",
      companyLogo: "DH",
      jobTitle: "Backend Developer",
      status: "Urgent",
      statusColor: "bg-yellow-100 text-yellow-800",
      department: "Engineering",
      location: "Pune",
      postedDate: "May 12, 2025",
      applicants: 32,
      jobType: ["Remote", "Full time"],
      actionButton: "Assign Manager"
    },
    {
      id: 6,
      company: "Cloud Systems",
      companyLogo: "CS",
      jobTitle: "DevOps Engineer",
      status: "New",
      statusColor: "bg-blue-100 text-blue-800",
      department: "Operations",
      location: "Chennai",
      postedDate: "May 22, 2025",
      applicants: 8,
      jobType: ["Remote", "Full time"],
      actionButton: "Assign Manager"
    },
    {
      id: 7,
      company: "AI Solutions",
      companyLogo: "AI",
      jobTitle: "Machine Learning Engineer",
      status: "Urgent",
      statusColor: "bg-yellow-100 text-yellow-800",
      department: "AI/ML",
      location: "Delhi",
      postedDate: "May 14, 2025",
      applicants: 25,
      jobType: ["Hybrid", "Full time"],
      actionButton: "Assign Manager"
    },
    {
      id: 8,
      company: "Digital Marketing",
      companyLogo: "DM",
      jobTitle: "Marketing Manager",
      status: "New",
      statusColor: "bg-blue-100 text-blue-800",
      department: "Marketing",
      location: "Remote",
      postedDate: "May 25, 2025",
      applicants: 18,
      jobType: ["Remote", "Full time"],
      actionButton: "Assign Manager"
    }
  ];

  // Add Company Form Component
  const AddCompanyForm = () => {
    const { post } = useApi();
    const { user } = useAuth();
    const [formData, setFormData] = useState({
      domain: "",
      companyName: "",
      location: "",
      employeeNumber: "",
      aboutSection: "",
      companyType: "",
      directorName: "",
      founderName: "",
      internalNotes: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleInputChange = (field, value) => {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    };

    const handleContinue = async () => {
      setLoading(true);
      setError("");
      try {
        const payload = {
          ...formData,
          userId: user?.id,
          adminId: user?.adminId || user?.id // fallback for admin
        };
        const response = await post(`${import.meta.env.VITE_BACKEND_URL}/api/company/addcompany`, payload);
        const data = await response.json();
        if (!data.success) throw new Error(data.message || "Failed to create company");
        setShowAddCompany(false);
        setAssignManagerData({
          companyName: formData.companyName || "Asian Colors",
          jobTitle: "Senior Frontend Developer",
          recruiters: [
            { id: 1, name: "Mr. P.O Iyer" }
          ],
          companyId: data.company?._id
        });
        setShowAssignManager(true);
      } catch (err) {
        setError(err.message || "Failed to create company");
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="bg-white min-h-screen p-6 w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <div className="text-xs text-gray-500 font-semibold mb-2 tracking-wide">DETAILS</div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Add Company</h1>
          </div>
          <button 
            onClick={handleContinue}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
            disabled={loading}
          >
            {loading ? "Creating..." : "Continue"}
          </button>
        </div>
        {error && <div className="text-red-500 mt-2">{error}</div>}

        {/* Form */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Domain */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Domain</label>
                <input
                  type="text"
                  value={formData.domain}
                  onChange={(e) => handleInputChange('domain', e.target.value)}
                  placeholder="Enter company domain"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="Enter company name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Enter company location"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Employee Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Employee Number</label>
                <input
                  type="text"
                  value={formData.employeeNumber}
                  onChange={(e) => handleInputChange('employeeNumber', e.target.value)}
                  placeholder="Enter employee number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* About Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">About Section</label>
                <textarea
                  value={formData.aboutSection}
                  onChange={(e) => handleInputChange('aboutSection', e.target.value)}
                  rows={4}
                  placeholder="Enter company description..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Company Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Type</label>
                <input
                  type="text"
                  value={formData.companyType}
                  onChange={(e) => handleInputChange('companyType', e.target.value)}
                  placeholder="Enter company type"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Director Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Director Name</label>
                <input
                  type="text"
                  value={formData.directorName}
                  onChange={(e) => handleInputChange('directorName', e.target.value)}
                  placeholder="Enter director name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Founder Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Founder Name</label>
                <input
                  type="text"
                  value={formData.founderName}
                  onChange={(e) => handleInputChange('founderName', e.target.value)}
                  placeholder="Enter founder name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Internal Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Internal Notes</label>
                <input
                  type="text"
                  value={formData.internalNotes}
                  onChange={(e) => handleInputChange('internalNotes', e.target.value)}
                  placeholder="Enter internal notes"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- New Assign Manager Modal ---
  const AssignManager = ({ companyId, companyName }) => {
    const { get, post } = useApi();
    const { user } = useAuth();
    const [assignedManagers, setAssignedManagers] = useState([]); // { _id, fullname, email, note }
    const [allManagers, setAllManagers] = useState([]); // All managers for search
    const [search, setSearch] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedManager, setSelectedManager] = useState(null);
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [assigning, setAssigning] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [noteInput, setNoteInput] = useState('');
    const [showRemoveDialog, setShowRemoveDialog] = useState(false);
    const [managerToRemove, setManagerToRemove] = useState(null);

    // Debug: Log assignedManagers whenever it changes
    useEffect(() => {
      console.log('Assigned managers state updated:', assignedManagers);
    }, [assignedManagers]);

    // Fetch assigned managers on mount
    useEffect(() => {
      const fetchAssigned = async () => {
        setLoading(true);
        setError('');
        try {
          // Fetch company details
          const res = await get(`${import.meta.env.VITE_BACKEND_URL}/api/company/getcompany`);
          const data = await res.json();
          const company = Array.isArray(data.companies) ? data.companies.find(c => c._id === companyId) : null;
          if (company && Array.isArray(company.assignedManagers)) {
            setAssignedManagers(company.assignedManagers);
          } else {
            setAssignedManagers([]);
          }
        } catch (err) {
          setError('Failed to fetch assigned managers');
        } finally {
          setLoading(false);
        }
      };
      fetchAssigned();
    }, [companyId]);

    // Fetch all managers for search
    const fetchAllManagers = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/users?limit=1000`);
        const data = await res.json();
        const managers = (data?.data?.users || []).filter(u => u.type === 'manager');
        setAllManagers(managers);
      } catch (err) {
        setError('Failed to fetch managers');
      } finally {
        setLoading(false);
      }
    };

    // Add manager to assigned list
    const handleAddManager = (manager) => {
      if (!assignedManagers.some(m => m._id === manager._id)) {
        setAssignedManagers([...assignedManagers, { ...manager, note: '' }]);
      }
      setShowAddModal(false);
      setSearch('');
    };

    // Remove manager from assigned list
    const handleRemoveManager = async (id) => {
      console.log('Removing manager with ID:', id);
      console.log('Assigned managers before removal:', assignedManagers);
      
      try {
        // Make API call to remove manager from company's assignedManagers field
        const res = await post(`${import.meta.env.VITE_BACKEND_URL}/api/admin/remove-manager/${companyId}`, {
          managerId: id
        });
        const data = await res.json();
        
        if (!data.success) {
          throw new Error(data.message || 'Failed to remove manager');
        }
        
        // Update local state after successful API call
        const updatedManagers = assignedManagers.filter(m => m._id !== id);
        console.log('Assigned managers after removal:', updatedManagers);
        setAssignedManagers(updatedManagers);
        
        setSuccess('Manager removed successfully!');
      } catch (err) {
        console.error('Error removing manager:', err);
        setError(err.message || 'Failed to remove manager');
      }
    };

    // Set note for a manager
    const handleSetNote = (id, note) => {
      setAssignedManagers(assignedManagers.map(m => m._id === id ? { ...m, note } : m));
    };

    // When a manager is selected, set the note input to their current note
    useEffect(() => {
      if (selectedManager) {
        setNoteInput(selectedManager.note || '');
      }
    }, [selectedManager]);

    // Assign managers to company
    const handleContinue = async () => {
      setAssigning(true);
      setError('');
      setSuccess('');
      try {
        if (assignedManagers.length === 0) {
          // No managers selected, just go back
          setShowAssignManager(false);
          setAssignManagerData(null);
          return;
        }
        const payload = {
          managers: assignedManagers.map(m => ({ managerId: m._id, note: m.note }))
        };
        const res = await post(`${import.meta.env.VITE_BACKEND_URL}/api/admin/assign-manager/${companyId}`, payload);
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'Failed to assign managers');
        setSuccess('Managers assigned and notified successfully!');
      } catch (err) {
        setError(err.message || 'Failed to assign managers');
      } finally {
        setAssigning(false);
      }
    };

    // Save note for a manager
    const handleSaveNote = () => {
      if (selectedManager) {
        handleSetNote(selectedManager._id, noteInput);
        setSelectedManager(null);
      }
    };

    // Filter managers for search, exclude already assigned
    const filteredManagers = allManagers.filter(m =>
      (m.fullname.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())) &&
      !assignedManagers.some(am => am._id === m._id)
    );

    // On success, go back to Company Data
    useEffect(() => {
      if (success) {
        setTimeout(() => {
          setShowAssignManager(false);
          setAssignManagerData(null);
        }, 1200); // Give user a moment to see the success message
      }
    }, [success]);

    return (
      <div className="bg-white min-h-screen p-6 w-full">
          <h1 className="text-2xl font-bold mb-6">Assign Manager</h1>
        {loading && <div>Loading...</div>}
        {error && <div className="text-red-500 mb-2">{error}</div>}
        {success && <div className="text-green-600 mb-2">{success}</div>}
        <div className="mb-4 text-gray-700 font-medium">Assigned Managers</div>
          <div className="flex flex-col gap-4 mb-8">
          {assignedManagers.map((m, idx) => (
            <div key={m._id} className="flex items-center gap-2">
              <span className="text-lg font-medium">{idx + 1}. {m.fullname}</span>
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all duration-200 cursor-pointer"
                onClick={() => setSelectedManager(m)}
              >
                💬
              </button>
              <button
                className="ml-2 text-red-500 hover:text-red-700 font-medium px-3 py-1 rounded border border-red-300 hover:bg-red-50 transition-all duration-200 cursor-pointer"
                onClick={() => {
                  setManagerToRemove(m);
                  setShowRemoveDialog(true);
                }}
              >
                Remove
                </button>
              </div>
            ))}
          </div>
        <button
          className="border border-blue-500 text-black px-6 py-2 rounded-lg hover:bg-blue-50 transition-all duration-200 mb-6 cursor-pointer"
          onClick={() => { setShowAddModal(true); fetchAllManagers(); }}
        >
            Add Manager
          </button>
          <div>
            <button
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
            onClick={handleContinue}
            disabled={assigning}
          >
            {assigning ? 'Assigning...' : 'Continue'}
          </button>
        </div>
        {/* Add Manager Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-transparent z-40 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md border border-blue-300">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Add Manager</h2>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-700 text-2xl cursor-pointer">&times;</button>
              </div>
              <input
                type="text"
                placeholder="Search by name or email"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full mb-4 px-3 py-2 border rounded-lg"
              />
              <div className="max-h-60 overflow-y-auto">
                {filteredManagers.map(m => (
                  <div key={m._id} className="flex items-center justify-between py-2 border-b">
                    <span>{m.fullname} ({m.email})</span>
                    <button
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:opacity-50"
                      onClick={() => handleAddManager(m)}
                      disabled={assignedManagers.some(am => am._id === m._id)}
                    >
                      Add
                    </button>
                  </div>
                ))}
                {filteredManagers.length === 0 && <div className="text-gray-500">No managers found.</div>}
              </div>
            </div>
          </div>
        )}
        {/* Note Sidebar */}
        {selectedManager && (
          <div className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white z-50 shadow-2xl flex flex-col transition-all duration-300">
            <div className="flex items-center justify-between px-6 pt-6 pb-2 border-b">
              <h2 className="text-lg font-semibold">Add Note for {selectedManager.fullname}</h2>
              <button onClick={() => setSelectedManager(null)} className="text-gray-400 hover:text-gray-700 text-2xl cursor-pointer">&times;</button>
            </div>
            <div className="flex-1 px-6 py-4">
              <textarea
                className="w-full h-40 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Write your note (optional)"
                value={noteInput}
                onChange={e => setNoteInput(e.target.value)}
              />
            </div>
            <div className="px-6 pb-6">
              <button
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 cursor-pointer"
                onClick={handleSaveNote}
              >
                Save Note
              </button>
            </div>
          </div>
        )}
        {/* Remove Manager Confirmation Dialog */}
        {showRemoveDialog && managerToRemove && (
          <div className="fixed inset-0 bg-transparent z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Confirm Removal</h3>
              <p className="text-gray-800 mb-4">
                Are you sure you want to remove {managerToRemove.fullname} from assigned managers?
              </p>
              <div className="flex justify-end gap-2">
                <button
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition-all duration-200"
                  onClick={() => setShowRemoveDialog(false)}
                >
                  Cancel
                </button>
                <button
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all duration-200"
                  onClick={() => {
                    handleRemoveManager(managerToRemove._id);
                    setShowRemoveDialog(false);
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Company Details Full Page Component
  const CompanyDetailsView = ({ company }) => {
    const { get } = useApi();
    const [companyData, setCompanyData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetch company details from database
    useEffect(() => {
      const fetchCompanyDetails = async () => {
        setLoading(true);
        setError('');
        try {
          const res = await get(`${import.meta.env.VITE_BACKEND_URL}/api/company/getcompany`);
          const data = await res.json();
          const companies = Array.isArray(data.companies) ? data.companies : [];
          const foundCompany = companies.find(c => c._id === company._id);
          setCompanyData(foundCompany || company);
        } catch (err) {
          setError('Failed to fetch company details');
          setCompanyData(company); // Fallback to passed company data
        } finally {
          setLoading(false);
        }
      };
      fetchCompanyDetails();
    }, [company._id]);

    // Generate background color based on company name
    const getCompanyLogoColor = (name) => {
      const colors = [
        'bg-blue-500',
        'bg-green-500',
        'bg-purple-500',
        'bg-red-500',
        'bg-indigo-500',
        'bg-pink-500',
        'bg-teal-500',
        'bg-orange-500'
      ];
      const index = name ? name.charCodeAt(0) % colors.length : 0;
      return colors[index];
    };

    if (loading) {
      return (
        <div className="bg-white min-h-screen p-6 w-full flex items-center justify-center">
          <div className="text-gray-500">Loading company details...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-white min-h-screen p-6 w-full flex items-center justify-center">
          <div className="text-red-500">{error}</div>
        </div>
      );
    }

    return (
      <div className="bg-white min-h-screen p-6 w-full">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button 
            onClick={() => setShowCompanyDetails(false)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-semibold text-gray-900">COMPANY DETAILS</h1>
        </div>

        {/* Company Overview Section */}
        <div className="flex items-start gap-6 mb-8">
          {/* Company Logo */}
          <div className="flex-shrink-0">
            <div className={`w-24 h-24 rounded-xl flex items-center justify-center shadow-lg ${getCompanyLogoColor(companyData?.name)}`}>
              <div className="text-center">
                <div className="text-white font-bold text-lg">
                  {companyData?.name ? companyData.name.charAt(0).toUpperCase() : 'C'}
                </div>
              </div>
            </div>
          </div>

          {/* Company Info */}
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{companyData?.name || 'Company Name'}</h2>
            
            {/* Company Tags */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">
                  Employee: {companyData?.employeeNumber || 'Not specified'}
                </span>
              </div>
              
              <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">
                  Company Type: {companyData?.companyType || 'Not specified'}
                </span>
              </div>
              
              <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
                <span className="text-sm font-medium text-gray-700">
                  Domain: {companyData?.location || 'Not specified'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">About</h3>
          <div className="text-gray-700 leading-relaxed">
            {companyData?.aboutSection ? (
              <p className="mb-4">{companyData.aboutSection}</p>
            ) : (
              <p className="mb-4 text-gray-500 italic">No about section available for this company.</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Show Add Company form if state is true
  if (showAddCompany) {
    return <AddCompanyForm />;
  }

  // Show Assign Manager if state is true
  if (showAssignManager && assignManagerData) {
    return <AssignManager companyId={assignManagerData.companyId} companyName={assignManagerData.companyName} />;
  }

  // Show Company Details Modal if state is true
  if (showCompanyDetails && selectedCompany) {
    return <CompanyDetailsView company={selectedCompany} />;
  }

  return (
    <div className="bg-white min-h-screen p-6 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <div className="text-xs text-blue-600 font-semibold mb-2 tracking-wide">VIEW DETAILS</div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Company Data</h1>
          </div>
        </div>
        <button 
          onClick={() => setShowAddCompany(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
        >
          Add Company
        </button>
      </div>

      {/* Company Cards Grid */}
      {loading ? (
        <div className="text-center py-12">Loading companies...</div>
      ) : error ? (
        <div className="text-center text-red-500 py-12">{error}</div>
      ) : companies.length === 0 ? (
        <div className="text-center text-gray-500 py-12">No companies found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {companies.map((company) => (
            <div key={company._id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-200 p-6 relative group">
              {/* Edit Icon */}
              <button 
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => {
                  setSelectedCompany(company);
                  setShowCompanyDetails(true);
                }}
              >
                <FaEdit size={16} />
              </button>

              {/* Company Info */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-gray-100 overflow-hidden">
                  {company.logo ? (
                    <img src={company.logo} alt={company.name} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <span className="text-lg font-bold text-blue-600">{company.name?.charAt(0)?.toUpperCase() || 'C'}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{company.name}</h3>
                </div>
              </div>

              {/* Domain and Location */}
              <div className="mb-5">
                <p className="text-sm text-gray-500 font-medium">{company.domain ? company.domain : ''}{company.domain && company.location ? ' • ' : ''}{company.location ? company.location : ''}</p>
              </div>

              {/* Posted Date */}
              <div className="flex items-center gap-2 mb-5 text-sm text-gray-500">
                <FaClock size={14} className="text-gray-400" />
                <span>Posted {company.createdAt ? new Date(company.createdAt).toLocaleDateString() : 'N/A'}</span>
              </div>

              {/* Action Button */}
              <button
                className="w-full bg-white border-2 border-blue-500 text-blue-600 py-3 rounded-xl font-semibold hover:bg-blue-50 hover:border-blue-600 transition-all duration-200 cursor-pointer text-sm"
                onClick={() => {
                  setAssignManagerData({ companyId: company._id, companyName: company.name });
                  setShowAssignManager(true);
                }}
              >
                Assign Manager
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCompanyDetails; 