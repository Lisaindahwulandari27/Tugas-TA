
import React from 'react';
import { Package, Calculator, LogOut, User, Receipt } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Header = ({ activeTab, setActiveTab }: HeaderProps) => {
  const { user, logout } = useAuth();

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Package },
    { id: 'transactions', label: 'Transaksi', icon: Receipt },
    { id: 'ingredients', label: 'Bahan Baku', icon: Package },
    { id: 'calculator', label: 'Kalkulator', icon: Calculator },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white shadow-lg border-b-4 border-orange-400">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-3">
            <div className="bg-white p-2 rounded-full">
              <img 
                src="/lovable-uploads/6e27bd9a-935f-4cf1-8d6e-8dcf94eb77e3.png" 
                alt="Warung Bakso Adzkia Logo" 
                className="h-12 w-auto"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Warung Bakso Adzkia</h1>
              <p className="text-sm text-gray-600">Sistem Manajemen Porsi</p>
            </div>
          </div>
          
          {user && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-orange-50 px-3 py-2 rounded-lg">
                <User className="h-4 w-4 text-orange-600" />
                <div className="text-sm">
                  <p className="font-medium text-gray-800">{user.name}</p>
                  <p className="text-xs text-gray-600 capitalize">{user.role}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Keluar
              </Button>
            </div>
          )}
        </div>
        <nav className="flex space-x-1 pb-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-orange-100 hover:text-orange-700'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export default Header;
