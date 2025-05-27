
import React, { createContext, useContext, useState, useEffect } from 'react';

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
  addIngredient: (ingredient: Omit<Ingredient, 'id'>) => void;
  updateIngredient: (id: string, ingredient: Partial<Ingredient>) => void;
  deleteIngredient: (id: string) => void;
  addUsageRecord: (record: Omit<UsageRecord, 'id'>) => void;
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
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    {
      id: '1',
      name: 'Beef Meatballs',
      unit: 'pieces',
      costPerUnit: 500,
      amountPerPortion: 6,
      category: 'Main'
    },
    {
      id: '2',
      name: 'Wheat Noodles',
      unit: 'grams',
      costPerUnit: 15,
      amountPerPortion: 100,
      category: 'Carbohydrate'
    },
    {
      id: '3',
      name: 'Beef Broth',
      unit: 'ml',
      costPerUnit: 8,
      amountPerPortion: 250,
      category: 'Broth'
    },
    {
      id: '4',
      name: 'Bean Sprouts',
      unit: 'grams',
      costPerUnit: 20,
      amountPerPortion: 50,
      category: 'Vegetable'
    },
    {
      id: '5',
      name: 'Green Onions',
      unit: 'grams',
      costPerUnit: 30,
      amountPerPortion: 10,
      category: 'Seasoning'
    }
  ]);

  const [usageHistory, setUsageHistory] = useState<UsageRecord[]>([
    {
      id: '1',
      date: '2024-05-25',
      portions: 50,
      ingredients: [
        { ingredientId: '1', amount: 300, cost: 150000 },
        { ingredientId: '2', amount: 5000, cost: 75000 },
        { ingredientId: '3', amount: 12500, cost: 100000 },
      ],
      totalCost: 325000
    },
    {
      id: '2',
      date: '2024-05-24',
      portions: 35,
      ingredients: [
        { ingredientId: '1', amount: 210, cost: 105000 },
        { ingredientId: '2', amount: 3500, cost: 52500 },
        { ingredientId: '3', amount: 8750, cost: 70000 },
      ],
      totalCost: 227500
    }
  ]);

  const addIngredient = (ingredient: Omit<Ingredient, 'id'>) => {
    const newIngredient = {
      ...ingredient,
      id: Date.now().toString(),
    };
    setIngredients(prev => [...prev, newIngredient]);
  };

  const updateIngredient = (id: string, updatedIngredient: Partial<Ingredient>) => {
    setIngredients(prev =>
      prev.map(ingredient =>
        ingredient.id === id ? { ...ingredient, ...updatedIngredient } : ingredient
      )
    );
  };

  const deleteIngredient = (id: string) => {
    setIngredients(prev => prev.filter(ingredient => ingredient.id !== id));
  };

  const addUsageRecord = (record: Omit<UsageRecord, 'id'>) => {
    const newRecord = {
      ...record,
      id: Date.now().toString(),
    };
    setUsageHistory(prev => [newRecord, ...prev]);
  };

  return (
    <IngredientContext.Provider
      value={{
        ingredients,
        usageHistory,
        addIngredient,
        updateIngredient,
        deleteIngredient,
        addUsageRecord,
      }}
    >
      {children}
    </IngredientContext.Provider>
  );
};
