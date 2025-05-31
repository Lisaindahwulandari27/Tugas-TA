
import React, { useState } from 'react';
import { Calculator, Save, Download, Loader2 } from 'lucide-react';
import { useIngredients } from '../contexts/IngredientContext';
import { useToast } from "@/hooks/use-toast";

const PortionCalculator = () => {
  const { ingredients, addUsageRecord, loading } = useIngredients();
  const { toast } = useToast();
  const [portions, setPortions] = useState<number>(1);
  const [calculations, setCalculations] = useState<Array<{
    ingredient: any;
    requiredAmount: number;
    cost: number;
  }>>([]);
  const [saving, setSaving] = useState(false);

  const calculateRequirements = () => {
    const results = ingredients.map(ingredient => ({
      ingredient,
      requiredAmount: ingredient.amountPerPortion * portions,
      cost: ingredient.costPerUnit * ingredient.amountPerPortion * portions
    }));
    setCalculations(results);
    toast({
      title: "Perhitungan Selesai",
      description: `Kebutuhan untuk ${portions} porsi berhasil dihitung`,
    });
  };

  const getTotalCost = () => {
    return calculations.reduce((sum, calc) => sum + calc.cost, 0);
  };

  const saveCalculation = async () => {
    if (calculations.length === 0) return;

    setSaving(true);
    try {
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

      await addUsageRecord(usageRecord);
      
      toast({
        title: "Berhasil Disimpan",
        description: "Perhitungan berhasil disimpan ke riwayat produksi",
      });
    } catch (error) {
      toast({
        title: "Gagal Menyimpan",
        description: "Terjadi kesalahan saat menyimpan perhitungan",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const exportCalculation = () => {
    if (calculations.length === 0) return;

    const csvContent = [
      ['Bahan Baku', 'Jumlah Diperlukan', 'Satuan', 'Harga per Satuan', 'Total Biaya'],
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
    a.download = `perhitungan-bakso-${portions}-porsi-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "File Berhasil Diunduh",
      description: "Data perhitungan telah diunduh dalam format CSV",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        <span className="ml-2 text-gray-600">Memuat data bahan baku...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Kalkulator Porsi</h2>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jumlah Porsi
            </label>
            <input
              type="number"
              min="1"
              value={portions}
              onChange={(e) => setPortions(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Masukkan jumlah porsi"
            />
          </div>
          <div>
            <button
              onClick={calculateRequirements}
              disabled={ingredients.length === 0}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors duration-200"
            >
              <Calculator className="h-5 w-5" />
              <span>Hitung Kebutuhan</span>
            </button>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={saveCalculation}
              disabled={calculations.length === 0 || saving}
              className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors duration-200"
            >
              {saving ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Save className="h-5 w-5" />
              )}
              <span>{saving ? 'Menyimpan...' : 'Simpan'}</span>
            </button>
            <button
              onClick={exportCalculation}
              disabled={calculations.length === 0}
              className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors duration-200"
            >
              <Download className="h-5 w-5" />
              <span>Ekspor</span>
            </button>
          </div>
        </div>
      </div>

      {ingredients.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            Belum ada data bahan baku. Silakan tambahkan bahan baku terlebih dahulu di menu Manajemen Bahan Baku.
          </p>
        </div>
      )}

      {calculations.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-orange-50 border-b">
            <h3 className="text-lg font-semibold text-gray-800">
              Kebutuhan untuk {portions} Porsi
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bahan Baku</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah Diperlukan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga per Satuan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Biaya</th>
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
                    Total Biaya:
                  </td>
                  <td className="px-6 py-4 text-lg font-bold text-orange-600">
                    Rp {getTotalCost().toLocaleString('id-ID')}
                  </td>
                </tr>
                <tr>
                  <td colSpan={4} className="px-6 py-2 text-right text-sm font-medium text-gray-600">
                    Biaya per Porsi:
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
