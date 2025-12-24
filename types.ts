
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
  birthDate: string;
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
  isSelected?: boolean; // Pour choisir si on inclut le repas
  isTakeAway?: boolean; // Pour définir si c'est à emporter
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
  servings: number;
}

export interface ShoppingListItem {
  item: string;
  amount: string;
  category: string;
  checked: boolean;
  inStock?: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface CartItem {
  name: string;
  quantity: string;
  timestamp: number;
}
