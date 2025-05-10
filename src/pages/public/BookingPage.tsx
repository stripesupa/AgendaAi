import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { format, addMinutes, parseISO, isAfter, isBefore, setHours, setMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock, Calendar, CheckCircle, ArrowRight, Phone, User } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import * as supabaseApi from '../../lib/supabase';
import { Service, WorkingHours, TimeSlot } from '../../types';

interface BookingFormValues {
  clientName: string;
  clientPhone: string;
}

enum BookingStep {
  SelectService,
  SelectDateTime,
  EnterDetails,
  Confirmation
}

const BookingPage = () => {
  const { shopSlug } = useParams<{ shopSlug: string }>();
  const navigate = useNavigate();
  
  const [barber, setBarber] = useState<any>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [bookingStep, setBookingStep] = useState<BookingStep>(BookingStep.SelectService);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors } } = useForm<BookingFormValues>();
  
  // Load barber data, services and working hours
  useEffect(() => {
    const loadBarberData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (!shopSlug) {
          throw new Error('Shop slug is required');
        }
        
        const barberData = await supabaseApi.getBarberBySlug(shopSlug);
        if (!barberData) {
          throw new Error('Barbearia não encontrada');
        }
        
        setBarber(barberData);
        
        const servicesData = await supabaseApi.getBarberServices(barberData.id);
        setServices(servicesData);
        
        const workingHoursData = await supabaseApi.getBarberWorkingHours(barberData.id);
        setWorkingHours(workingHoursData);
        
      } catch (err) {
        setError((err as Error).message);
        console.error('Error loading barber data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadBarberData();
  }, [shopSlug]);
  
  // Generate time slots when service, date or working hours change
  useEffect(() => {
    if (selectedService && workingHours.length > 0) {
      const slots = generateTimeSlots(selectedDate, selectedService, workingHours);
      setTimeSlots(slots);
    }
  }, [selectedService, selectedDate, workingHours]);
  
  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setBookingStep(BookingStep.SelectDateTime);
  };
  
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null);
  };
  
  const handleTimeSlotSelect = (timeSlot: TimeSlot) => {
    setSelectedTimeSlot(timeSlot);
  };
  
  const handleBackToServices = () => {
    setBookingStep(BookingStep.SelectService);
    setSelectedService(null);
  };
  
  const handleBackToDateTime = () => {
    setBookingStep(BookingStep.SelectDateTime);
  };
  
  const handleContinueToDetails = () => {
    if (selectedTimeSlot) {
      setBookingStep(BookingStep.EnterDetails);
    }
  };
  
  const onSubmitDetails = async (data: BookingFormValues) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!selectedService || !selectedTimeSlot || !barber) {
        throw new Error('Dados incompletos para agendamento');
      }
      
      // Create appointment
      await supabaseApi.createAppointment({
        service_id: selectedService.id,
        client_name: data.clientName,
        client_phone: data.clientPhone,
        start_time: selectedTimeSlot.startTime.toISOString(),
        end_time: selectedTimeSlot.endTime.toISOString(),
        barber_id: barber.id,
      });
      
      setBookingStep(BookingStep.Confirmation);
    } catch (err) {
      setError((err as Error).message);
      console.error('Error creating appointment:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const generateTimeSlots = (date: Date, service: Service, hours: WorkingHours[]): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const dayOfWeek = date.getDay();
    
    // Find working hours for the selected day
    const dayHours = hours.find((h) => h.day_of_week === dayOfWeek);
    
    if (!dayHours || !dayHours.is_working_day) {
      return []; // Not a working day
    }
    
    // Parse start and end time
    const [startHour, startMinute] = dayHours.start_time.split(':').map(Number);
    const [endHour, endMinute] = dayHours.end_time.split(':').map(Number);
    
    const startDateTime = setMinutes(setHours(date, startHour), startMinute);
    const endDateTime = setMinutes(setHours(date, endHour), endMinute);
    
    // Generate slots every 30 minutes
    const serviceDuration = service.duration;
    let slotStart = new Date(startDateTime);
    
    while (isAfter(endDateTime, addMinutes(slotStart, serviceDuration))) {
      const slotEnd = addMinutes(slotStart, serviceDuration);
      
      slots.push({
        startTime: new Date(slotStart),
        endTime: new Date(slotEnd),
        isAvailable: true // In a real app, check against existing appointments
      });
      
      slotStart = addMinutes(slotStart, 30); // 30-minute intervals
    }
    
    return slots;
  };
  
  const generateDateOptions = () => {
    const options = [];
    const today = new Date();
    
    for (let i = 0; i < 14; i++) { // Show next 14 days
      const date = addMinutes(today, i * 24 * 60); // Add days
      options.push(date);
    }
    
    return options;
  };
  
  if (isLoading && !barber) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-md mx-auto px-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <h2 className="text-lg font-medium">Erro</h2>
          <p>{error}</p>
          <Button 
            variant="primary" 
            className="mt-4" 
            onClick={() => navigate('/')}
          >
            Voltar à página inicial
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-2xl mx-auto px-4 pb-12 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {barber?.shop_name}
        </h1>
        <p className="text-gray-600">
          Escolha o serviço e horário para seu agendamento
        </p>
      </div>
      
      {/* Booking Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
              bookingStep >= BookingStep.SelectService ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              1
            </div>
            <div className="ml-2 text-sm font-medium text-gray-900">Serviço</div>
          </div>
          <div className="h-px w-12 bg-gray-200"></div>
          <div className="flex items-center">
            <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
              bookingStep >= BookingStep.SelectDateTime ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              2
            </div>
            <div className="ml-2 text-sm font-medium text-gray-900">Data/Hora</div>
          </div>
          <div className="h-px w-12 bg-gray-200"></div>
          <div className="flex items-center">
            <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
              bookingStep >= BookingStep.EnterDetails ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              3
            </div>
            <div className="ml-2 text-sm font-medium text-gray-900">Detalhes</div>
          </div>
        </div>
      </div>
      
      {/* Service Selection */}
      {bookingStep === BookingStep.SelectService && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Escolha o serviço
          </h2>
          
          <div className="space-y-3">
            {services.map((service) => (
              <button
                key={service.id}
                onClick={() => handleServiceSelect(service)}
                className="w-full p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-left"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-gray-900">{service.name}</h3>
                    {service.description && (
                      <p className="mt-1 text-sm text-gray-500">{service.description}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-lg font-medium text-primary-700">
                      R$ {service.price.toFixed(2)}
                    </span>
                    <span className="flex items-center text-sm text-gray-500">
                      <Clock size={14} className="mr-1" /> {service.duration} min
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Date & Time Selection */}
      {bookingStep === BookingStep.SelectDateTime && selectedService && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={handleBackToServices}
              className="text-primary-600 text-sm font-medium hover:text-primary-700"
            >
              ← Voltar para serviços
            </button>
            <div>
              <h3 className="font-medium text-gray-900">{selectedService.name}</h3>
              <div className="flex items-center justify-end text-sm text-gray-500 mt-1">
                <Clock size={14} className="mr-1" /> {selectedService.duration} min
                <span className="mx-2">|</span>
                <span>R$ {selectedService.price.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Escolha uma data
            </h2>
            <div className="flex overflow-x-auto pb-2 space-x-2">
              {generateDateOptions().map((date) => (
                <button
                  key={date.toString()}
                  onClick={() => handleDateSelect(date)}
                  className={`flex-shrink-0 p-3 border rounded-lg focus:outline-none ${
                    isSameDay(date, selectedDate)
                      ? 'bg-primary-50 border-primary-300 text-primary-700'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-center w-16">
                    <p className="text-xs text-gray-500 mb-1">
                      {format(date, 'E', { locale: ptBR })}
                    </p>
                    <p className="text-lg font-medium">
                      {format(date, 'd')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(date, 'MMM', { locale: ptBR })}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Horários disponíveis
            </h2>
            
            {timeSlots.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {timeSlots.map((slot, index) => (
                  <button
                    key={index}
                    onClick={() => handleTimeSlotSelect(slot)}
                    disabled={!slot.isAvailable}
                    className={`p-2 text-center border rounded-lg focus:outline-none ${
                      selectedTimeSlot === slot
                        ? 'bg-primary-50 border-primary-300 text-primary-700'
                        : slot.isAvailable
                        ? 'border-gray-200 hover:bg-gray-50'
                        : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {format(slot.startTime, 'HH:mm')}
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-500">
                  Não há horários disponíveis nesta data. Por favor, escolha outra data.
                </p>
              </div>
            )}
            
            <div className="mt-6">
              <Button
                variant="primary"
                fullWidth
                disabled={!selectedTimeSlot}
                onClick={handleContinueToDetails}
              >
                Continuar
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Enter Details */}
      {bookingStep === BookingStep.EnterDetails && selectedService && selectedTimeSlot && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={handleBackToDateTime}
              className="text-primary-600 text-sm font-medium hover:text-primary-700"
            >
              ← Voltar para data/hora
            </button>
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Detalhes do agendamento
            </h2>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Serviço:</span>
                <span className="font-medium text-gray-900">{selectedService.name}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Data:</span>
                <span className="font-medium text-gray-900">
                  {format(selectedTimeSlot.startTime, "dd 'de' MMMM", { locale: ptBR })}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Horário:</span>
                <span className="font-medium text-gray-900">
                  {format(selectedTimeSlot.startTime, 'HH:mm')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Valor:</span>
                <span className="font-medium text-gray-900">
                  R$ {selectedService.price.toFixed(2)}
                </span>
              </div>
            </div>
            
            <form onSubmit={handleSubmit(onSubmitDetails)} className="space-y-4">
              <Input
                label="Seu nome"
                placeholder="João Silva"
                icon={<User size={18} />}
                error={errors.clientName?.message}
                {...register('clientName', { 
                  required: 'Nome é obrigatório' 
                })}
              />
              
              <Input
                label="Seu telefone"
                placeholder="(11) 99999-9999"
                icon={<Phone size={18} />}
                error={errors.clientPhone?.message}
                {...register('clientPhone', { 
                  required: 'Telefone é obrigatório',
                  pattern: {
                    value: /^\(?[1-9]{2}\)? ?(?:[2-8]|9[1-9])[0-9]{3}\-?[0-9]{4}$/,
                    message: 'Telefone inválido'
                  }
                })}
              />
              
              <div className="pt-2">
                <Button 
                  type="submit" 
                  variant="primary" 
                  fullWidth
                  disabled={isLoading}
                >
                  {isLoading ? 'Confirmando...' : 'Confirmar Agendamento'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Confirmation */}
      {bookingStep === BookingStep.Confirmation && selectedService && selectedTimeSlot && (
        <div className="bg-white shadow-md rounded-lg p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle size={48} className="text-green-600" />
            </div>
          </div>
          
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Agendamento Confirmado!
          </h2>
          
          <p className="text-gray-600 mb-6">
            Seu agendamento foi confirmado com sucesso.
          </p>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-left mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Serviço:</span>
              <span className="font-medium text-gray-900">{selectedService.name}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Data:</span>
              <span className="font-medium text-gray-900">
                {format(selectedTimeSlot.startTime, "dd 'de' MMMM", { locale: ptBR })}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Horário:</span>
              <span className="font-medium text-gray-900">
                {format(selectedTimeSlot.startTime, 'HH:mm')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Valor:</span>
              <span className="font-medium text-gray-900">
                R$ {selectedService.price.toFixed(2)}
              </span>
            </div>
          </div>
          
          <div className="mb-6 p-4 bg-primary-50 border border-primary-100 rounded-lg text-left">
            <p className="text-sm text-primary-700">
              <strong>Lembrete:</strong> Em caso de impedimento, por favor, cancele seu agendamento com pelo menos 2 horas de antecedência.
            </p>
          </div>
          
          <Button
            variant="primary"
            onClick={() => window.location.reload()}
          >
            Fazer Novo Agendamento
          </Button>
        </div>
      )}
    </div>
  );
};

// Helper function to check if two dates are on the same day
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export default BookingPage;