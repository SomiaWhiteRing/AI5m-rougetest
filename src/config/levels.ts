import { EffectType } from '../systems/EffectSystem';

export enum LevelType {
  NORMAL = 'normal',
  ELITE = 'elite',
  BOSS = 'boss'
}

export enum ObjectiveType {
  KILL_ENEMIES = 'kill_enemies',
  COLLECT_ITEMS = 'collect_items',
  SURVIVE_TIME = 'survive_time',
  REACH_EXIT = 'reach_exit'
}

export interface EnemyConfig {
  type: string;
  level: number;
  count: number;
  skills: string[];
  dropRate: number;
  patrolRadius?: number;
}

export interface ItemConfig {
  type: string;
  count: number;
  position?: { x: number; y: number };
}

export interface Objective {
  type: ObjectiveType;
  target: number;
  current: number;
  description: string;
}

export interface Reward {
  experience: number;
  gold: number;
  items?: ItemConfig[];
  skills?: string[];
}

export interface RoomConfig {
  width: number;
  height: number;
  enemies?: EnemyConfig[];
  items?: ItemConfig[];
  obstacles?: { x: number; y: number }[];
  exits?: { x: number; y: number }[];
}

export interface LevelConfig {
  id: string;
  name: string;
  description: string;
  type: LevelType;
  minLevel: number;
  difficulty: number;
  objectives: Objective[];
  rooms: RoomConfig[];
  reward: Reward;
  timeLimit?: number;
  backgroundMusic?: string;
  ambientSounds?: string[];
}

export const LEVELS: Record<string, LevelConfig> = {
  // 新手教程关卡
  tutorial: {
    id: 'tutorial',
    name: '新手教程',
    description: '学习游戏基本操作和战斗技巧',
    type: LevelType.NORMAL,
    minLevel: 1,
    difficulty: 1,
    objectives: [
      {
        type: ObjectiveType.KILL_ENEMIES,
        target: 3,
        current: 0,
        description: '击败3个训练假人'
      },
      {
        type: ObjectiveType.COLLECT_ITEMS,
        target: 2,
        current: 0,
        description: '收集2个治疗药水'
      },
      {
        type: ObjectiveType.REACH_EXIT,
        target: 1,
        current: 0,
        description: '到达出口'
      }
    ],
    rooms: [
      {
        width: 20,
        height: 20,
        enemies: [
          {
            type: 'dummy',
            level: 1,
            count: 3,
            skills: ['basicAttack'],
            dropRate: 0.5
          }
        ],
        items: [
          {
            type: 'healthPotion',
            count: 2
          }
        ],
        obstacles: [
          { x: 5, y: 5 },
          { x: 15, y: 15 }
        ],
        exits: [
          { x: 19, y: 19 }
        ]
      }
    ],
    reward: {
      experience: 100,
      gold: 50,
      items: [
        {
          type: 'woodenSword',
          count: 1
        }
      ],
      skills: ['fireball']
    },
    backgroundMusic: 'tutorial_bgm',
    ambientSounds: ['wind', 'birds']
  },

  // 第一关：森林探索
  forest: {
    id: 'forest',
    name: '迷雾森林',
    description: '探索充满危险的森林，击败潜伏的敌人',
    type: LevelType.NORMAL,
    minLevel: 2,
    difficulty: 2,
    objectives: [
      {
        type: ObjectiveType.KILL_ENEMIES,
        target: 10,
        current: 0,
        description: '击败10个森林生物'
      },
      {
        type: ObjectiveType.COLLECT_ITEMS,
        target: 5,
        current: 0,
        description: '收集5个魔法水晶'
      }
    ],
    rooms: [
      {
        width: 30,
        height: 30,
        enemies: [
          {
            type: 'wolf',
            level: 2,
            count: 5,
            skills: ['basicAttack', 'bite'],
            dropRate: 0.3,
            patrolRadius: 5
          },
          {
            type: 'goblin',
            level: 2,
            count: 5,
            skills: ['basicAttack', 'throw'],
            dropRate: 0.4
          }
        ],
        items: [
          {
            type: 'magicCrystal',
            count: 5
          },
          {
            type: 'healthPotion',
            count: 3
          }
        ],
        obstacles: [
          { x: 10, y: 10 },
          { x: 20, y: 20 },
          { x: 15, y: 25 }
        ]
      }
    ],
    reward: {
      experience: 300,
      gold: 150,
      items: [
        {
          type: 'leatherArmor',
          count: 1
        },
        {
          type: 'magicRing',
          count: 1
        }
      ],
      skills: ['heal']
    },
    timeLimit: 600000, // 10分钟
    backgroundMusic: 'forest_bgm',
    ambientSounds: ['wind', 'leaves', 'birds']
  },

  // Boss关卡：森林之王
  forestKing: {
    id: 'forestKing',
    name: '森林之王的挑战',
    description: '挑战强大的森林之王，获得丰厚奖励',
    type: LevelType.BOSS,
    minLevel: 5,
    difficulty: 5,
    objectives: [
      {
        type: ObjectiveType.KILL_ENEMIES,
        target: 1,
        current: 0,
        description: '击败森林之王'
      }
    ],
    rooms: [
      {
        width: 40,
        height: 40,
        enemies: [
          {
            type: 'forestKing',
            level: 5,
            count: 1,
            skills: ['basicAttack', 'slam', 'summonMinions', 'heal'],
            dropRate: 1
          }
        ],
        items: [
          {
            type: 'healthPotion',
            count: 5
          },
          {
            type: 'manaPotion',
            count: 3
          }
        ]
      }
    ],
    reward: {
      experience: 1000,
      gold: 500,
      items: [
        {
          type: 'forestKingCrown',
          count: 1
        },
        {
          type: 'legendaryWeapon',
          count: 1
        }
      ],
      skills: ['natureFury']
    },
    timeLimit: 300000, // 5分钟
    backgroundMusic: 'boss_bgm',
    ambientSounds: ['thunder', 'wind', 'roar']
  }
}; 