import { Outlet } from 'react-router-dom';
import { Scissors } from 'lucide-react';

const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex flex-col">
      <header className="py-4 px-4 sm:px-6 lg:px-8 flex justify-center">
        <div className="flex items-center">
          <Scissors className="h-6 w-6 text-primary-600 mr-2" />
          <h1 className="text-xl font-bold text-primary-900">AgendaFull</h1>
        </div>
      </header>

      <main className="flex-grow flex flex-col py-6">
        <Outlet />
      </main>

      <footer className="py-4 px-4 sm:px-6 lg:px-8 border-t border-gray-200 bg-white">
        <div className="text-center text-sm text-gray-500">
          Agendamento online por <span className="font-medium">AgendaFull</span>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;