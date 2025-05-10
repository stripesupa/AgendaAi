import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store';
import { 
  Scissors, 
  LayoutDashboard, 
  CalendarDays, 
  Clock, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  ShoppingBag 
} from 'lucide-react';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, signOut } = useAppStore();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { to: '/appointments', label: 'Agendamentos', icon: <CalendarDays size={20} /> },
    { to: '/services', label: 'Serviços', icon: <ShoppingBag size={20} /> },
    { to: '/working-hours', label: 'Horários', icon: <Clock size={20} /> },
  ];

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Mobile sidebar */}
      <div 
        className={`fixed inset-0 bg-gray-600 bg-opacity-75 z-40 transition-opacity ease-linear duration-300 ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleSidebar}
      />

      <div
        className={`fixed inset-y-0 left-0 flex flex-col z-50 max-w-xs w-full bg-white transform transition duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:static md:z-auto`}
      >
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <div className="flex items-center">
            <Scissors className="h-6 w-6 text-primary-600" />
            <span className="ml-2 text-xl font-semibold text-primary-900">AgendaFull</span>
          </div>
          <button
            className="ml-auto -mr-2 md:hidden"
            onClick={toggleSidebar}
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-2 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-700 font-semibold text-sm">
                  {user?.shop_name.substring(0, 2).toUpperCase()}
                </span>
              </div>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.shop_name}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="ml-auto flex items-center justify-center h-8 w-8 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center">
          <div className="px-4 md:px-6 flex items-center justify-between w-full">
            <button
              className="md:hidden"
              onClick={toggleSidebar}
            >
              <Menu size={24} className="text-gray-500" />
            </button>
            <div className="flex-1 md:ml-4">
              <h1 className="text-lg font-semibold text-gray-900">
                {navItems.find(item => location.pathname.startsWith(item.to))?.label || 'Dashboard'}
              </h1>
            </div>
            <div className="hidden md:flex items-center">
              <button
                className="ml-4 flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 text-gray-500 hover:text-gray-700 hover:bg-gray-200"
              >
                <Settings size={18} />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;