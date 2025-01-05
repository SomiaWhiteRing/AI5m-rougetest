import { describe, it, expect, beforeEach } from 'vitest'
import { Scene } from 'phaser'
import { Player } from '../game/entities/Player'
import { Enemy } from '../game/entities/Enemy'
import { Item } from '../game/entities/Item'
import { ENEMY_CONFIGS } from '../game/types/enemy'
import { ITEM_CONFIGS } from '../game/types/item'
import { GameState } from '../game/states/GameState'
import { SaveManager } from '../game/utils/SaveManager'
import { AudioManager } from '../game/utils/AudioManager'

class MockScene extends Scene {
  constructor() {
    super({ key: 'MockScene' })
  }

  create() {
    // 空实现
  }
}

describe('Game Integration Tests', () => {
  let scene: Scene
  let gameState: GameState
  let player: Player
  let saveManager: SaveManager
  let audioManager: AudioManager

  beforeEach(() => {
    scene = new MockScene()
    gameState = new GameState()
    player = new Player(scene, 0, 0)
    saveManager = new SaveManager()
    audioManager = new AudioManager(scene)
  })

  describe('Combat System Integration', () => {
    it('should handle complete combat sequence', () => {
      const enemy = new Enemy(scene, 100, 100, ENEMY_CONFIGS.slime)
      const initialPlayerHealth = player.getState().health
      const initialEnemyHealth = enemy.getState().health

      // 玩家攻击敌人
      player.attack(enemy)
      expect(enemy.getState().health).toBeLessThan(initialEnemyHealth)

      // 敌人反击
      enemy.attack(player)
      expect(player.getState().health).toBeLessThan(initialPlayerHealth)

      // 玩家使用治疗道具
      const healthPotion = new Item(scene, 0, 0, ITEM_CONFIGS.health_potion)
      player.useItem(healthPotion)
      expect(player.getState().health).toBeGreaterThan(initialPlayerHealth - enemy.getState().attack)

      // 击败敌人
      while (enemy.getState().health > 0) {
        player.attack(enemy)
      }
      expect(enemy.getState().health).toBe(0)
      expect(enemy.isDead()).toBe(true)
    })
  })

  describe('Save System Integration', () => {
    it('should save and load game state correctly', () => {
      // 设置初始游戏状态
      player.gainExperience(1000)
      player.addGold(500)
      const initialState = {
        player: player.getState(),
        gameState: gameState.getState()
      }

      // 保存游戏
      saveManager.saveGame(initialState)

      // 加载游戏
      const loadedState = saveManager.loadGame()
      expect(loadedState.player.experience).toBe(initialState.player.experience)
      expect(loadedState.player.gold).toBe(initialState.player.gold)
      expect(loadedState.gameState).toEqual(initialState.gameState)
    })
  })

  describe('Audio System Integration', () => {
    it('should handle audio events correctly', () => {
      // 播放背景音乐
      audioManager.playMusic('background')
      expect(audioManager.isMusicPlaying('background')).toBe(true)

      // 播放效果音
      audioManager.playSound('attack')
      expect(audioManager.isSoundPlayed('attack')).toBe(true)

      // 调整音量
      audioManager.setMusicVolume(0.5)
      expect(audioManager.getMusicVolume()).toBe(0.5)

      // 静音
      audioManager.mute()
      expect(audioManager.isMuted()).toBe(true)
    })
  })

  describe('Game Flow Integration', () => {
    it('should handle complete game flow sequence', () => {
      // 初始化新游戏
      gameState.startNewGame()
      expect(gameState.isGameStarted()).toBe(true)

      // 玩家升级
      const initialLevel = player.getState().level
      player.gainExperience(1000)
      expect(player.getState().level).toBeGreaterThan(initialLevel)

      // 收集物品
      const item = new Item(scene, 0, 0, ITEM_CONFIGS.health_potion)
      player.collectItem(item)
      expect(player.hasItem(item.getConfig().id)).toBe(true)

      // 使用物品
      player.useItem(item)
      expect(player.hasItem(item.getConfig().id)).toBe(false)

      // 保存进度
      saveManager.saveGame({
        player: player.getState(),
        gameState: gameState.getState()
      })

      // 游戏结束
      gameState.endGame()
      expect(gameState.isGameOver()).toBe(true)
    })
  })

  describe('Error Handling Integration', () => {
    it('should handle invalid operations gracefully', () => {
      // 测试使用不存在的物品
      expect(() => player.useItem(null)).not.toThrow()

      // 测试无效的存档数据
      expect(() => saveManager.loadGame('invalid_save')).not.toThrow()

      // 测试无效的音频操作
      expect(() => audioManager.playSound('invalid_sound')).not.toThrow()

      // 测试无效的游戏状态转换
      expect(() => gameState.endGame()).not.toThrow()
    })
  })
}) 