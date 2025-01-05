import { Equipment } from '../types/equipment';

export interface ShopItem {
  id: string;
  basePrice: number;
  stock: number;
  refreshTime?: number; // 限时商品的刷新时间（毫秒）
  levelRequirement?: number;
  rarity: number; // 1-5，影响价格波动
}

export interface Shop {
  id: string;
  name: string;
  description: string;
  refreshInterval: number; // 商店刷新间隔（毫秒）
  items: ShopItem[];
  specialItems?: ShopItem[]; // 限时特殊商品
}

// 商店配置
export const shops: Record<string, Shop> = {
  generalStore: {
    id: 'generalStore',
    name: '杂货商店',
    description: '出售各种基础装备的商店',
    refreshInterval: 3600000, // 1小时刷新一次
    items: [
      {
        id: 'woodenSword',
        basePrice: 100,
        stock: 5,
        rarity: 1,
      },
      {
        id: 'leatherArmor',
        basePrice: 150,
        stock: 5,
        rarity: 1,
      },
      {
        id: 'ironSword',
        basePrice: 300,
        stock: 3,
        rarity: 2,
        levelRequirement: 5,
      },
      {
        id: 'chainMail',
        basePrice: 400,
        stock: 3,
        rarity: 2,
        levelRequirement: 5,
      },
    ],
  },
  magicShop: {
    id: 'magicShop',
    name: '魔法商店',
    description: '出售魔法装备的神秘商店',
    refreshInterval: 7200000, // 2小时刷新一次
    items: [
      {
        id: 'magicRing',
        basePrice: 500,
        stock: 2,
        rarity: 2,
        levelRequirement: 5,
      },
    ],
    specialItems: [
      {
        id: 'flameSword',
        basePrice: 1000,
        stock: 1,
        rarity: 3,
        levelRequirement: 10,
        refreshTime: 86400000, // 24小时刷新一次
      },
    ],
  },
};

// 价格计算
export const calculatePrice = (basePrice: number, rarity: number): number => {
  const variance = 0.2; // 价格波动范围
  const randomFactor = 1 + (Math.random() * 2 - 1) * variance;
  const rarityMultiplier = Math.pow(1.5, rarity - 1);
  return Math.floor(basePrice * randomFactor * rarityMultiplier);
};

// 出售价格计算
export const calculateSellPrice = (basePrice: number, rarity: number): number => {
  return Math.floor(calculatePrice(basePrice, rarity) * 0.4); // 出售价格为购买价格的40%
}; 