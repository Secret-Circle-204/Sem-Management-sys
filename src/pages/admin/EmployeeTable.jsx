import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import EmployeeDetailsModal from '../../components/EmployeeDetailsModal';
import EmployeeTasksModal from '../../components/EmployeeTasksModal';
import AddEmployeeModal from '../../components/AddEmployeeModal';
import { ClipboardList, Eye, ListRestart, Smartphone, Trash2, UserPlus } from 'lucide-react';
import { Phone } from 'lucide-react';
import { toast } from 'react-hot-toast';

const EmployeeTable = () => {
  const [employees, setEmployees] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showTasksModal, setShowTasksModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    department: '',
    gender: '',
    sortBy: '',
    sortOrder: 'asc'
  });

  const navigate = useNavigate();

  // الحصول على قائمة الأقسام الفريقة
  const departments = [...new Set(employees.map(emp => emp.department))].filter(Boolean);

  useEffect(() => {
    fetchEmployees();
  }, [filters]);

  const fetchEmployees = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const queryParams = new URLSearchParams({
        ...filters,
        search: filters?.search.trim()
      }).toString();

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/employees?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }

      const data = await response.json();

      // التأكد من أن البيانات مصفوفة
      if (Array.isArray(data)) {
        setEmployees(data);
      } else if (data.employees && Array.isArray(data.employees)) {
        setEmployees(data.employees);
      } else {
        console.error('Unexpected data format:', data);
        setEmployees([]);
        toast.error('تنسيق البيانات غير صحيح');
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployees([]);
      toast.error('خطأ في تحميل بيانات الموظفين');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleShowDetails = (employee) => {
    setSelectedEmployee(employee);
    setShowDetailsModal(true);
  };

  const handleShowTasks = (employee) => {
    setSelectedEmployee(employee);
    setShowTasksModal(true);
  };

  const handleAssignTask = (employee) => {
    navigate('/admin/tasks', { state: { selectedEmployee: employee } });
  };

  const handleUpdateEmployee = (updatedEmployee) => {
    setEmployees(employees.map(emp =>
      emp.id === updatedEmployee?.id ? updatedEmployee : emp
    ));
  };

  const handleDeleteEmployee = async (employee) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الموظف؟ لا يمكن التراجع عن هذا الإجراء.')) {
      return; // إذا ضغط المستخدم على "إلغاء"
    }

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/employees/${employee?.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (response.ok) {
        setEmployees(employees.filter(emp => emp.id !== employee?.id));
      } else {
        throw new Error('Failed to delete employee');
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert('Error deleting employee');
    }
  };

  const handleViewTasks = async (employee) => {
    try {
      // تحقق من وجود المهام قبل فتح النافذة المنبثقة
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/tasks/employee/${employee?.id}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const tasks = await response.json();
      console.log('Tasks for employee:', tasks); // للتأكد من استلام البيانات

      setSelectedEmployee(employee);
      setShowTasksModal(true);
    } catch (error) {
      console.error('Error checking tasks:', error);
      alert('An error occurred while checking tasks');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-900 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-800"
          >
            <UserPlus className="h-5 w-5" />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <input
                type="text"
                name="search"
                placeholder="Search..."
                className="w-full p-2 border rounded"
                value={filters?.search}
                onChange={handleFilterChange}
              />
            </div>
            <div>
              <select
                name="department"
                className="w-full p-2 border rounded"
                value={filters?.department}
                onChange={handleFilterChange}
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                name="gender"
                className="w-full p-2 border rounded"
                value={filters?.gender}
                onChange={handleFilterChange}
              >
                <option value="">All Genders</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>
        </div>

        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs text-white font-medium border-r-2 bg-blue-900 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs text-white font-medium border-r-2 bg-blue-900 uppercase tracking-wider">Gender</th>
              <th className="px-6 py-3 text-left text-xs text-white font-medium border-r-2 bg-blue-900 uppercase tracking-wider">Department</th>
              <th className="px-6 py-3 text-left text-xs text-white font-medium border-r-2 bg-blue-900 uppercase tracking-wider">Job Title</th>
              <th className="px-6 py-3 text-left text-xs text-white font-medium border-r-2 bg-blue-900 uppercase tracking-wider">Work Hours</th>
              <th className="px-6 py-3 text-left text-xs text-white font-medium border-r-2 bg-blue-900 uppercase tracking-wider">Phone</th>
              <th className="px-6 py-3 text-left text-xs text-white font-medium border-r-2 bg-blue-900 uppercase tracking-wider">Tasks Count</th>
              <th className="px-6 py-3 text-left text-xs text-white font-medium border-r-2 bg-blue-900 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {employees.map((employee) => (
              <tr key={employee?.id}>
                <td className="bg-gray-50 hover:bg-gray-200 px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{employee?.name}</div>
                </td>
                <td className="bg-gray-50 hover:bg-gray-200 px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{employee?.gender}</div>
                </td>
                <td className="bg-gray-50 hover:bg-gray-200 px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{employee?.department}</div>
                </td>
                <td className="bg-gray-50 hover:bg-gray-200 px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{employee?.job_title}</div>
                </td>
                <td className="bg-gray-50 hover:bg-gray-200 px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {employee?.start_time} - {employee?.end_time}
                  </div>
                </td>
                <td className="bg-gray-50 hover:bg-gray-200 px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    <Link to={`tel:${employee?.phone}`} className="flex items-center space-x-1 text-blue-600 hover:text-blue-800">
                      <span>
                        <Phone className="h-4 w-4" />
                      </span>
                      Call: {employee?.name}
                    </Link>
                  </div>
                </td>
                <td className="bg-gray-50 hover:bg-gray-200 px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {employee?.task_count || 0}
                  </div>
                </td>
                <td className="bg-gray-50 px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleShowDetails(employee)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleShowTasks(employee)}
                      className="text-green-600 hover:text-green-900"
                    >
                      <ClipboardList className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteEmployee(employee)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <AddEmployeeModal
          onClose={() => setShowAddModal(false)}
          onEmployeeAdded={() => {
            fetchEmployees();
            setShowAddModal(false);
          }}
        />
      )}

      {showDetailsModal && selectedEmployee && (
        <EmployeeDetailsModal
          employee={selectedEmployee}
          onClose={() => setShowDetailsModal(false)}
          onUpdate={handleUpdateEmployee}
        />
      )}

      {showTasksModal && selectedEmployee && (
        <EmployeeTasksModal
          employee={selectedEmployee}
          onClose={() => {
            setShowTasksModal(false);
            setSelectedEmployee(null);
          }}
        />
      )}
    </div>
  );
};

export default EmployeeTable;