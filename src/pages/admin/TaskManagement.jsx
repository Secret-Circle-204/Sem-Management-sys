import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, CheckCircle, AlertCircle, Clock, HelpCircle } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import TaskModal from '../../components/TaskModal';

const TaskManagement = () => {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const calculateTimeRemaining = (startTime, endTime) => {
    const now = currentTime;
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (now < start) {
      const diff = start - now;
      return {
        type: 'starts_in',
        time: formatDuration(diff)
      };
    } else if (now > end) {
      return {
        type: 'ended',
        time: formatDate(end)
      };
    } else {
      const diff = end - now;
      return {
        type: 'ends_in',
        time: formatDuration(diff)
      };
    }
  };

  const formatDuration = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const updateTaskStatus = useCallback((task) => {
    const now = currentTime;
    const startTime = new Date(task.start_time);
    const endTime = new Date(task.due_date);
    
    if (task.status === 'completed') {
      return 'completed';
    }
    if (now < startTime) {
      return 'upcoming';
    }
    if (now > endTime) {
      return 'overdue';
    }
    return 'ongoing';
  }, [currentTime]);

  useEffect(() => {
    fetchEmployees();
    fetchTasks();
    const interval = setInterval(() => {
      fetchTasks();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const fetchEmployees = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/employees`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/schedule`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      const updatedTasks = response.data.map(task => ({
        ...task,
        status: updateTaskStatus(task)
      }));
      setTasks(updatedTasks);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setLoading(false);
    }
  };

  const handleTaskAdd = async (taskData) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/schedule`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create task');
      }

      await fetchTasks();
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleUpdateTask = async (taskId, taskData) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/schedule/${taskId}`, taskData, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      await fetchTasks();
      setShowAddModal(false);
      setSelectedTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/schedule/${taskId}`, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        await fetchTasks();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getTaskStatus = (task) => {
    const status = updateTaskStatus(task);
    switch (status) {
      case 'completed':
        return {
          text: 'Completed',
          class: 'bg-green-100 text-green-800',
          icon: <CheckCircle className="w-5 h-5 text-green-500" />
        };
      case 'overdue':
        return {
          text: 'Overdue',
          class: 'bg-red-100 text-red-800',
          icon: <AlertCircle className="w-5 h-5 text-red-500" />
        };
      case 'ongoing':
        return {
          text: 'In Progress',
          class: 'bg-blue-100 text-blue-800',
          icon: <Clock className="w-5 h-5 text-blue-500" />
        };
      case 'upcoming':
        return {
          text: 'Upcoming',
          class: 'bg-yellow-100 text-yellow-800',
          icon: <Clock className="w-5 h-5 text-yellow-500" />
        };
      default:
        return {
          text: 'Unknown',
          class: 'bg-gray-100 text-gray-800',
          icon: <HelpCircle className="w-5 h-5 text-gray-500" />
        };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Task Manager</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage tasks and assignments for all employees
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Task
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : tasks.length === 0 ? (
        <div className="text-center py-4">No tasks available</div>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
               
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Work Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tasks.sort((a, b) => new Date(a.start_time) - new Date(b.start_time)).map((task) => {
                const status = getTaskStatus(task);
                const timeInfo = calculateTimeRemaining(task.start_time, task.end_time);
                return (
                  <tr key={task.id} className={task.status === 'overdue' ? 'bg-red-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {employees.find(emp => emp.id === task.employee_id)?.name || 'Unassigned'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{task.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">{task.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">{task.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        <div>Start: {formatDate(task.start_time)} </div>
                        <div>End: {formatDate(task.due_date)}</div>
                        <div className="mt-1 text-xs font-medium">
                          {timeInfo.type === 'starts_in' && (
                            <span className="text-yellow-600">Starts in: {timeInfo.time}</span>
                          )}
                          {timeInfo.type === 'ends_in' && (
                            <span className="text-blue-600">Ends in: {timeInfo.time}</span>
                          )}
                          {timeInfo.type === 'ended' && (
                            <span className="text-gray-500">Ended: {timeInfo.time}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full ${status.class}`}>
                        {status.icon}
                        <span className="ml-2 text-sm">{status.text}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedTask(task);
                          setShowAddModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 mx-2"
                        title="Edit Task"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-red-600 hover:text-red-900 mx-2"
                        title="Delete Task"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showAddModal && (
        <TaskModal
          mode={selectedTask ? "edit" : "add"}
          task={selectedTask}
          employees={employees}
          onClose={() => {
            setShowAddModal(false);
            setSelectedTask(null);
          }}
          onAdd={handleTaskAdd}
          onUpdate={handleUpdateTask}
          selectedDate={selectedDate}
          fetchEmployees={fetchEmployees}
          isEditing={!!selectedTask}
        />
      )}
    </div>
  );
};

export default TaskManagement;
