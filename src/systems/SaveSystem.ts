import { GameState } from '../types/game'

export class SaveSystem {
  private static instance: SaveSystem
  private readonly SAVE_KEY = 'roguelike_save'
  private readonly AUTO_SAVE_INTERVAL = 5 * 60 * 1000 // 5分钟
  private autoSaveTimer: number | null = null

  private constructor() {
    this.startAutoSave()
  }

  static getInstance(): SaveSystem {
    if (!SaveSystem.instance) {
      SaveSystem.instance = new SaveSystem()
    }
    return SaveSystem.instance
  }

  private startAutoSave() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer)
    }

    this.autoSaveTimer = window.setInterval(() => {
      this.autoSave()
    }, this.AUTO_SAVE_INTERVAL)
  }

  private stopAutoSave() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer)
      this.autoSaveTimer = null
    }
  }

  private autoSave() {
    try {
      const gameState = this.getCurrentGameState()
      if (gameState) {
        this.saveGame(gameState, 'auto')
      }
    } catch (error) {
      console.error('自动保存失败:', error)
    }
  }

  private getCurrentGameState(): GameState | null {
    try {
      // TODO: 从游戏状态管理器获取当前状态
      return null
    } catch (error) {
      console.error('获取游戏状态失败:', error)
      return null
    }
  }

  saveGame(state: GameState, slot: string = 'manual'): boolean {
    try {
      const saves = this.getAllSaves()
      saves[slot] = {
        state,
        timestamp: Date.now(),
        version: process.env.VITE_APP_VERSION || '1.0.0'
      }
      localStorage.setItem(this.SAVE_KEY, JSON.stringify(saves))
      return true
    } catch (error) {
      console.error('保存游戏失败:', error)
      return false
    }
  }

  loadGame(slot: string = 'manual'): GameState | null {
    try {
      const saves = this.getAllSaves()
      const save = saves[slot]
      if (!save) return null

      // 检查版本兼容性
      if (!this.isVersionCompatible(save.version)) {
        console.warn('存档版本不兼容')
        return null
      }

      return save.state
    } catch (error) {
      console.error('加载游戏失败:', error)
      return null
    }
  }

  getAllSaves(): Record<string, SaveData> {
    try {
      const savesJson = localStorage.getItem(this.SAVE_KEY)
      return savesJson ? JSON.parse(savesJson) : {}
    } catch (error) {
      console.error('获取存档列表失败:', error)
      return {}
    }
  }

  deleteSave(slot: string): boolean {
    try {
      const saves = this.getAllSaves()
      if (saves[slot]) {
        delete saves[slot]
        localStorage.setItem(this.SAVE_KEY, JSON.stringify(saves))
        return true
      }
      return false
    } catch (error) {
      console.error('删除存档失败:', error)
      return false
    }
  }

  clearAllSaves(): boolean {
    try {
      localStorage.removeItem(this.SAVE_KEY)
      return true
    } catch (error) {
      console.error('清除所有存档失败:', error)
      return false
    }
  }

  private isVersionCompatible(saveVersion: string): boolean {
    const currentVersion = process.env.VITE_APP_VERSION || '1.0.0'
    const [saveMajor, saveMinor] = saveVersion.split('.').map(Number)
    const [currentMajor, currentMinor] = currentVersion.split('.').map(Number)

    // 主版本号必须相同，次版本号可以更高
    return saveMajor === currentMajor && saveMinor <= currentMinor
  }

  exportSave(slot: string): string | null {
    try {
      const save = this.loadGame(slot)
      if (!save) return null
      return btoa(JSON.stringify(save))
    } catch (error) {
      console.error('导出存档失败:', error)
      return null
    }
  }

  importSave(data: string, slot: string = 'import'): boolean {
    try {
      const state = JSON.parse(atob(data))
      return this.saveGame(state, slot)
    } catch (error) {
      console.error('导入存档失败:', error)
      return false
    }
  }
}

interface SaveData {
  state: GameState
  timestamp: number
  version: string
} 