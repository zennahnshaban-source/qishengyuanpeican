export enum NutrientType {
  Liquid = 'LIQUID',
  Powder = 'POWDER',
}

export type PlanType = 'TUBE' | 'DYSPHAGIA';

export interface Product {
  id: number;
  name: string;
  priceRaw: number; // Price per bag/pack
  energy_kj: number; // per 100g
  protein: number; // per 100g
  fat: number; // per 100g
  carbs: number; // per 100g
  type: NutrientType;
}

export interface MealNutrition {
  energy_kcal: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface DailyNutrition {
  totalEnergy: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
  percentProtein: number;
  percentFat: number;
  percentCarbs: number;
}

export interface MealItem {
  liquid?: Product;
  powder: Product;
  liquidGrams: number; // Explicit grams for calculation
  powderGrams: number; // Explicit grams for calculation
  water: number;
  type: 'MAIN' | 'SNACK'; // Main meal (Breakfast/Lunch/Dinner) or Snack
  label: string;
  cost: number; // Cost of this specific meal
}

export interface DailyPlan {
  dayName: string;
  meals: MealItem[];
  nutrition: DailyNutrition;
  cost: number; // Total cost for the day
}

export interface WeeklyPlan {
  days: DailyPlan[];
  monthlyCost: number;
  weeklyCost: number;
  isValidBudget: boolean;
  planType: PlanType;
}