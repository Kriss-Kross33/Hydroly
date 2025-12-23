export type BeverageType = 'water' | 'coffee' | 'tea' | 'soda' | 'alcohol' | 'juice' | 'milk' | 'sports_drink';

export interface BeverageCoefficients {
  [key: string]: number;
}

export const HYDRATION_COEFFICIENTS: BeverageCoefficients = {
  water: 1.0,
  coffee: 0.7,
  tea: 0.85,
  soda: 0.5,
  alcohol: -0.5,
  juice: 0.8,
  milk: 0.9,
  sports_drink: 0.95,
};

export const BEVERAGE_INFO = {
  water: { name: 'Water', color: '#0EA5E9', emoji: '💧' },
  coffee: { name: 'Coffee', color: '#78350F', emoji: '☕' },
  tea: { name: 'Tea', color: '#84CC16', emoji: '🍵' },
  soda: { name: 'Soda', color: '#EF4444', emoji: '🥤' },
  alcohol: { name: 'Alcohol', color: '#DC2626', emoji: '🍺' },
  juice: { name: 'Juice', color: '#F97316', emoji: '🧃' },
  milk: { name: 'Milk', color: '#F8FAFC', emoji: '🥛' },
  sports_drink: { name: 'Sports Drink', color: '#8B5CF6', emoji: '🏃' },
};

export interface BeverageIntake {
  id: string;
  type: BeverageType;
  amount: number;
  netHydration: number;
  timestamp: number;
  date: string;
}
