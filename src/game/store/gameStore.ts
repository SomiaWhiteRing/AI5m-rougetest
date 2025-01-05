import { create } from 'zustand'
import { LEVEL_CONFIGS } from '../types/level'

interface GameState {
  level: number
  health: number
  maxHealth: number
  attack: number
  defense: number
  experience: number
  score: number
  unlockedSkills: string[]
  setLevel: (level: number) => void
  setHealth: (health: number) => void
  setMaxHealth: (maxHealth: number) => void
  setAttack: (attack: number) => void
  setDefense: (defense: number) => void
  setExperience: (experience: number) => void
  setScore: (score: number) => void
  increaseScore: (amount: number) => void
  takeDamage: (damage: number) => void
  heal: (amount: number) => void
  gainExperience: (amount: number) => void
}

export const useGameStore = create<GameState>((set, get) => ({
  level: 1,
  health: 100,
  maxHealth: 100,
  attack: 10,
  defense: 5,
  experience: 0,
  score: 0,
  unlockedSkills: [],
  setLevel: (level) => set({ level }),
  setHealth: (health) => set({ health }),
  setMaxHealth: (maxHealth) => set({ maxHealth }),
  setAttack: (attack) => set({ attack }),
  setDefense: (defense) => set({ defense }),
  setExperience: (experience) => set({ experience }),
  setScore: (score) => set({ score }),
  increaseScore: (amount) => set((state) => ({ score: state.score + amount })),
  takeDamage: (damage) =>
    set((state) => ({
      health: Math.max(0, state.health - Math.max(0, damage - state.defense))
    })),
  heal: (amount) =>
    set((state) => ({
      health: Math.min(state.maxHealth, state.health + amount)
    })),
  gainExperience: (amount) => {
    const state = get()
    const newExperience = state.experience + amount
    
    // 检查是否可以升级
    const nextLevel = state.level + 1
    const nextLevelConfig = LEVEL_CONFIGS[nextLevel]
    
    if (nextLevelConfig && newExperience >= nextLevelConfig.experienceRequired) {
      // 升级
      const config = nextLevelConfig
      const newUnlockedSkills = [...state.unlockedSkills]
      if (config.skillUnlock) {
        newUnlockedSkills.push(config.skillUnlock)
      }
      
      set({
        level: nextLevel,
        experience: newExperience,
        maxHealth: state.maxHealth + config.healthBonus,
        health: state.maxHealth + config.healthBonus, // 升级时恢复满血
        attack: state.attack + config.attackBonus,
        defense: state.defense + config.defenseBonus,
        unlockedSkills: newUnlockedSkills
      })
      
      // 显示升级效果
      const levelUpText = document.createElement('div')
      levelUpText.className = 'level-up-text'
      levelUpText.textContent = `升级！达到 ${nextLevel} 级`
      if (config.skillUnlock) {
        levelUpText.textContent += `\n解锁技能：${config.skillUnlock}`
      }
      document.body.appendChild(levelUpText)
      
      setTimeout(() => {
        levelUpText.remove()
      }, 3000)
    } else {
      // 只更新经验值
      set({ experience: newExperience })
    }
  }
})) 