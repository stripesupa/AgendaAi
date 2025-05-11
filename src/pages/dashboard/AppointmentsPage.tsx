import { useEffect, useState } from 'react';
import { format, parseISO, startOfDay, addDays, isSameDay, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarDays, ChevronLeft, ChevronRight, Clock, User, Phone, ShoppingBag } from 'lucide-react';
import { useAppStore } from '../../store';
import Button from '../../components/common/Button';
import { Appointment } from '../../types';

const AppointmentsPage = () => {
  const { appointments, fetchAppointments, isLoading } = useAppStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekDates, setWeekDates] = useState<Date[]>([]);
  
  useEffect(() => {
    // Create an array of dates for the week
    const startDate = startOfDay(selectedDate);
    const dates = [];
    
    for (let i = 0; i < 7; i++) {
      dates.push(addDays(startDate, i));
    }
    
    setWeekDates(dates);
    
    // Fetch appointments for the week
    const endDate = addDays(startDate, 7);
    fetchAppointments(startDate, endDate);
  }, [selectedDate, fetchAppointments]);
  
  const moveWeek = (direction: 'prev' | 'next') => {
    setSelectedDate((current) => {
      const newDate = addDays(current, direction === 'next' ? 7 : -7);
      return newDate;
    });
  };
  
  const selectDate = (date: Date) => {
    setSelectedDate(date);
  };

  const isValidAppointmentDate = (dateStr?: string): boolean => {
    if (!dateStr) return false;
    try {
      const date = parseISO(dateStr);
      return isValid(date);
    } catch {
      return false;
    }
  };

  const formatDateSafely = (date: Date, formatStr: string, options = {}): string => {
    try {
      if (!isValid(date)) return '--';
      return format(date, formatStr, options);
    } catch {
      return '--';
    }
  };
  
  // Get appointments for the selected date
  const filteredAppointments = appointments.filter((appointment) => {
    if (!isValidAppointmentDate(appointment.start_time)) return false;
    try {
      const appointmentDate = parseISO(appointment.start_time!);
      return isValid(appointmentDate) && isSameDay(appointmentDate, selectedDate);
    } catch {
      return false;
    }
  });
  
  // Sort appointments by start time
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    if (!isValidAppointmentDate(a.start_time) || !isValidAppointmentDate(b.start_time)) return 0;
    try {
      const aDate = parseISO(a.start_time!);
      const bDate = parseISO(b.start_time!);
      if (!isValid(aDate) || !isValid(bDate)) return 0;
      return aDate.getTime() - bDate.getTime();
    } catch {
      return 0;
    }
  });
  
  // Get count of appointments per day for the week
  const appointmentCounts = weekDates.map((date) => {
    return appointments.filter((appointment) => {
      if (!isValidAppointmentDate(appointment.start_time)) return false;
      try {
        const appointmentDate = parseISO(appointment.start_time!);
        return isValid(appointmentDate) && isSameDay(appointmentDate, date);
      } catch {
        return false;
      }
    }).length;
  });
  
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Agendamentos</h1>
        <p className="text-gray-600 mt-1">
          Visualize e gerencie os agendamentos da sua barbearia.
        </p>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => moveWeek('prev')}
            className="rounded-full p-2 w-9 h-9 flex items-center justify-center"
          >
            <ChevronLeft size={20} />
          </Button>
          
          <div className="text-sm md:text-base font-medium text-gray-900">
            {formatDateSafely(weekDates[0], "dd 'de' MMMM", { locale: ptBR })} - {formatDateSafely(weekDates[6], "dd 'de' MMMM", { locale: ptBR })}
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => moveWeek('next')}
            className="rounded-full p-2 w-9 h-9 flex items-center justify-center"
          >
            <ChevronRight size={20} />
          </Button>
        </div>
        
        <div className="grid grid-cols-7 border-b border-gray-200">
          {weekDates.map((date, i) => (
            <button
              key={date.toString()}
              onClick={() => selectDate(date)}
              className={`py-3 relative focus:outline-none ${
                isSameDay(date, selectedDate)
                  ? 'bg-primary-50'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  {formatDateSafely(date, 'E', { locale: ptBR })}
                </p>
                <p
                  className={`mt-1 font-semibold text-sm ${
                    isSameDay(date, selectedDate)
                      ? 'text-primary-700'
                      : 'text-gray-900'
                  }`}
                >
                  {formatDateSafely(date, 'd')}
                </p>
                
                {appointmentCounts[i] > 0 && (
                  <div className="absolute -top-1 right-1/4 transform translate-x-1/2 flex items-center justify-center">
                    <div className="h-5 w-5 rounded-full bg-primary-100 text-primary-800 text-xs font-medium flex items-center justify-center">
                      {appointmentCounts[i]}
                    </div>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {formatDateSafely(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
          </h3>
          
          {isLoading ? (
            <div className="py-6 text-center">
              <div className="mx-auto h-8 w-8 text-gray-400 animate-spin">
                <Clock />
              </div>
              <p className="mt-2 text-sm text-gray-500">Carregando agendamentos...</p>
            </div>
          ) : sortedAppointments.length > 0 ? (
            <div className="space-y-4">
              {sortedAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <CalendarDays className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Nenhum agendamento para esta data
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Quando houver agendamentos para esta data, eles aparecerão aqui.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface AppointmentCardProps {
  appointment: Appointment;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment }) => {
  const formatAppointmentTime = (dateStr?: string) => {
    if (!dateStr) return '--:--';
    try {
      const date = parseISO(dateStr);
      if (!isValid(date)) return '--:--';
      return format(date, 'HH:mm');
    } catch {
      return '--:--';
    }
  };
  
  const statusColors = {
    scheduled: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800',
  };
  
  const statusLabels = {
    scheduled: 'Agendado',
    cancelled: 'Cancelado',
    completed: 'Concluído',
  };
  
  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-base font-medium text-gray-900">
            {appointment.client_name}
          </h4>
          <p className="text-sm text-gray-500">
            {appointment.service?.name || 'Serviço'}
          </p>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[appointment.status]}`}>
          {statusLabels[appointment.status]}
        </div>
      </div>
      
      <div className="mt-3 grid grid-cols-2 gap-4">
        <div className="flex items-center text-sm text-gray-600">
          <Clock size={16} className="mr-1.5 text-gray-400" />
          {formatAppointmentTime(appointment.start_time)} - {formatAppointmentTime(appointment.end_time)}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Phone size={16} className="mr-1.5 text-gray-400" />
          {appointment.client_phone}
        </div>
      </div>
      
      <div className="mt-3 flex space-x-2">
        <Button variant="outline" size="sm">
          Confirmar
        </Button>
        <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50">
          Cancelar
        </Button>
      </div>
    </div>
  );
};

export default AppointmentsPage;