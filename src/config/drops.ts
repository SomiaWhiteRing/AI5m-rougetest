import { ItemRarity } from './items';

export interface DropEntry {
  itemId: string;
  weight: number;
  minQuantity?: number;
  maxQuantity?: number;
  requiredLevel?: number;
  condition?: string;
}

export interface DropTable {
  guaranteed: DropEntry[];
  common: DropEntry[];
  rare: DropEntry[];
  epic: DropEntry[];
  legendary: DropEntry[];
}

export interface EnemyDropConfig {
  baseDropCount: number;
  bonusDropChance: number;
  dropTable: DropTable;
}

export const DROP_WEIGHTS = {
  [ItemRarity.COMMON]: 100,
  [ItemRarity.UNCOMMON]: 60,
  [ItemRarity.RARE]: 30,
  [ItemRarity.EPIC]: 10,
  [ItemRarity.LEGENDARY]: 1
};

export const ENEMY_DROPS: Record<string, EnemyDropConfig> = {
  slime: {
    baseDropCount: 1,
    bonusDropChance: 0.3,
    dropTable: {
      guaranteed: [
        {
          itemId: 'slimeGel',
          weight: 1,
          minQuantity: 1,
          maxQuantity: 3
        }
      ],
      common: [
        {
          itemId: 'healthPotion',
          weight: 50,
          minQuantity: 1,
          maxQuantity: 2
        }
      ],
      rare: [],
      epic: [],
      legendary: []
    }
  },

  fireElemental: {
    baseDropCount: 2,
    bonusDropChance: 0.4,
    dropTable: {
      guaranteed: [
        {
          itemId: 'fireEssence',
          weight: 1,
          minQuantity: 1,
          maxQuantity: 2
        }
      ],
      common: [
        {
          itemId: 'healthPotion',
          weight: 40,
          minQuantity: 1,
          maxQuantity: 2
        },
        {
          itemId: 'manaPotion',
          weight: 40,
          minQuantity: 1,
          maxQuantity: 2
        }
      ],
      rare: [
        {
          itemId: 'fireStaff',
          weight: 20,
          requiredLevel: 5
        }
      ],
      epic: [],
      legendary: []
    }
  },

  forestGuardian: {
    baseDropCount: 3,
    bonusDropChance: 0.5,
    dropTable: {
      guaranteed: [
        {
          itemId: 'guardianCore',
          weight: 1,
          condition: 'firstKill'
        }
      ],
      common: [
        {
          itemId: 'healthPotion',
          weight: 30,
          minQuantity: 2,
          maxQuantity: 4
        },
        {
          itemId: 'manaPotion',
          weight: 30,
          minQuantity: 2,
          maxQuantity: 4
        }
      ],
      rare: [
        {
          itemId: 'fireStaff',
          weight: 30,
          requiredLevel: 5
        }
      ],
      epic: [
        {
          itemId: 'iceArmor',
          weight: 20,
          requiredLevel: 7
        }
      ],
      legendary: [
        {
          itemId: 'guardianCore',
          weight: 5,
          condition: 'repeatKill'
        }
      ]
    }
  }
}; 