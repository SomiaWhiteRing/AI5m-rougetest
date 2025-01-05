import { EffectType } from '../systems/EffectSystem';

export enum SkillType {
  ACTIVE = 'active',
  PASSIVE = 'passive'
}

export enum TargetType {
  SELF = 'self',
  SINGLE = 'single',
  AOE = 'aoe'
}

export interface SkillEffect {
  type: EffectType;
  value: number;
  duration?: number;
  interval?: number;
}

export interface SkillConfig {
  id: string;
  name: string;
  description: string;
  type: SkillType;
  targetType: TargetType;
  damage?: number;
  effects?: SkillEffect[];
  cooldown: number;
  manaCost: number;
  range?: number;
  aoeRadius?: number;
  icon: string;
  animation?: string;
  sound?: string;
  requiredLevel: number;
}

export const SKILLS: Record<string, SkillConfig> = {
  // 基础攻击
  basicAttack: {
    id: 'basicAttack',
    name: '基础攻击',
    description: '对单个目标造成物理伤害',
    type: SkillType.ACTIVE,
    targetType: TargetType.SINGLE,
    damage: 10,
    cooldown: 0,
    manaCost: 0,
    range: 1,
    icon: 'sword',
    requiredLevel: 1
  },

  // 火球术
  fireball: {
    id: 'fireball',
    name: '火球术',
    description: '发射一个火球，造成伤害并施加燃烧效果',
    type: SkillType.ACTIVE,
    targetType: TargetType.SINGLE,
    damage: 20,
    effects: [{
      type: EffectType.BURN,
      value: 5,
      duration: 3000,
      interval: 1000
    }],
    cooldown: 5000,
    manaCost: 20,
    range: 5,
    icon: 'fireball',
    animation: 'fireball',
    sound: 'fireball',
    requiredLevel: 3
  },

  // 治疗术
  heal: {
    id: 'heal',
    name: '治疗术',
    description: '恢复自身生命值',
    type: SkillType.ACTIVE,
    targetType: TargetType.SELF,
    effects: [{
      type: EffectType.HEAL,
      value: 30
    }],
    cooldown: 10000,
    manaCost: 30,
    icon: 'heal',
    animation: 'heal',
    sound: 'heal',
    requiredLevel: 5
  },

  // 护盾术
  shield: {
    id: 'shield',
    name: '护盾术',
    description: '为自身添加一个护盾',
    type: SkillType.ACTIVE,
    targetType: TargetType.SELF,
    effects: [{
      type: EffectType.SHIELD,
      value: 20,
      duration: 5000
    }],
    cooldown: 15000,
    manaCost: 25,
    icon: 'shield',
    animation: 'shield',
    sound: 'shield',
    requiredLevel: 7
  },

  // 冰霜新星
  frostNova: {
    id: 'frostNova',
    name: '冰霜新星',
    description: '对周围敌人造成伤害并减速',
    type: SkillType.ACTIVE,
    targetType: TargetType.AOE,
    damage: 15,
    effects: [{
      type: EffectType.FREEZE,
      value: 0.5,
      duration: 3000
    }],
    cooldown: 12000,
    manaCost: 35,
    aoeRadius: 3,
    icon: 'frost',
    animation: 'frostNova',
    sound: 'frost',
    requiredLevel: 10
  },

  // 生命汲取
  lifeDrain: {
    id: 'lifeDrain',
    name: '生命汲取',
    description: '对敌人造成伤害并回复生命值',
    type: SkillType.ACTIVE,
    targetType: TargetType.SINGLE,
    damage: 25,
    effects: [{
      type: EffectType.HEAL,
      value: 15
    }],
    cooldown: 8000,
    manaCost: 40,
    range: 3,
    icon: 'drain',
    animation: 'lifeDrain',
    sound: 'drain',
    requiredLevel: 12
  }
}; 