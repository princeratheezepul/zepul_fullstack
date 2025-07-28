import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const PAGE_SIZE = 5;

export default function AssignRecruitersSidebar({
  open,
  onClose,
  jobId,
  initialAssigned = [],
  managerId,
  token,
  onSaveSuccess
}) {
  const [assigned, setAssigned] = useState(initialAssigned);
  const [page, setPage] = useState(1);
  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [allRecruiters, setAllRecruiters] = useState([]);

  // Fetch all recruiters when component opens
  useEffect(() => {
    if (!open || !managerId || !token) {
      console.log('Missing required props:', { open, managerId: !!managerId, token: !!token });
      return;
    }
    
    const fetchRecruiters = async () => {
      try {
        setSearchLoading(true);
        console.log('Fetching recruiters with:', { managerId, token: token.substring(0, 20) + '...' });
        
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/recruiter/getrecruiter?creatorId=${managerId}&type=manager`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('API Error:', errorData);
          throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch recruiters`);
        }
        
        const data = await response.json();
        console.log('API Response:', data);
        
        const activeRecruiters = (data.recruiters || []).filter(r =>
          ((r.isActive === true) || (r.status && r.status.toLowerCase() === 'active')) &&
          !assigned.some(a => a._id === r._id)
        );
        
        console.log('Filtered active recruiters:', activeRecruiters.length);
        setAllRecruiters(activeRecruiters);
      } catch (error) {
        console.error('Error fetching recruiters:', error);
        toast.error(`Failed to load recruiters: ${error.message}`);
        setAllRecruiters([]);
      } finally {
        setSearchLoading(false);
      }
    };

    fetchRecruiters();
  }, [open, managerId, token, assigned]);

  // Filter recruiters based on search
  useEffect(() => {
    if (!search.trim()) {
      setSearchResults(allRecruiters);
      return;
    }

    const lowerSearch = search.toLowerCase();
    const filtered = allRecruiters.filter(r =>
      (r.fullname?.toLowerCase().includes(lowerSearch) || 
       r.email?.toLowerCase().includes(lowerSearch))
    );
    setSearchResults(filtered);
  }, [search, allRecruiters]);

  // Pagination
  const totalPages = Math.ceil(assigned.length / PAGE_SIZE);
  const paginated = assigned.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Remove recruiter
  const handleRemove = (id) => {
    const removedRecruiter = assigned.find(r => r._id === id);
    setAssigned(assigned.filter(r => r._id !== id));
    // Add the removed recruiter back to available recruiters
    if (removedRecruiter) {
      setAllRecruiters(prev => [...prev, removedRecruiter]);
    }
    if ((page - 1) * PAGE_SIZE >= assigned.length - 1 && page > 1) setPage(page - 1);
  };

  // Add recruiter
  const handleAdd = (rec) => {
    setAssigned([...assigned, rec]);
    setShowSearch(false);
    setSearch('');
    // Remove the added recruiter from allRecruiters to prevent duplicate selection
    setAllRecruiters(prev => prev.filter(r => r._id !== rec._id));
  };

  // Save changes
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/manager/job/${jobId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assignedRecruiters: assigned.map(r => r._id) })
      });
      if (!res.ok) throw new Error('Failed to save changes');
      toast.success('Assigned recruiters updated');
      if (onSaveSuccess) onSaveSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  // Handle showing search
  const handleShowSearch = () => {
    setShowSearch(true);
    setSearch('');
    setSearchResults(allRecruiters); // Show all available recruiters initially
  };

  return (
    <div className={`fixed inset-0 z-50 ${open ? '' : 'hidden'}`} style={{ background: 'rgba(0,0,0,0.15)' }}>
      <aside className="fixed top-0 right-0 h-full w-[50vw] max-w-[700px] bg-white shadow-2xl z-50 flex flex-col" style={{ borderTopLeftRadius: '2rem', borderBottomLeftRadius: '2rem' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-2 border-b border-gray-100">
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none cursor-pointer">&larr;</button>
          <h2 className="text-xl font-bold text-gray-900 flex-1 text-center">Assigned Recruiter</h2>
          <div className="w-8" /> {/* Spacer for symmetry */}
        </div>
        {/* List */}
        <div className="flex-1 px-8 py-6 overflow-y-auto">
          {paginated.length === 0 ? (
            <div className="text-gray-500 text-center py-12">No recruiters assigned.</div>
          ) : (
            <ul className="space-y-4">
              {paginated.map(r => (
                <li key={r._id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                  <div>
                    <div className="font-semibold text-gray-900">{r.fullname}</div>
                    <div className="text-xs text-gray-500">{r.email}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${(r.isActive === true || (r.status && r.status.toLowerCase() === 'active')) ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>{(r.isActive === true || (r.status && r.status.toLowerCase() === 'active')) ? 'Active' : 'Inactive'}</span>
                    <button onClick={() => handleRemove(r._id)} className="text-gray-400 hover:text-red-500 text-lg font-bold cursor-pointer">&times;</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-6 gap-2">
              <button onClick={() => setPage(page - 1)} disabled={page === 1} className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">Previous</button>
              <span className="px-3 py-2 text-sm text-gray-700">Page {page} of {totalPages}</span>
              <button onClick={() => setPage(page + 1)} disabled={page === totalPages} className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">Next</button>
            </div>
          )}
        </div>
        {/* Add Recruiter & Save */}
        <div className="px-8 pb-8 flex flex-col gap-4">
          {showSearch ? (
            <div className="relative">
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search recruiter by name or email..."
                value={search}
                onChange={handleSearchChange}
                autoFocus
              />
              {searchLoading && <div className="absolute right-4 top-3 text-xs text-gray-400">Loading...</div>}
              {searchResults.length > 0 && (
                <ul className="absolute left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto bottom-full mb-2">
                  {searchResults.map(r => (
                    <li key={r._id} className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex justify-between items-center" onClick={() => handleAdd(r)}>
                      <span>
                        <span className="font-medium text-gray-900">{r.fullname}</span>
                        <span className="ml-2 text-xs text-gray-500">{r.email}</span>
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">Active</span>
                    </li>
                  ))}
                </ul>
              )}
              {!searchLoading && searchResults.length === 0 && search.trim() && (
                <div className="absolute left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 px-4 py-2 text-gray-500 text-sm bottom-full mb-2">No recruiters found matching "{search}".</div>
              )}
              {!searchLoading && searchResults.length === 0 && !search.trim() && (
                <div className="absolute left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 px-4 py-2 text-gray-500 text-sm bottom-full mb-2">No recruiters available to assign.</div>
              )}
            </div>
          ) : (
            <button onClick={handleShowSearch} className="w-full border border-blue-500 text-blue-700 font-semibold rounded-lg py-2 hover:bg-blue-50 transition-colors cursor-pointer">Add Recruiter</button>
          )}
          <button onClick={handleSave} disabled={saving} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 font-semibold shadow-none cursor-pointer disabled:opacity-50 mt-2">{saving ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </aside>
    </div>
  );
} 