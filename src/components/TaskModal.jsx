import React, { useState, useEffect } from 'react';
import { X, Edit2, Trash2, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';

const TaskModal = ({ 
  mode = 'view',
  task, 
  employees, 
  onClose, 
  onAdd, 
  onUpdate,
  onDelete,
  selectedDate,
  isEditing,
  setIsEditing,
  onSubmit,
  fetchEmployees
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    employee_id: '',
    start_time: '',
    end_time: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (mode === 'add' && selectedDate) {
      const startDateTime = new Date(selectedDate);
      const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // +1 hour
      
      setFormData({
        title: '',
        description: '',
        location: '',
        employee_id: '',
        start_time: startDateTime.toISOString().substring(0, 16),
        end_time: endDateTime.toISOString().substring(0, 16)
      });
    } else if (task) {
      setFormData({
        title: task.title?.split(' - ')[1] || task.title || '',
        description: task.description || '',
        location: task.location || '',
        employee_id: task.employee_id || '',
        start_time: task.start_time ? new Date(task.start_time).toISOString().substring(0, 16) : '',
        end_time: task.due_date ? new Date(task.due_date).toISOString().substring(0, 16) : ''
      });
    } else {
      // Default values for new task
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
      
      setFormData({
        title: '',
        description: '',
        location: '',
        employee_id: '',
        start_time: now.toISOString().substring(0, 16),
        end_time: oneHourLater.toISOString().substring(0, 16)
      });
    }
    if (fetchEmployees) {
      fetchEmployees();
    }
    setLoading(false);
  }, [task, mode, selectedDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted with mode:', mode);
    console.log('Form data:', formData);
    
    if (!formData.employee_id) {
      toast.error('Please select an employee');
      return;
    }

    try {
      if (mode === 'add') {
        console.log('Attempting to add new task...');
        await onAdd(formData);
        console.log('Task added successfully');
        toast.success('Task added successfully');
        onClose();
      } else if (mode === 'view' && isEditing && task) {
        console.log('Attempting to update task...');
        await onUpdate(task.id, formData);
        console.log('Task updated successfully');
        toast.success('Task updated successfully');
        onClose();
      }
    } catch (error) {
      console.error('Error submitting task:', error);
      toast.error(error.message || 'Failed to submit task');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      onDelete(task.id);
    }
  };

  return (
    <div className="fixed z-50 inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            {mode === 'add' ? 'Add New Task' : (isEditing ? 'Edit Task' : 'View Task')}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Employee</label>
              <select
                name="employee_id"
                value={formData.employee_id}
                onChange={handleInputChange}
                disabled={!isEditing && mode !== 'add'}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="">Select Employee</option>
                {employees && employees.map(employee => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                disabled={!isEditing && mode !== 'add'}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                disabled={!isEditing && mode !== 'add'}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows="3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                disabled={!isEditing && mode !== 'add'}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Time</label>
                <input
                  type="datetime-local"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleInputChange}
                  disabled={!isEditing && mode !== 'add'}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">End Time</label>
                <input
                  type="datetime-local"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleInputChange}
                  disabled={!isEditing && mode !== 'add'}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            {mode === 'view' && !isEditing && task && (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Edit2 size={16} className="mr-2" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete
                </button>
              </>
            )}
            
            {mode === 'add' && (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Save size={16} className="mr-2" />
                  Add Task
                </button>
              </>
            )}
            {mode === 'view' && isEditing && task && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    if (task) {
                      const startDateTime = new Date(task.start);
                      const endDateTime = new Date(task.end);
                      setFormData({
                        title: task.title.split(' - ')[1] || task.title,
                        description: task.extendedProps?.description || '',
                        location: task.extendedProps?.location || '',
                        employee_id: task.extendedProps?.employee_id || '',
                        start_time: startDateTime.toISOString().slice(0, 16),
                        end_time: endDateTime.toISOString().slice(0, 16)
                      });
                    }
                  }}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Save size={16} className="mr-2" />
                  Save Changes
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;