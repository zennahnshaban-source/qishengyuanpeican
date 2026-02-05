import { Product, NutrientType } from './types';

export const LIQUID_PRODUCTS: Product[] = [
  { id: 1, name: '咖喱牛肉', priceRaw: 42, energy_kj: 503, protein: 7.4, fat: 6.0, carbs: 9.1, type: NutrientType.Liquid },
  { id: 2, name: '浓汤鸡肉', priceRaw: 36, energy_kj: 422, protein: 8.1, fat: 4.2, carbs: 7.6, type: NutrientType.Liquid },
  { id: 3, name: '咖喱猪肉', priceRaw: 38, energy_kj: 519, protein: 7.6, fat: 6.5, carbs: 8.8, type: NutrientType.Liquid },
  { id: 4, name: '南瓜肉汤', priceRaw: 36, energy_kj: 476, protein: 9.1, fat: 5.7, carbs: 6.5, type: NutrientType.Liquid },
  { id: 5, name: '鸡肉土豆', priceRaw: 38, energy_kj: 553, protein: 8.4, fat: 7.1, carbs: 8.7, type: NutrientType.Liquid },
  { id: 6, name: '咖喱鸡肉', priceRaw: 36, energy_kj: 436, protein: 9.1, fat: 3.8, carbs: 8.3, type: NutrientType.Liquid },
  { id: 7, name: '鸡肉番茄', priceRaw: 36, energy_kj: 521, protein: 9.5, fat: 6.5, carbs: 7.0, type: NutrientType.Liquid },
  { id: 8, name: '猪肉萝卜炸豆腐', priceRaw: 38, energy_kj: 563, protein: 9.1, fat: 7.6, carbs: 7.5, type: NutrientType.Liquid },
  { id: 9, name: '芋头五花肉', priceRaw: 36, energy_kj: 556, protein: 8.8, fat: 6.9, carbs: 8.9, type: NutrientType.Liquid },
  { id: 10, name: '调味西兰花泥', priceRaw: 34, energy_kj: 382, protein: 5.6, fat: 6.6, carbs: 2.5, type: NutrientType.Liquid },
  { id: 11, name: '调味南瓜泥', priceRaw: 34, energy_kj: 241, protein: 3.0, fat: 0.0, carbs: 11.2, type: NutrientType.Liquid },
];

export const POWDER_PRODUCTS: Product[] = [
  { id: 101, name: '谷物伴侣包-常规型', priceRaw: 2, energy_kj: 1758, protein: 18.3, fat: 13.1, carbs: 51.9, type: NutrientType.Powder },
  { id: 102, name: '谷物伴侣包-纤维型', priceRaw: 2, energy_kj: 1689, protein: 17.5, fat: 11.3, carbs: 50.9, type: NutrientType.Powder },
];

export const CONFIG = {
  MIN_BUDGET: 679, // Kept for legacy check, but logic will vary by plan
  POWDER_MONTHLY_COST: 360, 
  
  // TUBE FEEDING CONFIG
  TUBE_LIQUID_G: 50,
  TUBE_POWDER_G: 50,
  TUBE_WATER_MAIN: 220,
  TUBE_WATER_SNACK: 200,

  // DYSPHAGIA CONFIG
  DYSPHAGIA_SMALL_LIQUID_G: 70, // Breakfast/Dinner
  DYSPHAGIA_SMALL_POWDER_G: 75,
  DYSPHAGIA_SMALL_WATER: 230,
  
  DYSPHAGIA_LARGE_LIQUID_G: 100, // Lunch
  DYSPHAGIA_LARGE_POWDER_G: 100,
  DYSPHAGIA_LARGE_WATER: 300,

  // Common
  KJ_TO_KCAL: 4.184,
  DAYS: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
  
  // Labels
  TUBE_LABELS: ['早餐', '早加餐', '午餐', '午加餐', '晚餐', '晚加餐'],
  DYSPHAGIA_LABELS: ['早餐', '午餐', '晚餐'],
};