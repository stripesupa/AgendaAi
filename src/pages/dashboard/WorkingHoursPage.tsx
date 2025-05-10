import { useEffect, useState } from 'react';
import { Clock, Save } from 'lucide-react';
import { useAppStore } from '../../store';
import Button from '../../components/common/Button';
import { WorkingHours } from '../../types';

const DAYS_OF_WEEK = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

const DEFAULT_START_TIME = '09:00';
const DEFAULT_END_TIME = '18:00';

interface TimeRange {
  startTime: string;
  endTime: string;
  isWorkingDay: boolean;
}

const WorkingHoursPage = () => {
  const { workingHours, fetchWorkingHours, updateWorkingHours, isLoading } = useAppStore();
  const [timeRanges, setTimeRanges] = useState<TimeRange[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  
  useEffect(() => {
    fetchWorkingHours();
  }, [fetchWorkingHours]);
  
  useEffect(() => {
    if (workingHours.length > 0) {
      // Convert working hours to time ranges
      const ranges = DAYS_OF_WEEK.map((_, index) => {
        const dayHours = workingHours.find((h) => h.day_of_week === index);
        
        return {
          startTime: dayHours?.start_time || DEFAULT_START_TIME,
          endTime: dayHours?.end_time || DEFAULT_END_TIME,
          isWorkingDay: dayHours ? dayHours.is_working_day : index !== 0, // Default: Sunday off, others on
        };
      });
      
      setTimeRanges(ranges);
    } else {
      // Set default values
      const defaultRanges = DAYS_OF_WEEK.map((_, index) => ({
        startTime: DEFAULT_START_TIME,
        endTime: DEFAULT_END_TIME,
        isWorkingDay: index !== 0, // Default: Sunday off, others on
      }));
      
      setTimeRanges(defaultRanges);
    }
    
    setHasChanges(false);
  }, [workingHours]);
  
  const handleToggleDay = (index: number) => {
    const newRanges = [...timeRanges];
    newRanges[index].isWorkingDay = !newRanges[index].isWorkingDay;
    setTimeRanges(newRanges);
    setHasChanges(true);
  };
  
  const handleTimeChange = (
    index: number,
    field: 'startTime' | 'endTime',
    value: string
  ) => {
    const newRanges = [...timeRanges];
    newRanges[index][field] = value;
    setTimeRanges(newRanges);
    setHasChanges(true);
  };
  
  const handleSave = async () => {
    const formattedHours: Omit<WorkingHours, 'id' | 'user_id'>[] = timeRanges.map(
      (range, index) => ({
        day_of_week: index,
        start_time: range.startTime,
        end_time: range.endTime,
        is_working_day: range.isWorkingDay,
      })
    );
    
    await updateWorkingHours(formattedHours as WorkingHours[]);
    setHasChanges(false);
  };
  
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Horários de Funcionamento</h1>
        <p className="text-gray-600 mt-1">
          Configure os dias e horários em que sua barbearia está aberta para agendamentos.
        </p>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="p-6">
          <div className="mb-6 flex items-center">
            <Clock className="h-5 w-5 text-primary-600 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Horários de Atendimento</h2>
          </div>
          
          <div className="space-y-4">
            {DAYS_OF_WEEK.map((day, index) => (
              <div key={day} className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-200">
                <div className="flex items-center w-full sm:w-1/3 mb-3 sm:mb-0">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      checked={timeRanges[index]?.isWorkingDay || false}
                      onChange={() => handleToggleDay(index)}
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      {day}
                    </span>
                  </label>
                </div>
                
                {timeRanges[index]?.isWorkingDay && (
                  <div className="flex items-center space-x-2 text-sm">
                    <select
                      className="rounded-md border-gray-300 py-2 pl-3 pr-10 focus:border-primary-500 focus:ring-primary-500"
                      value={timeRanges[index]?.startTime || DEFAULT_START_TIME}
                      onChange={(e) =>
                        handleTimeChange(index, 'startTime', e.target.value)
                      }
                    >
                      {generateTimeOptions()}
                    </select>
                    <span className="text-gray-500">até</span>
                    <select
                      className="rounded-md border-gray-300 py-2 pl-3 pr-10 focus:border-primary-500 focus:ring-primary-500"
                      value={timeRanges[index]?.endTime || DEFAULT_END_TIME}
                      onChange={(e) =>
                        handleTimeChange(index, 'endTime', e.target.value)
                      }
                    >
                      {generateTimeOptions()}
                    </select>
                  </div>
                )}
                
                {!timeRanges[index]?.isWorkingDay && (
                  <div className="text-sm text-gray-500 italic">Fechado</div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-6">
            <Button
              onClick={handleSave}
              variant="primary"
              disabled={isLoading || !hasChanges}
              className="flex items-center"
            >
              <Save size={18} className="mr-1.5" />
              {isLoading ? 'Salvando...' : 'Salvar Horários'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to generate time options in 30-minute intervals
function generateTimeOptions() {
  const options = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute of [0, 30]) {
      const formattedHour = hour.toString().padStart(2, '0');
      const formattedMinute = minute.toString().padStart(2, '0');
      const time = `${formattedHour}:${formattedMinute}`;
      options.push(
        <option key={time} value={time}>
          {time}
        </option>
      );
    }
  }
  return options;
}

export default WorkingHoursPage;