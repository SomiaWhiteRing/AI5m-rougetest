import { CombatStats } from './combat'
import { SkillConfig } from './skill'
import { ItemConfig } from './item'

export interface PlayerState {
  id: string
  name: string
  level: number
  experience: number
  maxExperience: number
  stats: CombatStats
  skills: SkillConfig[]
  skillCooldowns: Record<string, number>
  inventory: ItemConfig[]
  equipment: Record<string, ItemConfig>
  gold: number
  statusEffects: any[]
}

export interface EnemyState {
  id: string
  type: string
  level: number
  stats: CombatStats
  position: {
    x: number
    y: number
  }
  statusEffects: any[]
}

export interface DungeonState {
  level: number
  rooms: {
    id: string
    type: string
    position: {
      x: number
      y: number
    }
    width: number
    height: number
    doors: {
      position: {
        x: number
        y: number
      }
      connected: string
    }[]
    enemies: string[]
    items: string[]
  }[]
  currentRoom: string
}

export interface GameState {
  player: PlayerState
  enemies: Record<string, EnemyState>
  dungeon: DungeonState
  score: number
  time: number
  difficulty: number
  achievements: string[]
  settings: {
    soundVolume: number
    musicVolume: number
    particleEffects: boolean
    screenShake: boolean
    autoSave: boolean
  }
} 