
import React from 'react';
import { ChefHat, Package, Calculator, BarChart3 } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Header = ({ activeTab, setActiveTab }: HeaderProps) => {
  const tabs = [
    { id: 'dashboard', label: 'Dasbor', icon: ChefHat },
    { id: 'ingredients', label: 'Bahan Baku', icon: Package },
    { id: 'calculator', label: 'Kalkulator', icon: Calculator },
    { id: 'analytics', label: 'Analitik', icon: BarChart3 },
  ];

  return (
    <header className="bg-white shadow-lg border-b-4 border-orange-400">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-3 rounded-full">
              <ChefHat className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Bakso Adzkia</h1>
              <p className="text-sm text-gray-600">Sistem Manajemen Porsi</p>
            </div>
          </div>
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
