export enum SkillType {
  SLASH = 'SLASH',
  SPIN = 'SPIN',
  CHARGE = 'CHARGE',
  FIREBALL = 'FIREBALL',
  HEAL = 'HEAL',
  SHIELD = 'SHIELD',
  STRENGTH = 'STRENGTH',
  CRITICAL = 'CRITICAL',
  REGENERATION = 'REGENERATION'
}

export enum SkillElement {
  PHYSICAL = 'PHYSICAL',
  FIRE = 'FIRE',
  ICE = 'ICE',
  LIGHTNING = 'LIGHTNING',
  HOLY = 'HOLY',
  DARK = 'DARK'
}

export interface SkillEffect {
  type: string
  value: number
  angle?: number
  range?: number
  duration?: number
  interval?: number
}

export interface SkillUpgradeEffect {
  type: string
  baseValue: number
  increment: number
}

export interface SkillUpgrade {
  maxLevel: number
  effects: SkillUpgradeEffect[]
}

export interface SkillRequirements {
  level: number
  skills?: string[]
  stats?: {
    strength?: number
    agility?: number
    intelligence?: number
    vitality?: number
  }
}

export interface SkillConfig {
  id: string
  type: SkillType
  name: string
  description: string
  element?: SkillElement
  isPassive: boolean
  effects: SkillEffect[]
  cooldown?: number
  manaCost?: number
  requirements: SkillRequirements
  icon: string
  animation?: string
  sound?: string
  upgrades: SkillUpgrade
} 