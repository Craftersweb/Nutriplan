
export enum DietPreference {
  OMNIVORE = 'Omnivore',
  VEGETARIAN = 'Végétarien',
  VEGAN = 'Végan',
  KETO = 'Keto',
  PALEO = 'Paléo',
  GLUTEN_FREE = 'Sans Gluten'
}

export interface User {
  id: string;
  name: string;
  email: string;
  diet: DietPreference;
  allergies: string[];
  subscriptionType: 'free' | 'premium';
}

export interface Meal {
  id: string;
  name: string;
  description: string;
  calories: number;
  ingredients: string[];
  instructions: string[];
  image: string;
  type: 'breakfast' | 'lunch' | 'dinner';
}

export interface DayPlan {
  day: string;
  meals: {
    breakfast: Meal;
    lunch: Meal;
    dinner: Meal;
  };
}

export interface SavedPlan {
  id: string;
  name: string;
  date: string;
  plan: DayPlan[];
  diet: DietPreference;
}

export interface ShoppingListItem {
  item: string;
  amount: string;
  category: string;
  checked: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
