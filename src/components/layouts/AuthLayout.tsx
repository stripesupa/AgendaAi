import { Outlet } from 'react-router-dom';
import { Scissors } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex flex-col">
      <header className="py-6 px-4 sm:px-6 lg:px-8 flex justify-center">
        <div className="flex items-center">
          <Scissors className="h-8 w-8 text-primary-600 mr-2" />
          <h1 className="text-2xl font-bold text-primary-900">AgendaFull</h1>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white py-8 px-6 shadow-lg rounded-xl sm:px-10 animate-fade-in">
            <Outlet />
          </div>
        </div>
      </main>

      <footer className="py-4 px-4 sm:px-6 lg:px-8 border-t border-gray-200 bg-white">
        <div className="text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} AgendaFull. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout;