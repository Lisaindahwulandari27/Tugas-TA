
import React from 'react';
import Header from '../components/Header';
import Dashboard from '../components/Dashboard';
import IngredientManager from '../components/IngredientManager';
import PortionCalculator from '../components/PortionCalculator';
import Analytics from '../components/Analytics';
import LoginForm from '../components/LoginForm';
import { IngredientProvider } from '../contexts/IngredientContext';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

const AppContent = () => {
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const { user, login, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginForm onLoginSuccess={login} />;
  }

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

const Index = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default Index;
