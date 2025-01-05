import { EffectType } from '../systems/EffectSystem';

export enum EnemyType {
  NORMAL = 'normal',
  ELITE = 'elite',
  BOSS = 'boss'
}

export interface EnemyStats {
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  attack: number;
  defense: number;
  speed: number;
  critRate: number;
  critDamage: number;
}

export interface EnemyDrop {
  itemId: string;
  chance: number;
  minCount: number;
  maxCount: number;
}

export interface EnemyConfig {
  id: string;
  name: string;
  description: string;
  type: EnemyType;
  level: number;
  stats: EnemyStats;
  skills: string[];
  drops: EnemyDrop[];
  experience: number;
  gold: number;
  sprite: string;
  animations?: {
    idle: string;
    walk: string;
    attack: string;
    hurt: string;
    death: string;
    [key: string]: string;
  };
  ai?: {
    aggroRange: number;
    patrolRange: number;
    retreatHealth: number;
    skillPreferences: Array<{
      skillId: string;
      weight: number;
    }>;
  };
}

export const ENEMIES: Record<string, EnemyConfig> = {
  // 普通敌人
  slime: {
    id: 'slime',
    name: '史莱姆',
    description: '一只普通的史莱姆，弱小但数量众多',
    type: EnemyType.NORMAL,
    level: 1,
    stats: {
      hp: 50,
      maxHp: 50,
      mana: 20,
      maxMana: 20,
      attack: 5,
      defense: 2,
      speed: 80,
      critRate: 0.05,
      critDamage: 1.5
    },
    skills: ['basicAttack'],
    drops: [
      {
        itemId: 'slimeGel',
        chance: 0.8,
        minCount: 1,
        maxCount: 3
      }
    ],
    experience: 10,
    gold: 5,
    sprite: 'slime',
    animations: {
      idle: 'slime_idle',
      walk: 'slime_walk',
      attack: 'slime_attack',
      hurt: 'slime_hurt',
      death: 'slime_death'
    },
    ai: {
      aggroRange: 150,
      patrolRange: 100,
      retreatHealth: 0.2,
      skillPreferences: [
        {
          skillId: 'basicAttack',
          weight: 1
        }
      ]
    }
  },

  // 精英敌人
  fireElemental: {
    id: 'fireElemental',
    name: '火元素',
    description: '由纯粹的火焰构成的元素生物，能够使用强大的火焰魔法',
    type: EnemyType.ELITE,
    level: 5,
    stats: {
      hp: 200,
      maxHp: 200,
      mana: 100,
      maxMana: 100,
      attack: 15,
      defense: 8,
      speed: 100,
      critRate: 0.1,
      critDamage: 1.8
    },
    skills: ['basicAttack', 'fireball', 'fireNova'],
    drops: [
      {
        itemId: 'fireEssence',
        chance: 0.6,
        minCount: 1,
        maxCount: 2
      },
      {
        itemId: 'fireStaff',
        chance: 0.1,
        minCount: 1,
        maxCount: 1
      }
    ],
    experience: 50,
    gold: 30,
    sprite: 'fireElemental',
    animations: {
      idle: 'fireElemental_idle',
      walk: 'fireElemental_walk',
      attack: 'fireElemental_attack',
      cast: 'fireElemental_cast',
      hurt: 'fireElemental_hurt',
      death: 'fireElemental_death'
    },
    ai: {
      aggroRange: 250,
      patrolRange: 150,
      retreatHealth: 0.3,
      skillPreferences: [
        {
          skillId: 'fireball',
          weight: 2
        },
        {
          skillId: 'fireNova',
          weight: 1
        },
        {
          skillId: 'basicAttack',
          weight: 0.5
        }
      ]
    }
  },

  // Boss敌人
  forestGuardian: {
    id: 'forestGuardian',
    name: '森林守护者',
    description: '守护森林的远古生物，拥有强大的自然魔法和再生能力',
    type: EnemyType.BOSS,
    level: 10,
    stats: {
      hp: 1000,
      maxHp: 1000,
      mana: 200,
      maxMana: 200,
      attack: 30,
      defense: 20,
      speed: 120,
      critRate: 0.15,
      critDamage: 2.0
    },
    skills: [
      'basicAttack',
      'natureFury',
      'rootGrasp',
      'healingBloom',
      'summonTreent'
    ],
    drops: [
      {
        itemId: 'guardianCore',
        chance: 1,
        minCount: 1,
        maxCount: 1
      },
      {
        itemId: 'ancientWood',
        chance: 0.8,
        minCount: 2,
        maxCount: 5
      },
      {
        itemId: 'natureTome',
        chance: 0.3,
        minCount: 1,
        maxCount: 1
      }
    ],
    experience: 500,
    gold: 200,
    sprite: 'forestGuardian',
    animations: {
      idle: 'forestGuardian_idle',
      walk: 'forestGuardian_walk',
      attack: 'forestGuardian_attack',
      cast: 'forestGuardian_cast',
      summon: 'forestGuardian_summon',
      hurt: 'forestGuardian_hurt',
      death: 'forestGuardian_death'
    },
    ai: {
      aggroRange: 300,
      patrolRange: 200,
      retreatHealth: 0.4,
      skillPreferences: [
        {
          skillId: 'natureFury',
          weight: 2
        },
        {
          skillId: 'rootGrasp',
          weight: 1.5
        },
        {
          skillId: 'summonTreent',
          weight: 1
        },
        {
          skillId: 'healingBloom',
          weight: 2
        },
        {
          skillId: 'basicAttack',
          weight: 0.5
        }
      ]
    }
  },

  // 更多敌人类型...
  iceGolem: {
    id: 'iceGolem',
    name: '冰霜巨人',
    description: '由永恒冰晶构成的巨人，能够操控冰霜魔法',
    type: EnemyType.ELITE,
    level: 7,
    stats: {
      hp: 300,
      maxHp: 300,
      mana: 150,
      maxMana: 150,
      attack: 20,
      defense: 15,
      speed: 70,
      critRate: 0.08,
      critDamage: 1.6
    },
    skills: ['basicAttack', 'frostBolt', 'iceBarrier', 'blizzard'],
    drops: [
      {
        itemId: 'frozenCore',
        chance: 0.7,
        minCount: 1,
        maxCount: 2
      },
      {
        itemId: 'iceArmor',
        chance: 0.15,
        minCount: 1,
        maxCount: 1
      }
    ],
    experience: 80,
    gold: 45,
    sprite: 'iceGolem',
    animations: {
      idle: 'iceGolem_idle',
      walk: 'iceGolem_walk',
      attack: 'iceGolem_attack',
      cast: 'iceGolem_cast',
      hurt: 'iceGolem_hurt',
      death: 'iceGolem_death'
    },
    ai: {
      aggroRange: 200,
      patrolRange: 100,
      retreatHealth: 0.35,
      skillPreferences: [
        {
          skillId: 'frostBolt',
          weight: 1.5
        },
        {
          skillId: 'iceBarrier',
          weight: 1
        },
        {
          skillId: 'blizzard',
          weight: 0.8
        },
        {
          skillId: 'basicAttack',
          weight: 0.7
        }
      ]
    }
  },

  shadowAssassin: {
    id: 'shadowAssassin',
    name: '暗影刺客',
    description: '潜伏在阴影中的敏捷刺客，擅长突袭和隐身',
    type: EnemyType.ELITE,
    level: 6,
    stats: {
      hp: 150,
      maxHp: 150,
      mana: 80,
      maxMana: 80,
      attack: 25,
      defense: 5,
      speed: 150,
      critRate: 0.25,
      critDamage: 2.2
    },
    skills: ['basicAttack', 'shadowStrike', 'vanish', 'poisonBlade'],
    drops: [
      {
        itemId: 'shadowEssence',
        chance: 0.6,
        minCount: 1,
        maxCount: 3
      },
      {
        itemId: 'assassinDagger',
        chance: 0.12,
        minCount: 1,
        maxCount: 1
      }
    ],
    experience: 60,
    gold: 40,
    sprite: 'shadowAssassin',
    animations: {
      idle: 'shadowAssassin_idle',
      walk: 'shadowAssassin_walk',
      attack: 'shadowAssassin_attack',
      stealth: 'shadowAssassin_stealth',
      hurt: 'shadowAssassin_hurt',
      death: 'shadowAssassin_death'
    },
    ai: {
      aggroRange: 180,
      patrolRange: 150,
      retreatHealth: 0.25,
      skillPreferences: [
        {
          skillId: 'vanish',
          weight: 1.2
        },
        {
          skillId: 'shadowStrike',
          weight: 2
        },
        {
          skillId: 'poisonBlade',
          weight: 1.5
        },
        {
          skillId: 'basicAttack',
          weight: 0.8
        }
      ]
    }
  }
}; 