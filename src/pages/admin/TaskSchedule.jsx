import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import TaskModal from '../../components/TaskModal';
import { Plus } from 'lucide-react';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light-border.css';

const TaskSchedule = () => {
  const [scheduledTasks, setScheduledTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const calendarRef = useRef(null);

  useEffect(() => {
    fetchScheduledTasks();
    fetchEmployees();
  }, []);

  useEffect(() => {
    const updateTasksStatus = () => {
      const now = new Date();
      setScheduledTasks(prevTasks => 
        prevTasks.map(task => {
          const start = new Date(task.start);
          const end = new Date(task.end);
          const progress = calculateProgress(start, end, now);
          
          return {
            ...task,
            extendedProps: {
              ...task.extendedProps,
              progress,
              status: now > end ? 'completed' : now >= start ? 'ongoing' : 'upcoming'
            }
          };
        })
      );
    };

    const interval = setInterval(updateTasksStatus, 60000); // تحديث كل دقيقة
    updateTasksStatus(); // تحديث فوري عند التحميل

    return () => clearInterval(interval);
  }, []);

  const calculateProgress = (start, end, now) => {
    if (now < start) return 0;
    if (now > end) return 100;
    
    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    return Math.round((elapsed / total) * 100);
  };

  const fetchScheduledTasks = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/schedule`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const tasks = await response.json();
      console.log('Fetched tasks:', tasks);

      // تنسيق المهام للعرض في التقويم
      const formattedTasks = tasks.map(task => {
        const employeeName = task.employee_name || 'Unassigned';
        return {
          id: task.id,
          title: `${employeeName} - ${task.title}`,
          start: new Date(task.start_time),
          end: new Date(task.end_time),
          extendedProps: {
            description: task.description,
            location: task.location,
            employee_id: task.employee_id,
            employee_name: employeeName
          }
        };
      });

      setScheduledTasks(formattedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to fetch tasks');
    }
  };

  const fetchEmployees = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/employees`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to fetch employees');
    }
  };

  const handleDateClick = (arg) => {
    setSelectedDate(arg.date);
    setShowAddModal(true);
    setShowViewModal(false); // إغلاق نافذة العرض إذا كانت مفتوحة
  };

  const handleEventClick = (info) => {
    setSelectedTask(info.event);
    setShowViewModal(true);
    setShowAddModal(false); // إغلاق نافذة الإضافة إذا كانت مفتوحة
    setIsEditing(false);
  };

  const handleTaskDelete = async (taskId) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/schedule/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      // Remove task from local state
      setScheduledTasks(prev => prev.filter(task => task.id !== taskId));
      
      // Refresh calendar
      if (calendarRef.current) {
        const calendarApi = calendarRef.current.getApi();
        calendarApi.refetchEvents();
      }

      toast.success('Task deleted successfully');
      setShowViewModal(false);
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const handleTaskAdd = async (taskData) => {
    try {
      console.log('Adding new task:', taskData);
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

      const newTask = await response.json();
      console.log('New task created:', newTask);
      
      // Get employee name
      const employee = employees.find(emp => emp.id === parseInt(taskData.employee_id));
      const employeeName = employee ? employee.name : 'Unassigned';
      
      // Format the new task
      const formattedTask = {
        id: newTask.id,
        title: `${employeeName} - ${newTask.title}`,
        start: new Date(newTask.start_time),
        end: new Date(newTask.end_time),
        extendedProps: {
          description: newTask.description,
          location: newTask.location,
          employee_id: newTask.employee_id,
          employee_name: employeeName,
          status: 'upcoming'
        }
      };
      
      setScheduledTasks(prev => [...prev, formattedTask]);
      
      // Refresh calendar
      if (calendarRef.current) {
        const calendarApi = calendarRef.current.getApi();
        calendarApi.refetchEvents();
      }
      
      toast.success('Task added successfully');
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error(error.message || 'Failed to add task');
    }
  };

  const handleTaskUpdate = async (taskId, taskData) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/schedule/${taskId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      const updatedTask = await response.json();
      
      // Get employee name
      const employee = employees.find(emp => emp.id === parseInt(taskData.employee_id));
      const employeeName = employee ? employee.name : 'Unassigned';
      
      // Update task in local state
      setScheduledTasks(prev => prev.map(task => {
        if (task.id === taskId) {
          return {
            id: updatedTask.id,
            title: `${employeeName} - ${updatedTask.title}`,
            start: new Date(updatedTask.start_time),
            end: new Date(updatedTask.end_time),
            extendedProps: {
              description: updatedTask.description,
              location: updatedTask.location,
              employee_id: updatedTask.employee_id,
              employee_name: employeeName,
              status: task.extendedProps.status
            }
          };
        }
        return task;
      }));

      // Refresh calendar
      if (calendarRef.current) {
        const calendarApi = calendarRef.current.getApi();
        calendarApi.refetchEvents();
      }

      toast.success('Task updated successfully');
      setShowViewModal(false);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  // إضافة مصفوفة الألوان للمهام
  const taskColors = [
    { background: '#FF9F43', text: '#fff' }, // برتقالي
    { background: '#00CFE8', text: '#fff' }, // أزرق فاتح
    { background: '#1B2850', text: '#fff' }, // كحلي
    { background: '#28C76F', text: '#fff' }, // أخضر
    { background: '#EA5455', text: '#fff' }, // أحمر
    { background: '#7367F0', text: '#fff' }, // بنفسجي
    { background: '#FF9F9F', text: '#000' }, // وردي فاتح
    { background: '#82868B', text: '#fff' }  // رمادي
  ];

  // دالة لتوليد لون للموظف بناءً على معرفه
  const getEmployeeColor = (employeeId) => {
    const colorIndex = employeeId % taskColors.length;
    return taskColors[colorIndex];
  };

  const renderEventContent = (eventInfo) => {
    const title = eventInfo.event.title;
    const location = eventInfo.event.extendedProps.location;
    
    return (
      <div className="flex flex-col h-full w-full overflow-hidden text-xs">
        <div className="font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
          {title}
        </div>
        {eventInfo.event.end.getTime() - eventInfo.event.start.getTime() > 3600000 && (
          <div className="whitespace-nowrap overflow-hidden text-ellipsis opacity-75">
            {location}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Task Schedule</h1>
        <button
          onClick={() => {
            setShowAddModal(true);
            setShowViewModal(false);
            setSelectedDate(new Date());
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="mr-2" size={16} />
          Add Task
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-lg">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          eventContent={renderEventContent}
          eventDidMount={info => {
            const employeeColor = getEmployeeColor(parseInt(info.event.extendedProps.employee_id));
            const now = new Date();
            const start = new Date(info.event.start);
            const end = new Date(info.event.end);
            const status = now > end ? 'completed' : now >= start ? 'ongoing' : 'upcoming';
            const progress = calculateProgress(start, end, now);

            tippy(info.el, {
              content: `
                <div class="p-2">
                  <div class="font-bold mb-2">${info.event.title}</div>
                  <div class="mb-2"><b>Location:</b> ${info.event.extendedProps.location}</div>
                  <div class="mb-2"><b>Time:</b> ${new Date(info.event.start).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit'
                  })} - ${new Date(info.event.end).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit'
                  })}</div>
                  <div class="mb-1"><b>Description:</b> ${info.event.extendedProps.description || 'No description'}</div>
                  ${status === 'ongoing' ? `<div class="mb-1"><b>Progress:</b> ${progress}%</div>` : ''}
                  <div><b>Status:</b> <span class="capitalize">${status}</span></div>
                </div>
              `,
              allowHTML: true,
              placement: 'auto',
              interactive: true,
              appendTo: document.body,
              zIndex: 9999,
              theme: 'light',
              animation: 'scale'
            });

            info.el.style.backgroundColor = employeeColor.background;
            info.el.style.borderColor = employeeColor.background;
            info.el.style.color = employeeColor.text;
            info.el.style.padding = '4px 6px';
            info.el.style.borderRadius = '6px';
            info.el.style.margin = '1px 0';
          }}
          nowIndicator={true}
          slotMinTime="01:00:00"
          slotMaxTime="24:00:00"
          allDaySlot={false}
          slotDuration="01:00:00"
          slotLabelInterval="01:00:00"
          slotLabelFormat={{
            hour: 'numeric',
            minute: '2-digit',
            meridiem: 'short',
            hour12: true
          }}
          events={scheduledTasks}
          eventClick={handleEventClick}
          height="750px"
          dayMaxEvents={false}
          locale="en"
          direction="ltr"
          firstDay={0}
          weekends={true}
          businessHours={{
            daysOfWeek: [1, 2, 3, 4, 5],
            startTime: '00:00',
            endTime: '24:00',
          }}
          slotEventOverlap={false}
          eventOverlap={false}
          displayEventEnd={true}
          eventMaxStack={3}
          slotMinWidth={100}
          // slotDuration="01:00:00"
          slotHeight={80}
          dayHeaderClassNames="text-lg font-semibold py-4"
          slotLabelClassNames="text-base font-medium pr-4"
          eventClassNames="rounded-lg shadow-sm"
          dayCellClassNames="px-3"
          buttonText={{
            today: 'Today',
            month: 'Month',
            week: 'Week',
            day: 'Day'
          }}
          dayHeaderFormat={{
            weekday: 'long',
            month: 'numeric',
            day: 'numeric',
            omitCommas: true
          }}
        />
      </div>
      {showViewModal && (
        <TaskModal
          mode="view"
          task={selectedTask}
          employees={employees}
          onClose={() => {
            setShowViewModal(false);
            setIsEditing(false);
          }}
          onUpdate={handleTaskUpdate}
          onDelete={handleTaskDelete}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          fetchEmployees={fetchEmployees}
        />
      )}
      {showAddModal && (
        <TaskModal
          mode="add"
          employees={employees}
          onClose={() => {
            setShowAddModal(false);
            setSelectedDate(null);
          }}
          onAdd={handleTaskAdd}
          selectedDate={selectedDate}
          fetchEmployees={fetchEmployees}
          isEditing={false}
        />
      )}
    </div>
  );
};

export default TaskSchedule;
