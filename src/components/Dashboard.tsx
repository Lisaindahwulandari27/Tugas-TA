
import React from 'react';
import { Package, Calculator, TrendingUp, DollarSign, Loader2 } from 'lucide-react';
import { useIngredients } from '../contexts/IngredientContext';

interface DashboardProps {
  setActiveTab: (tab: string) => void;
}

const Dashboard = ({ setActiveTab }: DashboardProps) => {
  const { ingredients, usageHistory, loading } = useIngredients();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        <span className="ml-2 text-gray-600">Memuat data dashboard...</span>
      </div>
    );
  }

  const totalIngredients = ingredients.length;
  const totalPortionsToday = usageHistory.length > 0 ? usageHistory[0].portions : 0;
  const avgCostPerPortion = usageHistory.length > 0 
    ? usageHistory[0].totalCost / usageHistory[0].portions 
    : 0;
  const totalRevenue = usageHistory.reduce((sum, record) => sum + record.totalCost, 0);

  const stats = [
    {
      title: 'Total Bahan Baku',
      value: totalIngredients,
      icon: Package,
      color: 'bg-blue-500',
      change: `${totalIngredients} jenis bahan`
    },
    {
      title: 'Porsi Terbaru',
      value: totalPortionsToday,
      icon: Calculator,
      color: 'bg-green-500',
      change: 'Produksi terakhir'
    },
    {
      title: 'Rata-rata Biaya/Porsi',
      value: `Rp ${Math.round(avgCostPerPortion).toLocaleString('id-ID')}`,
      icon: DollarSign,
      color: 'bg-orange-500',
      change: 'Per porsi bakso'
    },
    {
      title: 'Total Biaya Produksi',
      value: `Rp ${totalRevenue.toLocaleString('id-ID')}`,
      icon: TrendingUp,
      color: 'bg-purple-500',
      change: 'Riwayat produksi'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Selamat Datang di Bakso Adzkia</h2>
        <p className="text-lg text-gray-600">Kelola bahan baku dan optimalkan porsi dengan efisien</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const isClickable = stat.title === 'Total Bahan Baku';
          return (
            <div 
              key={index} 
              className={`bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300 ${
                isClickable ? 'cursor-pointer hover:scale-105 transition-transform' : ''
              }`}
              onClick={isClickable ? () => setActiveTab('ingredients') : undefined}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</h3>
              <p className="text-gray-600 text-sm mb-2">{stat.title}</p>
              <p className="text-xs text-green-600 font-medium">{stat.change}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Aktivitas Terbaru</h3>
          <div className="space-y-4">
            {usageHistory.slice(0, 3).map((record) => (
              <div key={record.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{record.portions} porsi diproduksi</p>
                  <p className="text-sm text-gray-600">{new Date(record.date).toLocaleDateString('id-ID')}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-orange-600">Rp {record.totalCost.toLocaleString('id-ID')}</p>
                  <p className="text-xs text-gray-500">Total Biaya</p>
                </div>
              </div>
            ))}
            {usageHistory.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                Belum ada riwayat produksi
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Bahan Baku Termahal</h3>
          <div className="space-y-4">
            {ingredients
              .sort((a, b) => (b.costPerUnit * b.amountPerPortion) - (a.costPerUnit * a.amountPerPortion))
              .slice(0, 4)
              .map((ingredient) => (
                <div key={ingredient.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{ingredient.name}</p>
                    <p className="text-sm text-gray-600">{ingredient.amountPerPortion} {ingredient.unit} per porsi</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">
                      Rp {(ingredient.costPerUnit * ingredient.amountPerPortion).toLocaleString('id-ID')}
                    </p>
                    <p className="text-xs text-gray-500">per porsi</p>
                  </div>
                </div>
              ))}
            {ingredients.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                Belum ada data bahan baku
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
