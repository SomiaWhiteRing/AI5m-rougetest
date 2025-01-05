export interface Material {
  id: string;
  name: string;
  description: string;
  icon: string;
  quality: number;
  stackable: boolean;
  maxStack: number;
}

// 材料配置
export const materials: Record<string, Material> = {
  // 基础材料
  ironScrap: {
    id: 'ironScrap',
    name: '铁屑',
    description: '分解铁质装备获得的材料',
    icon: '/assets/materials/iron_scrap.png',
    quality: 1,
    stackable: true,
    maxStack: 999,
  },
  leatherScrap: {
    id: 'leatherScrap',
    name: '皮革碎片',
    description: '分解皮革装备获得的材料',
    icon: '/assets/materials/leather_scrap.png',
    quality: 1,
    stackable: true,
    maxStack: 999,
  },
  magicDust: {
    id: 'magicDust',
    name: '魔法粉尘',
    description: '分解魔法装备获得的材料',
    icon: '/assets/materials/magic_dust.png',
    quality: 2,
    stackable: true,
    maxStack: 999,
  },
  // 高级材料
  enchantedShard: {
    id: 'enchantedShard',
    name: '附魔碎片',
    description: '分解附魔装备获得的材料',
    icon: '/assets/materials/enchanted_shard.png',
    quality: 3,
    stackable: true,
    maxStack: 999,
  },
  elementalCore: {
    id: 'elementalCore',
    name: '元素核心',
    description: '分解元素装备获得的材料',
    icon: '/assets/materials/elemental_core.png',
    quality: 3,
    stackable: true,
    maxStack: 999,
  },
  // 稀有材料
  ancientRelic: {
    id: 'ancientRelic',
    name: '远古遗物',
    description: '分解远古装备获得的材料',
    icon: '/assets/materials/ancient_relic.png',
    quality: 4,
    stackable: true,
    maxStack: 99,
  },
  legendaryEssence: {
    id: 'legendaryEssence',
    name: '传说精华',
    description: '分解传说装备获得的材料',
    icon: '/assets/materials/legendary_essence.png',
    quality: 5,
    stackable: true,
    maxStack: 99,
  },
};

// 分解规则
export interface DisassembleRule {
  materials: {
    id: string;
    minQuantity: number;
    maxQuantity: number;
    chance: number;
  }[];
}

// 分解规则配置
export const disassembleRules: Record<number, DisassembleRule> = {
  // 普通品质
  1: {
    materials: [
      { id: 'ironScrap', minQuantity: 1, maxQuantity: 3, chance: 1 },
      { id: 'leatherScrap', minQuantity: 1, maxQuantity: 3, chance: 1 },
    ],
  },
  // 优秀品质
  2: {
    materials: [
      { id: 'ironScrap', minQuantity: 2, maxQuantity: 4, chance: 1 },
      { id: 'leatherScrap', minQuantity: 2, maxQuantity: 4, chance: 1 },
      { id: 'magicDust', minQuantity: 1, maxQuantity: 2, chance: 0.5 },
    ],
  },
  // 稀有品质
  3: {
    materials: [
      { id: 'magicDust', minQuantity: 2, maxQuantity: 4, chance: 1 },
      { id: 'enchantedShard', minQuantity: 1, maxQuantity: 2, chance: 0.5 },
      { id: 'elementalCore', minQuantity: 1, maxQuantity: 1, chance: 0.3 },
    ],
  },
  // 史诗品质
  4: {
    materials: [
      { id: 'enchantedShard', minQuantity: 2, maxQuantity: 4, chance: 1 },
      { id: 'elementalCore', minQuantity: 1, maxQuantity: 2, chance: 0.5 },
      { id: 'ancientRelic', minQuantity: 1, maxQuantity: 1, chance: 0.2 },
    ],
  },
  // 传说品质
  5: {
    materials: [
      { id: 'elementalCore', minQuantity: 2, maxQuantity: 4, chance: 1 },
      { id: 'ancientRelic', minQuantity: 1, maxQuantity: 2, chance: 0.5 },
      { id: 'legendaryEssence', minQuantity: 1, maxQuantity: 1, chance: 0.1 },
    ],
  },
}; 