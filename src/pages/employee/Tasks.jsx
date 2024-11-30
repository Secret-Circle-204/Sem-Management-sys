import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const TaskStatus = ({ status }) => {
  const statusConfig = {
    completed: { icon: CheckCircle, color: 'text-green-500' },
    pending: { icon: Clock, color: 'text-yellow-500' },
    overdue: { icon: AlertCircle, color: 'text-red-500' }
  };

  const StatusIcon = statusConfig[status].icon;
  return <StatusIcon className={`h-5 w-5 ${statusConfig[status].color}`} />;
};

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        // Simulated tasks data
        const mockTasks = [
          {
            id: 1,
            title: 'Complete Project Proposal',
            description: 'Write and submit the Q1 project proposal',
            dueDate: '2024-03-20',
            status: 'pending'
          },
          {
            id: 2,
            title: 'Review Code Changes',
            description: 'Review pull requests for the main feature branch',
            dueDate: '2024-03-15',
            status: 'completed'
          },
          {
            id: 3,
            title: 'Update Documentation',
            description: 'Update API documentation with new endpoints',
            dueDate: '2024-03-10',
            status: 'overdue'
          }
        ];
        setTasks(mockTasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">My Tasks</h3>
        </div>
        <div className="border-t border-gray-200">
          <ul className="divide-y divide-gray-200">
            {tasks.map((task) => (
              <li key={task.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <TaskStatus status={task.status} />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{task.title}</p>
                      <p className="text-sm text-gray-500">{task.description}</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">Due: {task.dueDate}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Tasks;