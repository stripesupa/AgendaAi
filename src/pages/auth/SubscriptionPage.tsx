import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Scissors } from 'lucide-react';
import Button from '../../components/common/Button';
import { useAppStore } from '../../store';

const SubscriptionPage = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAppStore();
  const navigate = useNavigate();
  
  const handleCheckout = async () => {
    setLoading(true);
    
    // In a real implementation, this would redirect to Stripe checkout
    // For demonstration, we'll simulate a successful payment after a delay
    setTimeout(() => {
      setLoading(false);
      navigate('/dashboard');
    }, 2000);
  };
  
  // Check if user has an active subscription or is in trial
  const hasActiveSubscription = user?.subscription_status === 'active';
  const isInTrial = user?.subscription_status === 'trial';
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Escolha seu plano</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Comece a receber agendamentos online para sua barbearia hoje mesmo.
        </p>
      </div>
      
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-primary-600 px-6 py-12 text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-white mb-4">
            <Scissors className="h-8 w-8 text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Plano Profissional</h2>
          <div className="flex items-baseline justify-center">
            <span className="text-5xl font-extrabold text-white tracking-tight">R$59</span>
            <span className="text-xl text-primary-100 font-medium">/mês</span>
          </div>
        </div>
        
        <div className="px-6 py-8">
          <ul className="space-y-4">
            {[
              'Agendamento online 24/7',
              'Página personalizada para sua barbearia',
              'Gestão de serviços ilimitados',
              'Controle de horários de atendimento',
              'Notificações por email',
              'Suporte prioritário',
            ].map((feature) => (
              <li key={feature} className="flex items-start">
                <div className="flex-shrink-0">
                  <Check className="h-6 w-6 text-green-500" />
                </div>
                <p className="ml-3 text-base text-gray-700">{feature}</p>
              </li>
            ))}
          </ul>
          
          <div className="mt-8">
            {hasActiveSubscription ? (
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-green-800 font-medium">
                  Você já possui uma assinatura ativa! 🎉
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  className="mt-4"
                  onClick={() => navigate('/dashboard')}
                >
                  Ir para o Dashboard
                </Button>
              </div>
            ) : isInTrial ? (
              <div className="text-center space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg mb-4">
                  <p className="text-blue-800">
                    Você está no período de teste gratuito.
                    Assine agora para continuar usando todos os recursos.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleCheckout}
                  disabled={loading}
                >
                  {loading ? 'Processando...' : 'Assinar Agora'}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  fullWidth
                  onClick={() => navigate('/dashboard')}
                >
                  Continuar no período de teste
                </Button>
              </div>
            ) : (
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleCheckout}
                disabled={loading}
              >
                {loading ? 'Processando...' : 'Assinar R$59/mês'}
              </Button>
            )}
          </div>
          
          <div className="mt-6 text-center text-sm text-gray-500">
            Sem compromisso. Cancele a qualquer momento.
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;