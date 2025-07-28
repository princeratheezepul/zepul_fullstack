import React, { useState } from 'react';
import { ArrowLeft, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

const AccountManagerCreateJob = ({ onBack }) => {
  const [formData, setFormData] = useState({
    jobtitle: '',
    description: '',
    location: '',
    type: 'onsite',
    employmentType: 'Full-time',
    openpositions: 1,
    salary: { min: '', max: '' },
    skills: [],
    experience: '',
    keyResponsibilities: [],
    preferredQualifications: [],
    priority: ['Medium'],
    company: '',
    hiringDeadline: '',
    internalNotes: ''
  });

  const [showSkillInput, setShowSkillInput] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [showRespInput, setShowRespInput] = useState(false);
  const [newResp, setNewResp] = useState('');
  const [showQualInput, setShowQualInput] = useState(false);
  const [newQual, setNewQual] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const token = userInfo?.data?.accessToken;
  const accountManagerId = userInfo?.data?.user?._id;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSalaryChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      salary: {
        ...prev.salary,
        [field]: value
      }
    }));
  };

  const handlePriorityChange = (priority) => {
    setFormData(prev => ({
      ...prev,
      priority: [priority]
    }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
      setShowSkillInput(false);
    }
  };

  const handleRemoveSkill = (index) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const handleAddKeyResp = () => {
    if (newResp.trim() && !formData.keyResponsibilities.includes(newResp.trim())) {
      setFormData(prev => ({
        ...prev,
        keyResponsibilities: [...prev.keyResponsibilities, newResp.trim()]
      }));
      setNewResp('');
      setShowRespInput(false);
    }
  };

  const handleRemoveKeyResp = (index) => {
    setFormData(prev => ({
      ...prev,
      keyResponsibilities: prev.keyResponsibilities.filter((_, i) => i !== index)
    }));
  };

  const handleAddPrefQual = () => {
    if (newQual.trim() && !formData.preferredQualifications.includes(newQual.trim())) {
      setFormData(prev => ({
        ...prev,
        preferredQualifications: [...prev.preferredQualifications, newQual.trim()]
      }));
      setNewQual('');
      setShowQualInput(false);
    }
  };

  const handleRemovePrefQual = (index) => {
    setFormData(prev => ({
      ...prev,
      preferredQualifications: prev.preferredQualifications.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validate required fields
      if (!formData.jobtitle.trim()) {
        toast.error('Job title is required');
        return;
      }

      if (!formData.description.trim()) {
        toast.error('Job description is required');
        return;
      }

      if (!formData.location.trim()) {
        toast.error('Location is required');
        return;
      }

      // Validate hiring deadline
      if (formData.hiringDeadline) {
        const deadlineDate = new Date(formData.hiringDeadline);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (deadlineDate <= today) {
          toast.error("Hiring deadline must be greater than today's date");
          return;
        }
      }

      const payload = {
        ...formData,
        accountManagerId,
        salary: {
          min: formData.salary.min ? Number(formData.salary.min) : 0,
          max: formData.salary.max ? Number(formData.salary.max) : 0
        },
        experience: formData.experience ? Number(formData.experience) : 0
      };

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/jobs/accountmanager/addjob`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Job created successfully!');
        if (typeof window.refreshAccountManagerJobs === 'function') {
          window.refreshAccountManagerJobs();
        }
        onBack();
      } else {
        toast.error(data.message || 'Failed to create job');
      }
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error('Failed to create job. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Job</h1>
            <p className="text-gray-600 mt-1">Fill in the details below to create a new job posting</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Job Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  value={formData.jobtitle}
                  onChange={(e) => handleInputChange('jobtitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Senior Frontend Developer"
                  required
                />
              </div>

              {/* Company */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Company name"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Bangalore, India"
                  required
                />
              </div>

              {/* Job Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="onsite">On-site</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              {/* Employment Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employment Type
                </label>
                <select
                  value={formData.employmentType}
                  onChange={(e) => handleInputChange('employmentType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              {/* Experience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience (years)
                </label>
                <input
                  type="number"
                  value={formData.experience}
                  onChange={(e) => handleInputChange('experience', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 3"
                  min="0"
                />
              </div>

              {/* Open Positions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Open Positions
                </label>
                <input
                  type="number"
                  value={formData.openpositions}
                  onChange={(e) => handleInputChange('openpositions', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1"
                  min="1"
                />
              </div>

              {/* Salary Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Salary Range (Min)
                </label>
                <input
                  type="number"
                  value={formData.salary.min}
                  onChange={(e) => handleSalaryChange('min', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 50000"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Salary Range (Max)
                </label>
                <input
                  type="number"
                  value={formData.salary.max}
                  onChange={(e) => handleSalaryChange('max', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 80000"
                  min="0"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority[0]}
                  onChange={(e) => handlePriorityChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              {/* Hiring Deadline */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hiring Deadline
                </label>
                <input
                  type="date"
                  value={formData.hiringDeadline}
                  onChange={(e) => handleInputChange('hiringDeadline', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Job Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe the role, responsibilities, and requirements..."
                  required
                />
              </div>

              {/* Required Skills */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Required Skills
                </label>
                <div className="space-y-2">
                  {formData.skills.map((skill, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {skill}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(index)}
                        className="p-1 hover:bg-red-100 rounded"
                      >
                        <X size={16} className="text-red-600" />
                      </button>
                    </div>
                  ))}
                  {showSkillInput ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter skill"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                      />
                      <button
                        type="button"
                        onClick={handleAddSkill}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowSkillInput(false);
                          setNewSkill('');
                        }}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowSkillInput(true)}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <Plus size={16} />
                      Add Skill
                    </button>
                  )}
                </div>
              </div>

              {/* Key Responsibilities */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Key Responsibilities
                </label>
                <div className="space-y-2">
                  {formData.keyResponsibilities.map((resp, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        {resp}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyResp(index)}
                        className="p-1 hover:bg-red-100 rounded"
                      >
                        <X size={16} className="text-red-600" />
                      </button>
                    </div>
                  ))}
                  {showRespInput ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newResp}
                        onChange={(e) => setNewResp(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter responsibility"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddKeyResp()}
                      />
                      <button
                        type="button"
                        onClick={handleAddKeyResp}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowRespInput(false);
                          setNewResp('');
                        }}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowRespInput(true)}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <Plus size={16} />
                      Add Responsibility
                    </button>
                  )}
                </div>
              </div>

              {/* Preferred Qualifications */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Qualifications
                </label>
                <div className="space-y-2">
                  {formData.preferredQualifications.map((qual, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                        {qual}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemovePrefQual(index)}
                        className="p-1 hover:bg-red-100 rounded"
                      >
                        <X size={16} className="text-red-600" />
                      </button>
                    </div>
                  ))}
                  {showQualInput ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newQual}
                        onChange={(e) => setNewQual(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter qualification"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddPrefQual()}
                      />
                      <button
                        type="button"
                        onClick={handleAddPrefQual}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowQualInput(false);
                          setNewQual('');
                        }}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowQualInput(true)}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <Plus size={16} />
                      Add Qualification
                    </button>
                  )}
                </div>
              </div>

              {/* Internal Notes */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Internal Notes
                </label>
                <textarea
                  value={formData.internalNotes}
                  onChange={(e) => handleInputChange('internalNotes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Any internal notes or comments..."
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Creating Job...' : 'Create Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountManagerCreateJob; 