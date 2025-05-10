import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Pencil, Trash2, X, Clock, DollarSign, ShoppingBag } from 'lucide-react';
import { useAppStore } from '../../store';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Service } from '../../types';

interface ServiceFormValues {
  name: string;
  duration: number;
  price: number;
  description?: string;
}

const ServicesPage = () => {
  const { services, fetchServices, createService, updateService, deleteService, isLoading } = useAppStore();
  const [isCreating, setIsCreating] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ServiceFormValues>();
  
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);
  
  const handleCreateClick = () => {
    setIsCreating(true);
    setEditingServiceId(null);
    reset({
      name: '',
      duration: 30,
      price: 0,
      description: '',
    });
  };
  
  const handleEditClick = (service: Service) => {
    setIsCreating(false);
    setEditingServiceId(service.id);
    setValue('name', service.name);
    setValue('duration', service.duration);
    setValue('price', service.price);
    setValue('description', service.description || '');
  };
  
  const handleCancelClick = () => {
    setIsCreating(false);
    setEditingServiceId(null);
  };
  
  const handleDeleteClick = async (serviceId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este serviço?')) {
      await deleteService(serviceId);
    }
  };
  
  const onSubmit = async (data: ServiceFormValues) => {
    try {
      if (isCreating) {
        await createService(data);
        setIsCreating(false);
      } else if (editingServiceId) {
        await updateService({
          id: editingServiceId,
          ...data,
        });
        setEditingServiceId(null);
      }
      reset();
    } catch (error) {
      console.error('Error saving service:', error);
    }
  };
  
  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Serviços</h1>
          <p className="text-gray-600 mt-1">
            Gerencie os serviços oferecidos pela sua barbearia.
          </p>
        </div>
        {!isCreating && !editingServiceId && (
          <Button
            onClick={handleCreateClick}
            variant="primary"
            className="flex items-center"
          >
            <Plus size={18} className="mr-1.5" />
            Novo Serviço
          </Button>
        )}
      </div>
      
      {(isCreating || editingServiceId) && (
        <div className="bg-white shadow rounded-lg p-6 mb-6 animate-slide-up">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              {isCreating ? 'Novo Serviço' : 'Editar Serviço'}
            </h2>
            <button
              onClick={handleCancelClick}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Nome do Serviço"
              placeholder="Ex: Corte de Cabelo"
              error={errors.name?.message}
              {...register('name', { required: 'Nome é obrigatório' })}
            />
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Duração (minutos)"
                type="number"
                placeholder="30"
                icon={<Clock size={18} />}
                error={errors.duration?.message}
                {...register('duration', { 
                  required: 'Duração é obrigatória',
                  valueAsNumber: true,
                  min: {
                    value: 5,
                    message: 'Mínimo de 5 minutos'
                  },
                  max: {
                    value: 240,
                    message: 'Máximo de 240 minutos'
                  }
                })}
              />
              
              <Input
                label="Preço (R$)"
                type="number"
                step="0.01"
                placeholder="50.00"
                icon={<DollarSign size={18} />}
                error={errors.price?.message}
                {...register('price', { 
                  required: 'Preço é obrigatório',
                  valueAsNumber: true,
                  min: {
                    value: 0,
                    message: 'Preço não pode ser negativo'
                  }
                })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição (opcional)
              </label>
              <textarea
                className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                rows={3}
                placeholder="Detalhes adicionais sobre o serviço..."
                {...register('description')}
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelClick}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
              >
                {isLoading ? 'Salvando...' : 'Salvar Serviço'}
              </Button>
            </div>
          </form>
        </div>
      )}
      
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {services.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {services.map((service) => (
              <li key={service.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="min-w-0 flex-1">
                        <p className="text-base font-medium text-primary-700 truncate">
                          {service.name}
                        </p>
                        <div className="mt-1 flex text-sm text-gray-500">
                          <span className="flex items-center mr-4">
                            <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            {service.duration} min
                          </span>
                          <span className="flex items-center">
                            <DollarSign className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            R$ {service.price.toFixed(2)}
                          </span>
                        </div>
                        {service.description && (
                          <p className="mt-1 text-sm text-gray-500 line-clamp-1">
                            {service.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditClick(service)}
                        className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-gray-500 hover:bg-gray-100 focus:outline-none"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(service.id)}
                        className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-gray-500 hover:bg-red-100 hover:text-red-500 focus:outline-none"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="py-12 text-center">
            <ShoppingBag className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Nenhum serviço cadastrado
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Comece criando um novo serviço para sua barbearia.
            </p>
            <div className="mt-6">
              <Button variant="primary" onClick={handleCreateClick}>
                <Plus size={18} className="mr-1.5" />
                Adicionar Serviço
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesPage;