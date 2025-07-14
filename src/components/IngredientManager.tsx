
import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, Loader2 } from 'lucide-react';
import { useIngredients, Ingredient } from '../contexts/IngredientContext';
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const IngredientManager = () => {
  const { ingredients, addIngredient, updateIngredient, deleteIngredient, loading } = useIngredients();
  const { toast } = useToast();
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    unit: '',
    costPerUnit: 0,
    amountPerPortion: 0,
    category: 'Bahan Pentol/Bakso'
  });

  const categories = ['Bahan Pentol/Bakso', 'Bahan Kuah', 'Pelengkap', 'Bumbu'];
  const units = ['gram', 'ml', 'buah', 'kg', 'liter', 'sdm', 'sdt'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingId) {
        await updateIngredient(editingId, formData);
        setEditingId(null);
        toast({
          title: "Berhasil",
          description: "Bahan baku berhasil diperbarui",
        });
      } else {
        await addIngredient(formData);
        setIsAddingNew(false);
        toast({
          title: "Berhasil",
          description: "Bahan baku berhasil ditambahkan",
        });
      }
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyimpan bahan baku",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      unit: '',
      costPerUnit: 0,
      amountPerPortion: 0,
      category: 'Bahan Pentol/Bakso'
    });
  };

  const startEdit = (ingredient: Ingredient) => {
    setFormData({
      name: ingredient.name,
      unit: ingredient.unit,
      costPerUnit: ingredient.costPerUnit,
      amountPerPortion: ingredient.amountPerPortion,
      category: ingredient.category
    });
    setEditingId(ingredient.id);
    setIsAddingNew(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAddingNew(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus bahan baku ini?')) {
      try {
        await deleteIngredient(id);
        toast({
          title: "Berhasil",
          description: "Bahan baku berhasil dihapus",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Gagal menghapus bahan baku",
          variant: "destructive",
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        <span className="ml-2 text-gray-600">Memuat data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Manajemen Bahan Baku</h2>
        <button
          onClick={() => setIsAddingNew(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
        >
          <Plus className="h-5 w-5" />
          <span>Tambah Bahan Baku</span>
        </button>
      </div>

      {(isAddingNew || editingId) && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {editingId ? 'Edit Bahan Baku' : 'Tambah Bahan Baku Baru'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Nama bahan baku"
                disabled={submitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Satuan</label>
              <select
                required
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                disabled={submitting}
              >
                <option value="">Pilih satuan</option>
                {units.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                disabled={submitting}
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Harga per Satuan (Rp)</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.costPerUnit}
                onChange={(e) => setFormData({ ...formData, costPerUnit: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="0"
                disabled={submitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah per Porsi</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.amountPerPortion}
                onChange={(e) => setFormData({ ...formData, amountPerPortion: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="0"
                disabled={submitting}
              />
            </div>
            <div className="flex items-end space-x-2">
              <button
                type="submit"
                disabled={submitting}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>{submitting ? 'Menyimpan...' : 'Simpan'}</span>
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                disabled={submitting}
                className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
              >
                <X className="h-4 w-4" />
                <span>Batal</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {ingredients.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">Belum ada data bahan baku.</p>
          <p>Tambahkan bahan baku pertama Anda!</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Satuan</TableHead>
                <TableHead>Harga per Satuan</TableHead>
                <TableHead>Jumlah per Porsi</TableHead>
                <TableHead>Biaya per Porsi</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ingredients.map((ingredient) => (
                <TableRow key={ingredient.id}>
                  <TableCell className="font-medium">{ingredient.name}</TableCell>
                  <TableCell>{ingredient.category}</TableCell>
                  <TableCell>{ingredient.unit}</TableCell>
                  <TableCell>Rp {ingredient.costPerUnit.toLocaleString('id-ID')}</TableCell>
                  <TableCell>{ingredient.amountPerPortion}</TableCell>
                  <TableCell>Rp {(ingredient.costPerUnit * ingredient.amountPerPortion).toLocaleString('id-ID')}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEdit(ingredient)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        disabled={submitting}
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(ingredient.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        disabled={submitting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default IngredientManager;
