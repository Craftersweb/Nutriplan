
import { GoogleGenAI, Type } from "@google/genai";
import { DietPreference, DayPlan, ShoppingListItem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

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

export const generateMealPlan = async (diet: DietPreference, allergies: string[]): Promise<DayPlan[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Génère un menu complet pour 7 jours pour un régime ${diet}. 
                Allergies à éviter: ${allergies.join(', ') || 'Aucune'}. 
                Chaque repas doit avoir un nom, description, calories, ingrédients et instructions courtes. 
                Ajoute une URL d'image générique de Unsplash pertinente pour le plat (ex: https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: MEAL_PLAN_SCHEMA
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating meal plan:", error);
    return [];
  }
};

export const generateShoppingList = async (mealPlan: DayPlan[]): Promise<ShoppingListItem[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `À partir de ce plan de repas, crée une liste de courses consolidée et catégorisée (Produits frais, Boucherie, Crémerie, Épicerie, etc.): ${JSON.stringify(mealPlan)}`,
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

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating shopping list:", error);
    return [];
  }
};
