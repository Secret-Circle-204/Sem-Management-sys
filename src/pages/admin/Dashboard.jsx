import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white overflow-hidden shadow rounded-lg">
    <div className="p-5">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="text-lg font-medium text-gray-900">{value}</dd>
          </dl>
        </div>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const response = await fetch('/api/dashboard/stats', {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }
        
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setStats({
          totalEmployees: 0,
          completedTasks: 0,
          pendingTasks: 0,
          overdueTasks: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Employees"
          value={stats.totalEmployees}
          icon={Users}
          color="text-blue-500"
        />
        <StatCard
          title="Completed Tasks"
          value={stats.completedTasks}
          icon={CheckCircle}
          color="text-green-500"
        />
        <StatCard
          title="Pending Tasks"
          value={stats.pendingTasks}
          icon={Clock}
          color="text-yellow-500"
        />
        <StatCard
          title="Overdue Tasks"
          value={stats.overdueTasks}
          icon={AlertCircle}
          color="text-red-500"
        />
      </div>
    </div>
  );
};

export default Dashboard;