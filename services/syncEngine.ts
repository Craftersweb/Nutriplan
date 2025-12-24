
import { CartItem } from "../types";

/**
 * MOTEUR DE SYNCHRONISATION NUTRIPLAN
 * Copie les articles d'un panier source vers un panier cible.
 * Gère les contraintes : pas d'ID unique, gestion des stocks, multi-utilisateurs.
 */

// Simulation d'une base de données de sessions
const sessionCarts: Record<string, CartItem[]> = {};

export const transferBasket = async (
  sourceSessionId: string,
  targetSessionId: string,
  inventoryCheck: (itemName: string) => Promise<boolean>
) => {
  console.log(`[SyncEngine] Initialisation du transfert: ${sourceSessionId} -> ${targetSessionId}`);
  
  const sourceCart = sessionCarts[sourceSessionId] || [];
  if (sourceCart.length === 0) {
    throw new Error("Le panier source est vide.");
  }

  // Initialisation du panier cible si inexistant
  if (!sessionCarts[targetSessionId]) {
    sessionCarts[targetSessionId] = [];
  }

  const results = {
    added: 0,
    outOfStock: [] as string[],
    duplicates: 0
  };

  for (const item of sourceCart) {
    // 1. Vérification du stock via l'API du supermarché
    const isAvailable = await inventoryCheck(item.name);
    
    if (!isAvailable) {
      results.outOfStock.push(item.name);
      continue;
    }

    // 2. Gestion de l'absence d'ID (Comparaison par nom)
    const alreadyExists = sessionCarts[targetSessionId].some(
      targetItem => targetItem.name.toLowerCase() === item.name.toLowerCase()
    );

    if (alreadyExists) {
      results.duplicates++;
      // Optionnel: Mise à jour de la quantité ici
      continue;
    }

    // 3. Ajout au panier cible
    sessionCarts[targetSessionId].push({
      ...item,
      timestamp: Date.now()
    });
    results.added++;
  }

  return results;
};

// Fonction pour injecter des données de test
export const mockInjectCart = (sessionId: string, items: any[]) => {
  sessionCarts[sessionId] = items.map(i => ({
    name: i.item,
    quantity: i.amount,
    timestamp: Date.now()
  }));
};
