import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const Schedule = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        // Simulated schedule data
        const mockSchedule = [
          { id: 1, day: 'Monday', startTime: '09:00', endTime: '17:00' },
          { id: 2, day: 'Tuesday', startTime: '09:00', endTime: '17:00' },
          { id: 3, day: 'Wednesday', startTime: '09:00', endTime: '17:00' },
          { id: 4, day: 'Thursday', startTime: '09:00', endTime: '17:00' },
          { id: 5, day: 'Friday', startTime: '09:00', endTime: '17:00' }
        ];
        setSchedule(mockSchedule);
      } catch (error) {
        console.error('Error fetching schedule:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex items-center">
        <CalendarIcon className="h-6 w-6 text-blue-500 mr-2" />
        <h3 className="text-lg leading-6 font-medium text-gray-900">Weekly Schedule</h3>
      </div>
      <div className="border-t border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Day
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Start Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                End Time
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {schedule.map((day) => (
              <tr key={day.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {day.day}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {day.startTime}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {day.endTime}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Schedule;