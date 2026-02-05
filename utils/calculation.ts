import { LIQUID_PRODUCTS, CONFIG } from '../constants';
import { Product, WeeklyPlan, MealItem, DailyNutrition, DailyPlan, MealNutrition, PlanType } from '../types';

// Seeded Random Number Generator (Mulberry32)
function mulberry32(a: number) {
  return function () {
    var t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Fisher-Yates Shuffle with custom RNG
function shuffle<T>(array: T[], rng: () => number): T[] {
  let currentIndex = array.length, randomIndex;
  const newArray = [...array];

  while (currentIndex !== 0) {
    randomIndex = Math.floor(rng() * currentIndex);
    currentIndex--;
    [newArray[currentIndex], newArray[randomIndex]] = [
      newArray[randomIndex],
      newArray[currentIndex],
    ];
  }

  return newArray;
}

// Hash function for seed - Updated to include PlanType
export const generateSeed = (budget: number, powderId: number, planType: PlanType): number => {
  const str = `${Math.floor(budget)}-${powderId}-${planType}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

// Calculate nutrition based on specific grams
export const calculateMealNutrition = (meal: MealItem): MealNutrition => {
  let kj = 0, p = 0, f = 0, c = 0;

  // Factors: Nutrition data is per 100g
  const powderFactor = meal.powderGrams / 100;
  
  kj += meal.powder.energy_kj * powderFactor;
  p += meal.powder.protein * powderFactor;
  f += meal.powder.fat * powderFactor;
  c += meal.powder.carbs * powderFactor;

  if (meal.liquid && meal.liquidGrams > 0) {
    const liquidFactor = meal.liquidGrams / 100;
    kj += meal.liquid.energy_kj * liquidFactor;
    p += meal.liquid.protein * liquidFactor;
    f += meal.liquid.fat * liquidFactor;
    c += meal.liquid.carbs * liquidFactor;
  }

  return {
    energy_kcal: kj / CONFIG.KJ_TO_KCAL,
    protein: p,
    fat: f,
    carbs: c
  };
};

const calculateDailyNutrition = (meals: MealItem[]): DailyNutrition => {
  let totalKj = 0;
  let totalProtein = 0;
  let totalFat = 0;
  let totalCarbs = 0;

  meals.forEach(meal => {
    // Re-implement accumulation using factors for performance (avoiding object creation)
    const powderFactor = meal.powderGrams / 100;
    totalKj += meal.powder.energy_kj * powderFactor;
    totalProtein += meal.powder.protein * powderFactor;
    totalFat += meal.powder.fat * powderFactor;
    totalCarbs += meal.powder.carbs * powderFactor;

    if (meal.liquid && meal.liquidGrams > 0) {
      const liquidFactor = meal.liquidGrams / 100;
      totalKj += meal.liquid.energy_kj * liquidFactor;
      totalProtein += meal.liquid.protein * liquidFactor;
      totalFat += meal.liquid.fat * liquidFactor;
      totalCarbs += meal.liquid.carbs * liquidFactor;
    }
  });

  const totalEnergy = totalKj / CONFIG.KJ_TO_KCAL;
  const pCal = totalProtein * 4;
  const fCal = totalFat * 9;
  const cCal = totalCarbs * 4;
  const totalCal = pCal + fCal + cCal;
  const safeTotalCal = totalCal || 1;

  return {
    totalEnergy,
    totalProtein,
    totalFat,
    totalCarbs,
    percentProtein: (pCal / safeTotalCal) * 100,
    percentFat: (fCal / safeTotalCal) * 100,
    percentCarbs: (cCal / safeTotalCal) * 100
  };
};

// Calculate cost based on specific grams
const calculateMealCost = (liquid: Product | undefined, liquidGrams: number, powder: Product, powderGrams: number): number => {
  let cost = 0;
  
  // Powder: 2 yuan per 50g pack -> 0.04 per gram
  // Or: (PriceRaw / 50) * grams
  cost += (powder.priceRaw / 50) * powderGrams;

  if (liquid && liquidGrams > 0) {
    // Liquid: PriceRaw per 500g bag -> PriceRaw/500 per gram
    cost += (liquid.priceRaw / 500) * liquidGrams;
  }
  
  return cost;
};

export interface WeeklyStats {
  totalCost: number;
  avgDailyCost: number;
  avgEnergy: number;
  avgProtein: number;
  avgFat: number;
  avgCarbs: number;
}

export const calculateWeeklyStats = (days: DailyPlan[]): WeeklyStats => {
  if (days.length === 0) return { totalCost: 0, avgDailyCost: 0, avgEnergy: 0, avgProtein: 0, avgFat: 0, avgCarbs: 0 };

  let totalCost = 0;
  let totalEnergy = 0;
  let totalProtein = 0;
  let totalFat = 0;
  let totalCarbs = 0;

  days.forEach(d => {
    totalCost += d.cost;
    totalEnergy += d.nutrition.totalEnergy;
    totalProtein += d.nutrition.totalProtein;
    totalFat += d.nutrition.totalFat;
    totalCarbs += d.nutrition.totalCarbs;
  });

  return {
    totalCost,
    avgDailyCost: totalCost / days.length,
    avgEnergy: totalEnergy / days.length,
    avgProtein: totalProtein / days.length,
    avgFat: totalFat / days.length,
    avgCarbs: totalCarbs / days.length
  };
};

export const generateWeeklyPlan = (budget: number, powderProduct: Product, planType: PlanType): WeeklyPlan => {
  // Relax min budget check for generation, handled in UI
  const seed = generateSeed(budget, powderProduct.id, planType);
  const rng = mulberry32(seed);

  // --- Flavor Distribution Logic (Common for both) ---
  // Both plans need 3 liquid flavors per day (Tube: 3 main meals, Dysphagia: 3 meals)
  // 7 days * 3 = 21 slots.
  // 11 products. 10 * 2 + 1 * 1 = 21.

  const shuffledLiquids = shuffle(LIQUID_PRODUCTS, rng);
  const rareLiquid = shuffledLiquids[0]; 
  const commonLiquids = shuffledLiquids.slice(1);

  let pool: Product[] = [rareLiquid];
  commonLiquids.forEach(p => pool.push(p, p));

  let daysDistribution: Product[][] = [];
  let attempts = 0;

  // Try to distribute so no duplicate flavors in a single day
  while (attempts < 1000) {
    const currentPool = shuffle([...pool], rng);
    const potentialDays: Product[][] = [];
    let possible = true;

    for (let i = 0; i < 7; i++) {
      const dayLiquids = currentPool.slice(i * 3, i * 3 + 3);
      const uniqueIds = new Set(dayLiquids.map(p => p.id));
      
      if (uniqueIds.size < 3) {
        possible = false;
        break;
      }
      potentialDays.push(dayLiquids);
    }

    if (possible) {
      daysDistribution = potentialDays;
      break;
    }
    attempts++;
  }

  // Fallback
  if (daysDistribution.length === 0) {
     const currentPool = shuffle([...pool], rng);
     for (let i = 0; i < 7; i++) {
        daysDistribution.push(currentPool.slice(i * 3, i * 3 + 3));
     }
  }

  const days: DailyPlan[] = CONFIG.DAYS.map((dayName, index) => {
    const liquids = daysDistribution[index];
    let meals: MealItem[] = [];

    if (planType === 'TUBE') {
      // --- TUBE FEEDING (6 Meals) ---
      const createMeal = (type: 'MAIN' | 'SNACK', label: string, liq?: Product): MealItem => {
        const water = type === 'MAIN' ? CONFIG.TUBE_WATER_MAIN : CONFIG.TUBE_WATER_SNACK;
        const liqG = type === 'MAIN' ? CONFIG.TUBE_LIQUID_G : 0;
        const powG = CONFIG.TUBE_POWDER_G;
        
        return {
          type,
          label,
          powder: powderProduct,
          liquid: liq,
          liquidGrams: liqG,
          powderGrams: powG,
          water,
          cost: calculateMealCost(liq, liqG, powderProduct, powG)
        };
      };

      meals = [
        createMeal('MAIN', CONFIG.TUBE_LABELS[0], liquids[0]),
        createMeal('SNACK', CONFIG.TUBE_LABELS[1]),
        createMeal('MAIN', CONFIG.TUBE_LABELS[2], liquids[1]),
        createMeal('SNACK', CONFIG.TUBE_LABELS[3]),
        createMeal('MAIN', CONFIG.TUBE_LABELS[4], liquids[2]),
        createMeal('SNACK', CONFIG.TUBE_LABELS[5]),
      ];

    } else {
      // --- DYSPHAGIA MEAL (3 Meals) ---
      // Breakfast: 70g Liq + 75g Pow + 230ml Water
      meals.push({
        type: 'MAIN',
        label: CONFIG.DYSPHAGIA_LABELS[0],
        powder: powderProduct,
        liquid: liquids[0],
        liquidGrams: CONFIG.DYSPHAGIA_SMALL_LIQUID_G,
        powderGrams: CONFIG.DYSPHAGIA_SMALL_POWDER_G,
        water: CONFIG.DYSPHAGIA_SMALL_WATER,
        cost: calculateMealCost(liquids[0], CONFIG.DYSPHAGIA_SMALL_LIQUID_G, powderProduct, CONFIG.DYSPHAGIA_SMALL_POWDER_G)
      });

      // Lunch: 100g Liq + 100g Pow + 300ml Water
      meals.push({
        type: 'MAIN',
        label: CONFIG.DYSPHAGIA_LABELS[1],
        powder: powderProduct,
        liquid: liquids[1],
        liquidGrams: CONFIG.DYSPHAGIA_LARGE_LIQUID_G,
        powderGrams: CONFIG.DYSPHAGIA_LARGE_POWDER_G,
        water: CONFIG.DYSPHAGIA_LARGE_WATER,
        cost: calculateMealCost(liquids[1], CONFIG.DYSPHAGIA_LARGE_LIQUID_G, powderProduct, CONFIG.DYSPHAGIA_LARGE_POWDER_G)
      });

      // Dinner: 70g Liq + 75g Pow + 230ml Water
      meals.push({
        type: 'MAIN',
        label: CONFIG.DYSPHAGIA_LABELS[2],
        powder: powderProduct,
        liquid: liquids[2],
        liquidGrams: CONFIG.DYSPHAGIA_SMALL_LIQUID_G,
        powderGrams: CONFIG.DYSPHAGIA_SMALL_POWDER_G,
        water: CONFIG.DYSPHAGIA_SMALL_WATER,
        cost: calculateMealCost(liquids[2], CONFIG.DYSPHAGIA_SMALL_LIQUID_G, powderProduct, CONFIG.DYSPHAGIA_SMALL_POWDER_G)
      });
    }

    const dailyCost = meals.reduce((sum, m) => sum + m.cost, 0);

    return {
      dayName,
      meals,
      nutrition: calculateDailyNutrition(meals),
      cost: dailyCost
    };
  });

  const weeklyCost = days.reduce((sum, day) => sum + day.cost, 0);
  const monthlyCost = (weeklyCost / 7) * 30;

  return {
    days,
    weeklyCost,
    monthlyCost,
    isValidBudget: monthlyCost <= budget || true, // Allow generation regardless, show warning in UI
    planType
  };
};