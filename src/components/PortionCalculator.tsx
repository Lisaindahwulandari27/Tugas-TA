
import React, { useState } from 'react';
import { Calculator, Save, Download } from 'lucide-react';
import { useIngredients } from '../contexts/IngredientContext';

const PortionCalculator = () => {
  const { ingredients, addUsageRecord } = useIngredients();
  const [portions, setPortions] = useState<number>(1);
  const [calculations, setCalculations] = useState<Array<{
    ingredient: any;
    requiredAmount: number;
    cost: number;
  }>>([]);

  const calculateRequirements = () => {
    const results = ingredients.map(ingredient => ({
      ingredient,
      requiredAmount: ingredient.amountPerPortion * portions,
      cost: ingredient.costPerUnit * ingredient.amountPerPortion * portions
    }));
    setCalculations(results);
  };

  const getTotalCost = () => {
    return calculations.reduce((sum, calc) => sum + calc.cost, 0);
  };

  const saveCalculation = () => {
    if (calculations.length === 0) return;

    const usageRecord = {
      date: new Date().toISOString().split('T')[0],
      portions,
      ingredients: calculations.map(calc => ({
        ingredientId: calc.ingredient.id,
        amount: calc.requiredAmount,
        cost: calc.cost
      })),
      totalCost: getTotalCost()
    };

    addUsageRecord(usageRecord);
    
    // Show success message (you can implement toast notifications)
    alert('Calculation saved successfully!');
  };

  const exportCalculation = () => {
    if (calculations.length === 0) return;

    const csvContent = [
      ['Ingredient', 'Required Amount', 'Unit', 'Cost per Unit', 'Total Cost'],
      ...calculations.map(calc => [
        calc.ingredient.name,
        calc.requiredAmount,
        calc.ingredient.unit,
        calc.ingredient.costPerUnit,
        calc.cost
      ]),
      ['', '', '', 'TOTAL:', getTotalCost()]
    ];

    const csvString = csvContent.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bakso-calculation-${portions}-portions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Portion Calculator</h2>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Portions
            </label>
            <input
              type="number"
              min="1"
              value={portions}
              onChange={(e) => setPortions(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Enter number of portions"
            />
          </div>
          <div>
            <button
              onClick={calculateRequirements}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors duration-200"
            >
              <Calculator className="h-5 w-5" />
              <span>Calculate Requirements</span>
            </button>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={saveCalculation}
              disabled={calculations.length === 0}
              className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors duration-200"
            >
              <Save className="h-5 w-5" />
              <span>Save</span>
            </button>
            <button
              onClick={exportCalculation}
              disabled={calculations.length === 0}
              className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors duration-200"
            >
              <Download className="h-5 w-5" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {calculations.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-orange-50 border-b">
            <h3 className="text-lg font-semibold text-gray-800">
              Requirements for {portions} Portion{portions > 1 ? 's' : ''}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ingredient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Required Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost per Unit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Cost</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {calculations.map((calc, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {calc.ingredient.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {calc.ingredient.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {calc.requiredAmount} {calc.ingredient.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Rp {calc.ingredient.costPerUnit.toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      Rp {calc.cost.toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-orange-50">
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-right text-lg font-bold text-gray-800">
                    Total Cost:
                  </td>
                  <td className="px-6 py-4 text-lg font-bold text-orange-600">
                    Rp {getTotalCost().toLocaleString('id-ID')}
                  </td>
                </tr>
                <tr>
                  <td colSpan={4} className="px-6 py-2 text-right text-sm font-medium text-gray-600">
                    Cost per Portion:
                  </td>
                  <td className="px-6 py-2 text-sm font-medium text-orange-600">
                    Rp {(getTotalCost() / portions).toLocaleString('id-ID')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortionCalculator;
