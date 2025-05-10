import { Link } from 'react-router-dom';
import { Scissors } from 'lucide-react';
import Button from '../components/common/Button';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 text-center">
          <div className="flex justify-center mb-4">
            <Scissors className="h-12 w-12 text-primary-600 transform rotate-45" />
          </div>
          
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
            Página não encontrada
          </h2>
          
          <p className="text-gray-600 mb-6">
            A página que você está procurando não existe ou foi removida.
          </p>
          
          <div className="flex flex-col space-y-3">
            <Link to="/">
              <Button variant="primary" fullWidth>
                Voltar para a página inicial
              </Button>
            </Link>
            
            <Link to="/login">
              <Button variant="outline" fullWidth>
                Fazer Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;