import React, { useState } from 'react';
import { ArrowLeft, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminCreateJob = ({ onBack }) => {
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
  const adminId = userInfo?.data?.user?._id;

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

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleAddResponsibility = () => {
    if (newResp.trim() && !formData.keyResponsibilities.includes(newResp.trim())) {
      setFormData(prev => ({
        ...prev,
        keyResponsibilities: [...prev.keyResponsibilities, newResp.trim()]
      }));
      setNewResp('');
      setShowRespInput(false);
    }
  };

  const handleRemoveResponsibility = (respToRemove) => {
    setFormData(prev => ({
      ...prev,
      keyResponsibilities: prev.keyResponsibilities.filter(resp => resp !== respToRemove)
    }));
  };

  const handleAddQualification = () => {
    if (newQual.trim() && !formData.preferredQualifications.includes(newQual.trim())) {
      setFormData(prev => ({
        ...prev,
        preferredQualifications: [...prev.preferredQualifications, newQual.trim()]
      }));
      setNewQual('');
      setShowQualInput(false);
    }
  };

  const handleRemoveQualification = (qualToRemove) => {
    setFormData(prev => ({
      ...prev,
      preferredQualifications: prev.preferredQualifications.filter(qual => qual !== qualToRemove)
    }));
  };

  const validateForm = () => {
    if (!formData.jobtitle.trim()) {
      toast.error('Job title is required');
      return false;
    }
    if (!formData.description.trim()) {
      toast.error('Job description is required');
      return false;
    }
    if (!formData.location.trim()) {
      toast.error('Location is required');
      return false;
    }
    if (!formData.experience) {
      toast.error('Experience is required');
      return false;
    }
    if (!formData.salary.min || !formData.salary.max) {
      toast.error('Salary range is required');
      return false;
    }
    if (parseInt(formData.salary.min) > parseInt(formData.salary.max)) {
      toast.error('Minimum salary cannot be greater than maximum salary');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/create-job`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          adminId,
          hiringDeadline: formData.hiringDeadline ? new Date(formData.hiringDeadline).toISOString() : null
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Job created successfully!');
        onBack();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create job');
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
            <ArrowLeft size={20} className="text-gray-500" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Job</h1>
            <p className="text-gray-600">Fill in the details to create a new job posting</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Senior Software Engineer"
                required
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., New York, NY"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            {/* Open Positions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Open Positions
              </label>
              <input
                type="number"
                value={formData.openpositions}
                onChange={(e) => handleInputChange('openpositions', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>

            {/* Experience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience (years) *
              </label>
              <input
                type="number"
                value={formData.experience}
                onChange={(e) => handleInputChange('experience', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                required
              />
            </div>

            {/* Salary Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Salary *
              </label>
              <input
                type="number"
                value={formData.salary.min}
                onChange={(e) => handleSalaryChange('min', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="50000"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Salary *
              </label>
              <input
                type="number"
                value={formData.salary.max}
                onChange={(e) => handleSalaryChange('max', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="80000"
                required
              />
            </div>

            {/* Company */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Company name"
              />
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            {/* Skills */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Required Skills
              </label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
                {showSkillInput ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                      placeholder="Enter skill"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSkillInput(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowSkillInput(true)}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <Plus size={16} />
                    Add Skill
                  </button>
                )}
              </div>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe the role, responsibilities, and requirements..."
                required
              />
            </div>

            {/* Key Responsibilities */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Key Responsibilities
              </label>
              <div className="space-y-2">
                <ul className="list-disc list-inside space-y-1">
                  {formData.keyResponsibilities.map((resp, index) => (
                    <li key={index} className="flex items-center justify-between">
                      <span>{resp}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveResponsibility(resp)}
                        className="text-red-600 hover:text-red-800 ml-2"
                      >
                        <X size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
                {showRespInput ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newResp}
                      onChange={(e) => setNewResp(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddResponsibility())}
                      placeholder="Enter responsibility"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddResponsibility}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowRespInput(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowRespInput(true)}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
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
                <ul className="list-disc list-inside space-y-1">
                  {formData.preferredQualifications.map((qual, index) => (
                    <li key={index} className="flex items-center justify-between">
                      <span>{qual}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveQualification(qual)}
                        className="text-red-600 hover:text-red-800 ml-2"
                      >
                        <X size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
                {showQualInput ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newQual}
                      onChange={(e) => setNewQual(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddQualification())}
                      placeholder="Enter qualification"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddQualification}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowQualInput(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowQualInput(true)}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add any internal notes or comments..."
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminCreateJob; 