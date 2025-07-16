import React from 'react';
import { Button } from '@/components/ui/button';
import { useIngredients } from '@/contexts/IngredientContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export const BaksoIngredientsSeeder: React.FC = () => {
  const { addIngredient } = useIngredients();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const baksoIngredients = [
    {
      name: 'Daging Sapi Giling',
      unit: 'kg',
      costPerUnit: 120000,
      amountPerPortion: 0.1,
      category: 'Protein'
    },
    {
      name: 'Tepung Tapioka',
      unit: 'kg',
      costPerUnit: 15000,
      amountPerPortion: 0.05,
      category: 'Karbohidrat'
    },
    {
      name: 'Bawang Putih',
      unit: 'kg',
      costPerUnit: 25000,
      amountPerPortion: 0.01,
      category: 'Bumbu'
    },
    {
      name: 'Garam',
      unit: 'kg',
      costPerUnit: 8000,
      amountPerPortion: 0.005,
      category: 'Bumbu'
    },
    {
      name: 'Merica Bubuk',
      unit: 'kg',
      costPerUnit: 80000,
      amountPerPortion: 0.002,
      category: 'Bumbu'
    },
    {
      name: 'Es Batu',
      unit: 'kg',
      costPerUnit: 5000,
      amountPerPortion: 0.1,
      category: 'Lainnya'
    },
    {
      name: 'Kaldu Sapi',
      unit: 'liter',
      costPerUnit: 15000,
      amountPerPortion: 0.3,
      category: 'Lainnya'
    },
    {
      name: 'Mie Kuning',
      unit: 'kg',
      costPerUnit: 12000,
      amountPerPortion: 0.08,
      category: 'Karbohidrat'
    },
    {
      name: 'Pakcoy',
      unit: 'kg',
      costPerUnit: 8000,
      amountPerPortion: 0.05,
      category: 'Sayuran'
    },
    {
      name: 'Bawang Goreng',
      unit: 'kg',
      costPerUnit: 45000,
      amountPerPortion: 0.01,
      category: 'Bumbu'
    },
    {
      name: 'Kecap Manis',
      unit: 'liter',
      costPerUnit: 25000,
      amountPerPortion: 0.02,
      category: 'Bumbu'
    },
    {
      name: 'Sambal',
      unit: 'kg',
      costPerUnit: 20000,
      amountPerPortion: 0.01,
      category: 'Bumbu'
    }
  ];

  const handleAddBaksoIngredients = async () => {
    setIsLoading(true);
    try {
      let successCount = 0;
      let failCount = 0;

      for (const ingredient of baksoIngredients) {
        try {
          await addIngredient(ingredient);
          successCount++;
        } catch (error) {
          console.error(`Error adding ${ingredient.name}:`, error);
          failCount++;
        }
      }

      toast({
        title: "Selesai menambahkan bahan bakso",
        description: `Berhasil: ${successCount}, Gagal: ${failCount}`,
        variant: successCount > 0 ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menambahkan bahan bakso",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleAddBaksoIngredients}
      disabled={isLoading}
      className="w-full"
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Tambah Semua Bahan Bakso ({baksoIngredients.length} items)
    </Button>
  );
};