import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format, parseISO, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarDays, Clock, ShoppingBag, Users, ChevronRight } from 'lucide-react';
import { useAppStore } from '../../store';
import Button from '../../components/common/Button';

const DashboardPage = () => {
  const { user, appointments, services, fetchAppointments, fetchServices } = useAppStore();
  const [today] = useState(new Date());
  
  useEffect(() => {
    fetchAppointments();
    fetchServices();
  }, [fetchAppointments, fetchServices]);
  
  // Filter today's appointments
  const todayAppointments = appointments.filter(
    (appointment) => isSameDay(parseISO(appointment.start_time), today)
  );
  
  // Calculate some stats
  const totalAppointments = appointments.length;
  const totalServices = services.length;
  
  const stats = [
    {
      name: 'Agendamentos Hoje',
      value: todayAppointments.length,
      icon: <CalendarDays className="h-6 w-6 text-blue-600" />,
      color: 'bg-blue-100',
      link: '/appointments',
    },
    {
      name: 'Total de Agendamentos',
      value: totalAppointments,
      icon: <Users className="h-6 w-6 text-purple-600" />,
      color: 'bg-purple-100',
      link: '/appointments',
    },
    {
      name: 'Serviços Cadastrados',
      value: totalServices,
      icon: <ShoppingBag className="h-6 w-6 text-green-600" />,
      color: 'bg-green-100',
      link: '/services',
    },
    {
      name: 'Horários Disponíveis',
      icon: <Clock className="h-6 w-6 text-orange-600" />,
      color: 'bg-orange-100',
      link: '/working-hours',
    },
  ];
  
  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Bem-vindo, {user?.shop_name}!
        </h1>
        <p className="text-gray-600">
          Confira o resumo da sua barbearia e gerencie seus agendamentos.
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${stat.color}`}>
                  {stat.icon}
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {stat.value !== undefined ? stat.value : '-'}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link
                  to={stat.link}
                  className="font-medium text-primary-700 hover:text-primary-900 flex items-center"
                >
                  Ver detalhes
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Agendamentos de Hoje
          </h3>
          <Link to="/appointments">
            <Button variant="outline" size="sm">
              Ver todos
            </Button>
          </Link>
        </div>
        
        <div className="border-t border-gray-200 divide-y divide-gray-200">
          {todayAppointments.length > 0 ? (
            todayAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="px-4 py-4 sm:px-6 hover:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-medium text-primary-700 truncate">
                          {appointment.client_name}
                        </p>
                        <div className="mt-1 text-sm text-gray-500 flex flex-wrap gap-4">
                          <span className="flex items-center">
                            <Clock className="mr-1.5 h-4 w-4 text-gray-400" />
                            {format(parseISO(appointment.start_time), 'HH:mm', { locale: ptBR })}
                          </span>
                          <span className="flex items-center">
                            <ShoppingBag className="mr-1.5 h-4 w-4 text-gray-400" />
                            {appointment.service?.name || 'Serviço'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="ml-5 flex-shrink-0">
                    <div className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      Confirmado
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-12 text-center">
              <CalendarDays className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Nenhum agendamento para hoje
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Quando clientes agendarem, eles aparecerão aqui.
              </p>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-primary-50 rounded-lg border border-primary-100">
        <div className="flex items-start">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-primary-900">
              Link de agendamento da sua barbearia
            </h3>
            <p className="mt-1 text-sm text-primary-700">
              Compartilhe este link com seus clientes para que eles possam agendar online.
            </p>
            <div className="mt-3 flex items-center">
              <div className="bg-white rounded p-2 flex-1 text-sm border border-primary-200">
                agendafull.com/{user?.shop_slug}
              </div>
              <Button
                variant="primary"
                size="sm"
                className="ml-2"
                onClick={() => {
                  navigator.clipboard.writeText(`agendafull.com/${user?.shop_slug}`);
                }}
              >
                Copiar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;