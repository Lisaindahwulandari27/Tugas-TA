
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Header from '../components/Header';
import Dashboard from '../components/Dashboard';
import IngredientManager from '../components/IngredientManager';
import PortionCalculator from '../components/PortionCalculator';
import Analytics from '../components/Analytics';
import { IngredientProvider } from '../contexts/IngredientContext';

const Index = () => {
  const [activeTab, setActiveTab] = React.useState('dashboard');

  return (
    <IngredientProvider>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="container mx-auto px-4 py-8">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'ingredients' && <IngredientManager />}
          {activeTab === 'calculator' && <PortionCalculator />}
          {activeTab === 'analytics' && <Analytics />}
        </main>
      </div>
    </IngredientProvider>
  );
};

export default Index;
