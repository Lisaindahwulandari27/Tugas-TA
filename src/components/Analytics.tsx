import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useIngredients } from '../contexts/IngredientContext';

const Analytics = () => {
  const { ingredients, usageHistory } = useIngredients();

  // Prepare data for cost per ingredient chart
  const ingredientCostData = ingredients.map(ingredient => ({
    name: ingredient.name,
    costPerPortion: ingredient.costPerUnit * ingredient.amountPerPortion,
    category: ingredient.category
  })).sort((a, b) => b.costPerPortion - a.costPerPortion);

  // Prepare data for category distribution
  const categoryData = ingredients.reduce((acc, ingredient) => {
    const cost = ingredient.costPerUnit * ingredient.amountPerPortion;
    const existing = acc.find(item => item.name === ingredient.category);
    if (existing) {
      existing.value += cost;
    } else {
      acc.push({ name: ingredient.category, value: cost });
    }
    return acc;
  }, [] as Array<{ name: string; value: number }>);

  // Prepare data for usage history
  const usageData = usageHistory.slice().reverse().map(record => ({
    date: new Date(record.date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' }),
    portions: record.portions,
    totalCost: record.totalCost,
    costPerPortion: record.totalCost / record.portions
  }));

  const COLORS = ['#f97316', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'];

  const getMostExpensiveIngredients = () => {
    return ingredients
      .sort((a, b) => (b.costPerUnit * b.amountPerPortion) - (a.costPerUnit * a.amountPerPortion))
      .slice(0, 3);
  };

  const getLeastExpensiveIngredients = () => {
    return ingredients
      .sort((a, b) => (a.costPerUnit * a.amountPerPortion) - (b.costPerUnit * b.amountPerPortion))
      .slice(0, 3);
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">Analytics & Insights</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Cost Efficiency Insights */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Cost Efficiency Insights</h3>
          
          <div className="space-y-4">
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-medium text-red-800 mb-2">Most Expensive Ingredients</h4>
              <div className="space-y-2">
                {getMostExpensiveIngredients().map((ingredient, index) => (
                  <div key={ingredient.id} className="flex justify-between text-sm">
                    <span className="text-red-700">{ingredient.name}</span>
                    <span className="font-medium text-red-800">
                      Rp {(ingredient.costPerUnit * ingredient.amountPerPortion).toLocaleString('id-ID')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Most Cost-Effective Ingredients</h4>
              <div className="space-y-2">
                {getLeastExpensiveIngredients().map((ingredient, index) => (
                  <div key={ingredient.id} className="flex justify-between text-sm">
                    <span className="text-green-700">{ingredient.name}</span>
                    <span className="font-medium text-green-800">
                      Rp {(ingredient.costPerUnit * ingredient.amountPerPortion).toLocaleString('id-ID')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Cost Distribution by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `Rp ${Number(value).toLocaleString('id-ID')}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Ingredient Cost Comparison */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Cost per Portion by Ingredient</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={ingredientCostData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={100}
              fontSize={12}
            />
            <YAxis tickFormatter={(value) => `Rp ${value.toLocaleString('id-ID')}`} />
            <Tooltip formatter={(value) => [`Rp ${Number(value).toLocaleString('id-ID')}`, 'Cost per Portion']} />
            <Bar dataKey="costPerPortion" fill="#f97316" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Usage History Trends */}
      {usageData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Production Volume Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="portions" stroke="#f97316" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Cost per Portion Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => `Rp ${value.toLocaleString('id-ID')}`} />
                <Tooltip formatter={(value) => [`Rp ${Number(value).toLocaleString('id-ID')}`, 'Cost per Portion']} />
                <Line type="monotone" dataKey="costPerPortion" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
