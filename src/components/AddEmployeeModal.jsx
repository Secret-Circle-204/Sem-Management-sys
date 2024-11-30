import React, { useState, useEffect } from 'react';
import { X, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AddEmployeeModal = ({ onClose, onEmployeeAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    gender: '',
    phone: '',
    job_title: '',
    department: '',
    start_time: '',
    end_time: ''
  });

  const [departments, setDepartments] = useState([]);
  const [jobTitles, setJobTitles] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [departmentInput, setDepartmentInput] = useState('');
  const [jobTitleInput, setJobTitleInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchExistingData();
  }, []);

  const fetchExistingData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch('http://localhost:5000/api/employees', {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (response.ok) {
        const employees = await response.json();
        const uniqueDepartments = [...new Set(employees.map(emp => emp.department))].filter(Boolean);
        const uniqueJobTitles = [...new Set(employees.map(emp => emp.job_title))].filter(Boolean);

        setDepartments(uniqueDepartments);
        setJobTitles(uniqueJobTitles);
      } else {
        throw new Error('Failed to fetch employee data');
      }
    } catch (error) {
      console.error('Error fetching existing data:', error);
      toast.error('Failed to load existing data');
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      throw new Error('Name is required');
    }
    if (!formData.email.trim()) {
      throw new Error('Email is required');
    }
    if (!formData.email.includes('@')) {
      throw new Error('Invalid email format');
    }
    if (!formData.password || formData.password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    if (!formData.gender) {
      throw new Error('Please select a gender');
    }
    if (!formData.department.trim()) {
      throw new Error('Department is required');
    }
    if (!formData.job_title.trim()) {
      throw new Error('Job title is required');
    }
    if (!formData.start_time) {
      throw new Error('Start time is required');
    }
    if (!formData.end_time) {
      throw new Error('End time is required');
    }

    // التحقق من صحة الوقت
    const startParts = formData.start_time.split(':');
    const endParts = formData.end_time.split(':');

    const startMinutes = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
    const endMinutes = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);

    if (startMinutes >= endMinutes) {
      throw new Error('Start time must be before end time');
    }

    // التحقق من صحة رقم الهاتف
    if (formData.phone) {
      const phoneRegex = /^[+]?[\d-\s]+$/;
      if (!phoneRegex.test(formData.phone) || formData.phone.length < 10) {
        throw new Error('Invalid phone number format. Must be at least 10 digits');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      validateForm();

      // تنسيق الوقت بشكل صحيح
      const formattedData = {
        ...formData,
        department: departmentInput.trim(),
        job_title: jobTitleInput.trim(),
        start_time: formData.start_time.toString(),
        end_time: formData.end_time.toString()
      };

      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch('http://localhost:5000/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(formattedData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create employee');
      }

      toast.success('Employee added successfully');
      onEmployeeAdded(data);
      onClose();
    } catch (error) {
      console.error('Error creating employee:', error);
      toast.error(error.message || 'Failed to create employee');
    } finally {
      setLoading(false);
    }
  };

  const handleDepartmentChange = (e) => {
    const value = e.target.value;
    setDepartmentInput(value);
    setFormData(prev => ({ ...prev, department: value }));
  };

  const handleJobTitleChange = (e) => {
    const value = e.target.value;
    setJobTitleInput(value);
    setFormData(prev => ({ ...prev, job_title: value }));
  };

  const filteredDepartments = departments.filter(dept =>
    dept.toLowerCase().includes(departmentInput.toLowerCase())
  );

  const filteredJobTitles = jobTitles.filter(title =>
    title.toLowerCase().includes(jobTitleInput.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add New Employee</h2>
          <button
            onClick={onClose}
            type="button"
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 p-[3px] border  border-blue-800 block w-full rounded-md  shadow-sm focus:outline-blue-700 focus:border-indigo-500 focus:ring-indigo-500"
              required
              autoComplete="name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 p-[3px] border  border-blue-800 block w-full rounded-md  shadow-sm focus:outline-blue-700 focus:border-indigo-500 focus:ring-indigo-500"
              required
              autoComplete="email"
            />
          </div>

          <div className="relative border-blue-800">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <div className="relative border-blue-800">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="mt-1 p-[3px] border  border-blue-800 block w-full rounded-md  shadow-sm focus:outline-blue-700 focus:border-indigo-500 focus:ring-indigo-500"
                required
                autoComplete="new-password"
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <Eye className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Gender</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="mt-1 p-[3px] border  border-blue-800 block w-full rounded-md  shadow-sm focus:outline-blue-700 focus:border-indigo-500 focus:ring-indigo-500"
              required
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="mt-1 p-[3px] border  border-blue-800 block w-full rounded-md  shadow-sm focus:outline-blue-700 focus:border-indigo-500 focus:ring-indigo-500"
              autoComplete="tel"
              placeholder="+1234567890"
              title="Phone number (optional). Format: +1234567890"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Department</label>
            <div className="relative border-blue-800">
              <input
                type="text"
                value={departmentInput}
                onChange={handleDepartmentChange}
                className="mt-1 p-[3px] border  border-blue-800 block w-full rounded-md  shadow-sm focus:outline-blue-700 focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Select or type new department"
                list="departments"
                required
                autoComplete="organization-title"
              />
              <datalist id="departments">
                {filteredDepartments.map((dept, index) => (
                  <option key={index} value={dept} />
                ))}
              </datalist>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Job Title</label>
            <div className="relative border-blue-800">
              <input
                type="text"
                value={jobTitleInput}
                onChange={handleJobTitleChange}
                className="mt-1 p-[3px] border  border-blue-800 block w-full rounded-md  shadow-sm focus:outline-blue-700 focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Select or type new job title"
                list="jobTitles"
                required
                autoComplete="organization-title"
              />
              <datalist id="jobTitles">
                {filteredJobTitles.map((title, index) => (
                  <option key={index} value={title} />
                ))}
              </datalist>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Start Time</label>
            <input
              type="time"
              value={formData.start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              className="mt-1 p-[3px] border  border-blue-800 block w-full rounded-md  shadow-sm focus:outline-blue-700 focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">End Time</label>
            <input
              type="time"
              value={formData.end_time}
              onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              className="mt-1 p-[3px] border  border-blue-800 block w-full rounded-md  shadow-sm focus:outline-blue-700 focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployeeModal;
