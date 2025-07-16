import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Ingredient {
  id: string;
  name: string;
  unit: string;
  costPerUnit: number;
  amountPerPortion: number;
  category: string;
}

export interface UsageRecord {
  id: string;
  date: string;
  portions: number;
  ingredients: Array<{
    ingredientId: string;
    amount: number;
    cost: number;
  }>;
  totalCost: number;
}

interface IngredientContextType {
  ingredients: Ingredient[];
  usageHistory: UsageRecord[];
  loading: boolean;
  addIngredient: (ingredient: Omit<Ingredient, 'id'>) => Promise<void>;
  updateIngredient: (id: string, ingredient: Partial<Ingredient>) => Promise<void>;
  deleteIngredient: (id: string) => Promise<void>;
  addUsageRecord: (record: Omit<UsageRecord, 'id'>) => Promise<void>;
  refreshData: () => Promise<void>;
}

const IngredientContext = createContext<IngredientContextType | undefined>(undefined);

export const useIngredients = () => {
  const context = useContext(IngredientContext);
  if (!context) {
    throw new Error('useIngredients must be used within an IngredientProvider');
  }
  return context;
};

export const IngredientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [usageHistory, setUsageHistory] = useState<UsageRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIngredients = async () => {
    try {
      const { data, error } = await supabase
        .from('ingredients')
        .select('*')
        .order('name');

      if (error) throw error;

      const formattedIngredients = data.map(item => ({
        id: item.id,
        name: item.name,
        unit: item.unit,
        costPerUnit: typeof item.cost_per_unit === 'number' ? item.cost_per_unit : parseFloat(item.cost_per_unit),
        amountPerPortion: typeof item.amount_per_portion === 'number' ? item.amount_per_portion : parseFloat(item.amount_per_portion),
        category: item.category
      }));

      setIngredients(formattedIngredients);
    } catch (error) {
      console.error('Error fetching ingredients:', error);
    }
  };

  const fetchUsageHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('usage_history')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedHistory = data.map(item => ({
        id: item.id,
        date: item.date,
        portions: item.portions,
        totalCost: typeof item.total_cost === 'number' ? item.total_cost : parseFloat(item.total_cost),
        ingredients: item.ingredients as Array<{
          ingredientId: string;
          amount: number;
          cost: number;
        }>
      }));

      setUsageHistory(formattedHistory);
    } catch (error) {
      console.error('Error fetching usage history:', error);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    await Promise.all([fetchIngredients(), fetchUsageHistory()]);
    setLoading(false);
  };

  useEffect(() => {
    refreshData();

    // Setup realtime subscription untuk usage_history
    const usageHistoryChannel = supabase
      .channel('usage_history_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'usage_history'
        },
        () => {
          // Refresh data ketika ada perubahan pada usage_history
          fetchUsageHistory();
        }
      )
      .subscribe();

    // Setup realtime subscription untuk ingredients
    const ingredientsChannel = supabase
      .channel('ingredients_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ingredients'
        },
        () => {
          // Refresh data ketika ada perubahan pada ingredients
          fetchIngredients();
        }
      )
      .subscribe();

    // Cleanup function
    return () => {
      supabase.removeChannel(usageHistoryChannel);
      supabase.removeChannel(ingredientsChannel);
    };
  }, []);

  const addIngredient = async (ingredient: Omit<Ingredient, 'id'>) => {
    try {
      const { error } = await supabase
        .from('ingredients')
        .insert({
          name: ingredient.name,
          unit: ingredient.unit,
          cost_per_unit: ingredient.costPerUnit,
          amount_per_portion: ingredient.amountPerPortion,
          category: ingredient.category
        });

      if (error) throw error;
      await fetchIngredients();
    } catch (error) {
      console.error('Error adding ingredient:', error);
      throw error;
    }
  };

  const updateIngredient = async (id: string, updatedIngredient: Partial<Ingredient>) => {
    try {
      const updateData: any = {};
      if (updatedIngredient.name) updateData.name = updatedIngredient.name;
      if (updatedIngredient.unit) updateData.unit = updatedIngredient.unit;
      if (updatedIngredient.costPerUnit !== undefined) updateData.cost_per_unit = updatedIngredient.costPerUnit;
      if (updatedIngredient.amountPerPortion !== undefined) updateData.amount_per_portion = updatedIngredient.amountPerPortion;
      if (updatedIngredient.category) updateData.category = updatedIngredient.category;

      const { error } = await supabase
        .from('ingredients')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      await fetchIngredients();
    } catch (error) {
      console.error('Error updating ingredient:', error);
      throw error;
    }
  };

  const deleteIngredient = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ingredients')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchIngredients();
    } catch (error) {
      console.error('Error deleting ingredient:', error);
      throw error;
    }
  };

  const addUsageRecord = async (record: Omit<UsageRecord, 'id'>) => {
    try {
      const { error } = await supabase
        .from('usage_history')
        .insert({
          date: record.date,
          portions: record.portions,
          total_cost: record.totalCost,
          ingredients: record.ingredients
        });

      if (error) throw error;
      await fetchUsageHistory();
    } catch (error) {
      console.error('Error adding usage record:', error);
      throw error;
    }
  };

  return (
    <IngredientContext.Provider
      value={{
        ingredients,
        usageHistory,
        loading,
        addIngredient,
        updateIngredient,
        deleteIngredient,
        addUsageRecord,
        refreshData,
      }}
    >
      {children}
    </IngredientContext.Provider>
  );
};
