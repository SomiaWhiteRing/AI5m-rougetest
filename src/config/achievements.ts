export enum AchievementCategory {
  COMBAT = '战斗',
  EXPLORATION = '探索',
  COLLECTION = '收集',
  PROGRESSION = '进度',
  CHALLENGE = '挑战'
}

export interface AchievementReward {
  experience?: number;
  gold?: number;
  items?: Array<{
    type: string;
    count: number;
  }>;
  skills?: string[];
  stats?: {
    [key: string]: number;
  };
}

export interface AchievementConfig {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  icon: string;
  requirement: {
    type: string;
    target: number;
  };
  reward: AchievementReward;
  secret?: boolean;
  prerequisite?: string[];
}

export const ACHIEVEMENTS: Record<string, AchievementConfig> = {
  // 战斗成就
  firstBlood: {
    id: 'firstBlood',
    name: '初次击杀',
    description: '击败第一个敌人',
    category: AchievementCategory.COMBAT,
    icon: 'sword',
    requirement: {
      type: 'killEnemies',
      target: 1,
    },
    reward: {
      experience: 100,
      gold: 50,
    },
  },

  warrior: {
    id: 'warrior',
    name: '战士之路',
    description: '击败100个敌人',
    category: AchievementCategory.COMBAT,
    icon: 'warrior',
    requirement: {
      type: 'killEnemies',
      target: 100,
    },
    reward: {
      experience: 1000,
      gold: 500,
      items: [
        {
          type: 'warriorArmor',
          count: 1,
        },
      ],
    },
  },

  // 探索成就
  explorer: {
    id: 'explorer',
    name: '探索者',
    description: '探索10个区域',
    category: AchievementCategory.EXPLORATION,
    icon: 'map',
    requirement: {
      type: 'exploreAreas',
      target: 10,
    },
    reward: {
      experience: 500,
      gold: 200,
    },
  },

  // 收集成就
  collector: {
    id: 'collector',
    name: '收藏家',
    description: '收集100种不同的物品',
    category: AchievementCategory.COLLECTION,
    icon: 'bag',
    requirement: {
      type: 'collectItems',
      target: 100,
    },
    reward: {
      experience: 1500,
      gold: 2000,
      items: [
        {
          type: 'collectorRing',
          count: 1,
        },
      ],
    },
  },

  // 进度成就
  levelMaster: {
    id: 'levelMaster',
    name: '等级大师',
    description: '达到50级',
    category: AchievementCategory.PROGRESSION,
    icon: 'star',
    requirement: {
      type: 'reachLevel',
      target: 50,
    },
    reward: {
      experience: 5000,
      gold: 5000,
      items: [
        {
          type: 'masterScroll',
          count: 1,
        },
      ],
      stats: {
        maxHp: 100,
        maxMana: 50,
      },
    },
  },

  // 挑战成就
  speedRunner: {
    id: 'speedRunner',
    name: '速通大师',
    description: '在10分钟内完成一个关卡',
    category: AchievementCategory.CHALLENGE,
    icon: 'clock',
    requirement: {
      type: 'speedrunLevel',
      target: 1,
    },
    reward: {
      experience: 1000,
      gold: 1000,
      items: [
        {
          type: 'swiftBoots',
          count: 1,
        },
      ],
    },
  },
};