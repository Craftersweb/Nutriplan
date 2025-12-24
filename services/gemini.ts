
import { GoogleGenAI, Type } from "@google/genai";
import { DietPreference, DayPlan, ShoppingListItem } from "../types";

// Fix: Follow guidelines by using process.env.API_KEY directly and ensuring named parameter initialization.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MEAL_PROPERTIES = {
  name: { type: Type.STRING },
  description: { type: Type.STRING },
  calories: { type: Type.NUMBER },
  ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
  instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
  image: { type: Type.STRING }
};

const REQUIRED_MEAL_FIELDS = ['name', 'description', 'calories', 'ingredients', 'instructions', 'image'];

const MEAL_PLAN_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      day: { type: Type.STRING },
      meals: {
        type: Type.OBJECT,
        properties: {
          breakfast: {
            type: Type.OBJECT,
            properties: MEAL_PROPERTIES,
            required: REQUIRED_MEAL_FIELDS
          },
          lunch: {
            type: Type.OBJECT,
            properties: MEAL_PROPERTIES,
            required: REQUIRED_MEAL_FIELDS
          },
          dinner: {
            type: Type.OBJECT,
            properties: MEAL_PROPERTIES,
            required: REQUIRED_MEAL_FIELDS
          }
        },
        required: ['breakfast', 'lunch', 'dinner']
      }
    },
    required: ['day', 'meals']
  }
};

export const generateMealPlan = async (
  diet: DietPreference, 
  allergies: string[], 
  servings: number, 
  days: string[], 
  instructions?: string
): Promise<DayPlan[]> => {
  try {
    const customPrompt = instructions ? `Prend en compte ces instructions : "${instructions}".` : "";
    
    // Fix: Using gemini-3-pro-preview for complex reasoning task (meal planning with constraints).
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Génère un menu pour les jours suivants : ${days.join(', ')}.
                Régime : ${diet}. 
                Nombre de personnes : ${servings}. 
                Allergies : ${allergies.join(', ') || 'Aucune'}. 
                ${customPrompt}
                IMPORTANT: Calcule les quantités pour exactement ${servings} personnes.
                Chaque jour doit avoir Petit-déjeuner, Déjeuner et Dîner.
                Ajoute une URL d'image Unsplash pertinente (ex: https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: MEAL_PLAN_SCHEMA
      }
    });

    // Fix: Access response.text directly as a property (not a method).
    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating meal plan:", error);
    return [];
  }
};

export const generateShoppingList = async (mealPlan: any[]): Promise<ShoppingListItem[]> => {
  try {
    // Fix: Using gemini-3-flash-preview for basic text tasks (shopping list consolidation).
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Crée une liste de courses consolidée pour ces repas (ignore les repas non sélectionnés) : ${JSON.stringify(mealPlan)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              item: { type: Type.STRING },
              amount: { type: Type.STRING },
              category: { type: Type.STRING },
              checked: { type: Type.BOOLEAN }
            },
            required: ['item', 'amount', 'category', 'checked']
          }
        }
      }
    });

    // Fix: Access response.text directly as a property.
    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating shopping list:", error);
    return [];
  }
};
