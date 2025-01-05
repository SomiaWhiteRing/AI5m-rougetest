import { create } from 'zustand'

interface GameState {
  level: number
  health: number
  maxHealth: number
  attack: number
  defense: number
  experience: number
  score: number
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
}

export const useGameStore = create<GameState>((set) => ({
  level: 1,
  health: 100,
  maxHealth: 100,
  attack: 10,
  defense: 5,
  experience: 0,
  score: 0,
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
    }))
})) 