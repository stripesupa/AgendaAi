import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, Store, Link as LinkIcon } from 'lucide-react';
import { useAppStore } from '../../store';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

interface RegisterFormValues {
  email: string;
  password: string;
  shopName: string;
  shopSlug: string;
}

const RegisterPage = () => {
  const [error, setError] = useState<string | null>(null);
  const { signUp, isLoading } = useAppStore();
  const navigate = useNavigate();
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<RegisterFormValues>();
  
  const shopName = watch('shopName', '');
  
  // Generate slug from shop name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-');
  };
  
  // Update shop slug when shop name changes
  const handleShopNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setValue('shopName', name);
    setValue('shopSlug', generateSlug(name));
  };
  
  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setError(null);
      await signUp(data.email, data.password, data.shopName, data.shopSlug);
      navigate('/subscription');
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao criar sua conta. Tente novamente.');
    }
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
        Criar sua conta
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Nome da Barbearia"
          placeholder="Barbearia Exemplo"
          icon={<Store size={18} />}
          error={errors.shopName?.message}
          {...register('shopName', { 
            required: 'Nome da barbearia é obrigatório',
            onChange: handleShopNameChange
          })}
        />
        
        <Input
          label="Link da Barbearia"
          placeholder="barbearia-exemplo"
          icon={<LinkIcon size={18} />}
          error={errors.shopSlug?.message}
          {...register('shopSlug', { 
            required: 'Link é obrigatório',
            pattern: {
              value: /^[a-z0-9-]+$/,
              message: 'Link deve conter apenas letras minúsculas, números e hífens'
            }
          })}
          helperText={<span className="text-xs text-gray-500 mt-1 block">agendafull.com/<span className="font-medium">{watch('shopSlug') || 'sua-barbearia'}</span></span>}
        />
        
        <Input
          label="Email"
          type="email"
          placeholder="seunome@exemplo.com"
          icon={<Mail size={18} />}
          error={errors.email?.message}
          {...register('email', { 
            required: 'Email é obrigatório',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Email inválido'
            }
          })}
        />
        
        <Input
          label="Senha"
          type="password"
          placeholder="••••••••"
          icon={<Lock size={18} />}
          error={errors.password?.message}
          {...register('password', { 
            required: 'Senha é obrigatória',
            minLength: {
              value: 6,
              message: 'A senha deve ter pelo menos 6 caracteres'
            }
          })}
        />
        
        <div className="pt-2">
          <Button 
            type="submit" 
            variant="primary" 
            size="lg" 
            fullWidth
            disabled={isLoading}
          >
            {isLoading ? 'Criando conta...' : 'Criar conta'}
          </Button>
        </div>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Já tem uma conta?{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
            Faça login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;