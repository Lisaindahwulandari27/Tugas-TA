
import React, { useMemo } from 'react';
import { useIngredients } from '../contexts/IngredientContext';
import { AprioriAnalysis, Transaction } from '../utils/aprioriAlgorithm';
import { TrendingUp, ArrowRight, Target, Zap } from 'lucide-react';

const AprioriAnalysisComponent = () => {
  const { usageHistory, ingredients } = useIngredients();

  const { frequentItemsets, associationRules, transactions } = useMemo(() => {
    // Konversi usage history menjadi transactions
    const transactions: Transaction[] = usageHistory.map(record => ({
      id: record.id,
      items: record.ingredients.map(ing => {
        const ingredient = ingredients.find(i => i.id === ing.ingredientId);
        return ingredient ? ingredient.name : 'Unknown';
      }).filter(name => name !== 'Unknown')
    }));

    if (transactions.length < 2) {
      return { frequentItemsets: [], associationRules: [], transactions: [] };
    }

    const apriori = new AprioriAnalysis(transactions, 0.4, 0.6);
    const frequentItemsets = apriori.getFrequentItemsets();
    const associationRules = apriori.getAssociationRules();

    return { frequentItemsets, associationRules, transactions };
  }, [usageHistory, ingredients]);

  if (transactions.length < 2) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-orange-500" />
          Analisis Apriori - Asosiasi Bahan Baku
        </h3>
        <div className="text-center py-8">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            Diperlukan minimal 2 catatan penggunaan untuk melakukan analisis asosiasi.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Gunakan kalkulator porsi untuk membuat lebih banyak data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-orange-500" />
          Analisis Apriori - Asosiasi Bahan Baku
        </h3>
        <p className="text-sm text-gray-600">
          Analisis pola penggunaan bahan baku yang sering muncul bersamaan untuk optimasi inventori.
        </p>
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-lg font-bold text-blue-600">{transactions.length}</p>
            <p className="text-xs text-blue-700">Total Transaksi</p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-lg font-bold text-green-600">{frequentItemsets.length}</p>
            <p className="text-xs text-green-700">Frequent Itemsets</p>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <p className="text-lg font-bold text-purple-600">{associationRules.length}</p>
            <p className="text-xs text-purple-700">Aturan Asosiasi</p>
          </div>
        </div>
      </div>

      {/* Frequent Itemsets */}
      {frequentItemsets.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
            <Zap className="h-5 w-5 mr-2 text-green-500" />
            Kombinasi Bahan Baku yang Sering Digunakan
          </h4>
          <div className="space-y-3">
            {frequentItemsets.slice(0, 8).map((itemset, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2">
                    {itemset.items.map((item, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        {item}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {itemset.items.length} bahan baku
                  </p>
                </div>
                <div className="text-right ml-4">
                  <p className="font-bold text-green-600">{(itemset.support * 100).toFixed(1)}%</p>
                  <p className="text-xs text-gray-500">Support</p>
                  <p className="text-xs text-gray-400">{itemset.count} kali</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Association Rules */}
      {associationRules.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
            <ArrowRight className="h-5 w-5 mr-2 text-purple-500" />
            Aturan Asosiasi Bahan Baku
          </h4>
          <div className="space-y-4">
            {associationRules.slice(0, 6).map((rule, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="flex flex-wrap gap-1">
                      {rule.antecedent.map((item, idx) => (
                        <span key={idx} className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded">
                          {item}
                        </span>
                      ))}
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                    <div className="flex flex-wrap gap-1">
                      {rule.consequent.map((item, idx) => (
                        <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Confidence:</span>
                    <span className="ml-1 font-medium text-blue-600">{(rule.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Lift:</span>
                    <span className="ml-1 font-medium text-purple-600">{rule.lift.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Support:</span>
                    <span className="ml-1 font-medium text-green-600">{(rule.support * 100).toFixed(1)}%</span>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Jika menggunakan {rule.antecedent.join(', ')}, maka {(rule.confidence * 100).toFixed(1)}% kemungkinan juga menggunakan {rule.consequent.join(', ')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl shadow-lg p-6 border border-orange-200">
        <h4 className="text-md font-semibold text-gray-800 mb-3">💡 Wawasan Apriori</h4>
        <div className="space-y-2 text-sm">
          {frequentItemsets.length > 0 && (
            <p className="text-gray-700">
              • <strong>Kombinasi terpopuler:</strong> {frequentItemsets[0]?.items.join(' + ')} 
              (muncul dalam {(frequentItemsets[0]?.support * 100).toFixed(1)}% transaksi)
            </p>
          )}
          {associationRules.length > 0 && (
            <p className="text-gray-700">
              • <strong>Aturan terkuat:</strong> {associationRules[0]?.antecedent.join(', ')} → {associationRules[0]?.consequent.join(', ')} 
              (confidence: {(associationRules[0]?.confidence * 100).toFixed(1)}%)
            </p>
          )}
          <p className="text-gray-700">
            • Gunakan informasi ini untuk perencanaan inventori dan bundling bahan baku yang efisien.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AprioriAnalysisComponent;
