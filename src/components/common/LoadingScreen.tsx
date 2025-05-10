import React from 'react';
import { Scissors } from 'lucide-react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-primary-50 flex flex-col items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="animate-spin mb-4">
          <Scissors size={48} className="text-primary-600" />
        </div>
        <h1 className="text-2xl font-semibold text-primary-800 mb-2">AgendaFull</h1>
        <p className="text-primary-500">Carregando...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;