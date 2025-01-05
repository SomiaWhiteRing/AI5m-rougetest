export interface CombatStats {
  health: number
  maxHealth: number
  mana: number
  maxMana: number
  attack: number
  defense: number
  speed: number
  criticalChance: number
  criticalDamage: number
  dodgeChance: number
  shield: number
}

export interface DamageOptions {
  isCritical?: boolean
  isPiercing?: boolean
  isTrue?: boolean
  element?: string
  source?: any
}

export interface DamageResult {
  damage: number
  isCritical: boolean
  isDodged: boolean
  isBlocked: boolean
  remainingShield: number
}

export interface HealOptions {
  isOverheal?: boolean
  source?: any
}

export interface HealResult {
  heal: number
  overHeal: number
}

export interface StatusEffect {
  type: string
  value: number
  duration: number
  interval?: number
  source?: any
  lastTick?: number
}

export interface CombatEvent {
  type: string
  source?: any
  target: any
  value: number
  options?: any
  result?: any
}

export interface CombatEventListener {
  (event: CombatEvent): void
} 