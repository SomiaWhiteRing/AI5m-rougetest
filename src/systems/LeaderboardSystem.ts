export interface LeaderboardEntry {
  playerName: string
  score: number
  level: number
  time: number
  date: number
}

export class LeaderboardSystem {
  private static instance: LeaderboardSystem
  private readonly STORAGE_KEY = 'roguelike_leaderboard'
  private readonly MAX_ENTRIES = 100
  private entries: LeaderboardEntry[] = []

  private constructor() {
    this.loadEntries()
  }

  static getInstance(): LeaderboardSystem {
    if (!LeaderboardSystem.instance) {
      LeaderboardSystem.instance = new LeaderboardSystem()
    }
    return LeaderboardSystem.instance
  }

  private loadEntries() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY)
      if (saved) {
        this.entries = JSON.parse(saved)
      }
    } catch (error) {
      console.error('加载排行榜数据失败:', error)
    }
  }

  private saveEntries() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.entries))
    } catch (error) {
      console.error('保存排行榜数据失败:', error)
    }
  }

  addEntry(entry: LeaderboardEntry) {
    this.entries.push(entry)
    this.entries.sort((a, b) => b.score - a.score)
    if (this.entries.length > this.MAX_ENTRIES) {
      this.entries = this.entries.slice(0, this.MAX_ENTRIES)
    }
    this.saveEntries()
  }

  getEntries(start: number = 0, count: number = 10): LeaderboardEntry[] {
    return this.entries.slice(start, start + count)
  }

  getPlayerRank(playerName: string): number {
    return this.entries.findIndex(entry => entry.playerName === playerName) + 1
  }

  getTopScores(count: number = 10): LeaderboardEntry[] {
    return this.entries.slice(0, count)
  }

  clearEntries() {
    this.entries = []
    this.saveEntries()
  }

  getTotalEntries(): number {
    return this.entries.length
  }

  isHighScore(score: number): boolean {
    if (this.entries.length < this.MAX_ENTRIES) return true
    return score > (this.entries[this.entries.length - 1]?.score || 0)
  }
} 