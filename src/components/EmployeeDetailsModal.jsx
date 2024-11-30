import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const EmployeeDetailsModal = ({ employee, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    gender: '',
    phone: '',
    job_title: '',
    department: '',
    start_time: '',
    end_time: ''
  });

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || '',
        email: employee.email || '',
        gender: employee.gender || '',
        phone: employee.phone || '',
        job_title: employee.job_title || '',
        department: employee.department || '',
        start_time: employee.start_time || '',
        end_time: employee.end_time || ''
      });
    }
  }, [employee]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`http://localhost:5000/api/employees/${employee.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to update employee');
      }

      const updatedEmployee = await response.json();
      onUpdate(updatedEmployee);
      onClose();
    } catch (error) {
      console.error('Error updating employee:', error);
      alert('Error updating employee');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Employee Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
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
              className="mt-1 p-[6px] border  border-blue-800 block w-full rounded-md  shadow-sm focus:outline-blue-700 focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 p-[6px] border  border-blue-800 block w-full rounded-md  shadow-sm focus:outline-blue-700 focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Gender</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="mt-1 p-[6px] border  border-blue-800 block w-full rounded-md  shadow-sm focus:outline-blue-700 focus:border-indigo-500 focus:ring-indigo-500"
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
              className="mt-1 p-[6px] border  border-blue-800 block w-full rounded-md  shadow-sm focus:outline-blue-700 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Job Title</label>
            <input
              type="text"
              value={formData.job_title}
              onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
              className="mt-1 p-[6px] border  border-blue-800 block w-full rounded-md  shadow-sm focus:outline-blue-700 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Department</label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="mt-1 p-[6px] border  border-blue-800 block w-full rounded-md  shadow-sm focus:outline-blue-700 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Start Time</label>
            <input
              type="time"
              value={formData.start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              className="mt-1 p-[6px] border  border-blue-800 block w-full rounded-md  shadow-sm focus:outline-blue-700 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">End Time</label>
            <input
              type="time"
              value={formData.end_time}
              onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              className="mt-1 p-[6px] border  border-blue-800 block w-full rounded-md  shadow-sm focus:outline-blue-700 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeDetailsModal;
