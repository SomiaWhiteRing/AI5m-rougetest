import { SkillType, SkillElement, SkillConfig } from '../types/skill'
import { EffectType } from '../systems/EffectSystem'

export const SKILL_CONFIGS: Record<string, SkillConfig> = {
  // 基础攻击技能
  slash: {
    id: 'slash',
    type: SkillType.SLASH,
    name: '斩击',
    description: '对前方敌人造成伤害',
    element: SkillElement.PHYSICAL,
    isPassive: false,
    effects: [{
      type: EffectType.DAMAGE,
      value: 20,
      angle: 60,
      range: 50
    }],
    cooldown: 500,
    manaCost: 0,
    requirements: {
      level: 1
    },
    icon: 'slash',
    animation: 'slash_animation',
    sound: 'slash_sound',
    upgrades: {
      maxLevel: 5,
      effects: [{
        type: EffectType.DAMAGE,
        baseValue: 20,
        increment: 5
      }]
    }
  },

  spin: {
    id: 'spin',
    type: SkillType.SPIN,
    name: '旋风斩',
    description: '对周围敌人造成伤害',
    element: SkillElement.PHYSICAL,
    isPassive: false,
    effects: [{
      type: EffectType.DAMAGE,
      value: 30,
      angle: 360,
      range: 80
    }],
    cooldown: 3000,
    manaCost: 20,
    requirements: {
      level: 3,
      skills: ['slash']
    },
    icon: 'spin',
    animation: 'spin_animation',
    sound: 'spin_sound',
    upgrades: {
      maxLevel: 5,
      effects: [{
        type: EffectType.DAMAGE,
        baseValue: 30,
        increment: 8
      }, {
        type: EffectType.RANGE,
        baseValue: 80,
        increment: 10
      }]
    }
  },

  charge: {
    id: 'charge',
    type: SkillType.CHARGE,
    name: '冲锋',
    description: '快速冲向目标位置并造成伤害',
    element: SkillElement.PHYSICAL,
    isPassive: false,
    effects: [{
      type: EffectType.MOVEMENT,
      value: 400,
      duration: 500
    }, {
      type: EffectType.DAMAGE,
      value: 25,
      range: 40
    }],
    cooldown: 5000,
    manaCost: 15,
    requirements: {
      level: 2
    },
    icon: 'charge',
    animation: 'charge_animation',
    sound: 'charge_sound',
    upgrades: {
      maxLevel: 5,
      effects: [{
        type: EffectType.DAMAGE,
        baseValue: 25,
        increment: 5
      }, {
        type: EffectType.MOVEMENT,
        baseValue: 400,
        increment: 50
      }]
    }
  },

  fireball: {
    id: 'fireball',
    type: SkillType.FIREBALL,
    name: '火球术',
    description: '发射火球造成范围伤害并施加燃烧效果',
    element: SkillElement.FIRE,
    isPassive: false,
    effects: [{
      type: EffectType.DAMAGE,
      value: 40,
      range: 30
    }, {
      type: EffectType.BURN,
      value: 5,
      duration: 3000,
      interval: 500
    }],
    cooldown: 4000,
    manaCost: 30,
    requirements: {
      level: 5,
      stats: {
        intelligence: 15
      }
    },
    icon: 'fireball',
    animation: 'fireball_animation',
    sound: 'fireball_sound',
    upgrades: {
      maxLevel: 5,
      effects: [{
        type: EffectType.DAMAGE,
        baseValue: 40,
        increment: 10
      }, {
        type: EffectType.BURN,
        baseValue: 5,
        increment: 2
      }]
    }
  },

  heal: {
    id: 'heal',
    type: SkillType.HEAL,
    name: '治疗术',
    description: '恢复生命值',
    element: SkillElement.HOLY,
    isPassive: false,
    effects: [{
      type: EffectType.HEAL,
      value: 50
    }],
    cooldown: 10000,
    manaCost: 40,
    requirements: {
      level: 7,
      stats: {
        intelligence: 20
      }
    },
    icon: 'heal',
    animation: 'heal_animation',
    sound: 'heal_sound',
    upgrades: {
      maxLevel: 5,
      effects: [{
        type: EffectType.HEAL,
        baseValue: 50,
        increment: 15
      }]
    }
  },

  shield: {
    id: 'shield',
    type: SkillType.SHIELD,
    name: '护盾术',
    description: '获得一个吸收伤害的护盾',
    element: SkillElement.HOLY,
    isPassive: false,
    effects: [{
      type: EffectType.SHIELD,
      value: 30,
      duration: 5000
    }],
    cooldown: 15000,
    manaCost: 35,
    requirements: {
      level: 4,
      stats: {
        vitality: 15
      }
    },
    icon: 'shield',
    animation: 'shield_animation',
    sound: 'shield_sound',
    upgrades: {
      maxLevel: 5,
      effects: [{
        type: EffectType.SHIELD,
        baseValue: 30,
        increment: 10
      }, {
        type: EffectType.DURATION,
        baseValue: 5000,
        increment: 1000
      }]
    }
  },

  // 被动技能
  strength: {
    id: 'strength',
    type: SkillType.STRENGTH,
    name: '力量强化',
    description: '永久增加攻击力',
    isPassive: true,
    effects: [{
      type: EffectType.BUFF,
      value: 5
    }],
    requirements: {
      level: 2,
      stats: {
        strength: 10
      }
    },
    icon: 'strength',
    upgrades: {
      maxLevel: 5,
      effects: [{
        type: EffectType.BUFF,
        baseValue: 5,
        increment: 2
      }]
    }
  },

  critical: {
    id: 'critical',
    type: SkillType.CRITICAL,
    name: '致命一击',
    description: '增加暴击几率和暴击伤害',
    isPassive: true,
    effects: [{
      type: EffectType.BUFF,
      value: 0.05 // 5%暴击率
    }, {
      type: EffectType.BUFF,
      value: 0.2 // 20%暴击伤害
    }],
    requirements: {
      level: 3,
      stats: {
        agility: 12
      }
    },
    icon: 'critical',
    upgrades: {
      maxLevel: 5,
      effects: [{
        type: EffectType.BUFF,
        baseValue: 0.05,
        increment: 0.01
      }, {
        type: EffectType.BUFF,
        baseValue: 0.2,
        increment: 0.05
      }]
    }
  },

  regeneration: {
    id: 'regeneration',
    type: SkillType.REGENERATION,
    name: '生命恢复',
    description: '每秒恢复生命值',
    isPassive: true,
    effects: [{
      type: EffectType.HEAL,
      value: 1,
      interval: 1000
    }],
    requirements: {
      level: 4,
      stats: {
        vitality: 15
      }
    },
    icon: 'regeneration',
    upgrades: {
      maxLevel: 5,
      effects: [{
        type: EffectType.HEAL,
        baseValue: 1,
        increment: 0.5
      }]
    }
  }
} 