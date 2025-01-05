import { Scene } from 'phaser'
import { Player } from '../entities/Player'

export class UIScene extends Scene {
  private healthText!: Phaser.GameObjects.Text
  private levelText!: Phaser.GameObjects.Text
  private goldText!: Phaser.GameObjects.Text
  private experienceBar!: Phaser.GameObjects.Graphics
  private healthBar!: Phaser.GameObjects.Graphics
  private player!: Player

  constructor() {
    super({ key: 'UIScene' })
  }

  create(): void {
    // 获取玩家引用
    const gameScene = this.scene.get('GameScene')
    this.player = (gameScene as any).player

    // 创建UI元素
    this.createHealthBar()
    this.createExperienceBar()
    this.createTexts()

    // 设置场景为固定位置
    this.scene.setVisible(true)
    this.scene.bringToTop()
  }

  update(): void {
    // 更新UI显示
    this.updateHealthBar()
    this.updateExperienceBar()
    this.updateTexts()
  }

  private createHealthBar(): void {
    this.healthBar = this.add.graphics()
    this.healthBar.setScrollFactor(0)
    this.updateHealthBar()
  }

  private updateHealthBar(): void {
    this.healthBar.clear()

    // 绘制背景
    this.healthBar.fillStyle(0x000000, 0.5)
    this.healthBar.fillRect(10, 10, 200, 20)

    // 计算血量百分比
    const healthPercent = this.player.health / this.player.maxHealth
    
    // 绘制血量条
    this.healthBar.fillStyle(0xff0000, 1)
    this.healthBar.fillRect(10, 10, 200 * healthPercent, 20)
  }

  private createExperienceBar(): void {
    this.experienceBar = this.add.graphics()
    this.experienceBar.setScrollFactor(0)
    this.updateExperienceBar()
  }

  private updateExperienceBar(): void {
    this.experienceBar.clear()

    // 绘制背景
    this.experienceBar.fillStyle(0x000000, 0.5)
    this.experienceBar.fillRect(10, 40, 200, 10)

    // 计算经验值百分比
    const expPercent = this.player.experience / this.player.experienceToNextLevel
    
    // 绘制经验条
    this.experienceBar.fillStyle(0x00ff00, 1)
    this.experienceBar.fillRect(10, 40, 200 * expPercent, 10)
  }

  private createTexts(): void {
    // 创建等级文本
    this.levelText = this.add.text(220, 10, '', {
      fontSize: '16px',
      color: '#ffffff'
    })
    this.levelText.setScrollFactor(0)

    // 创建生命值文本
    this.healthText = this.add.text(220, 30, '', {
      fontSize: '16px',
      color: '#ffffff'
    })
    this.healthText.setScrollFactor(0)

    // 创建金币文本
    this.goldText = this.add.text(10, 60, '', {
      fontSize: '16px',
      color: '#ffff00'
    })
    this.goldText.setScrollFactor(0)

    this.updateTexts()
  }

  private updateTexts(): void {
    // 更新等级文本
    this.levelText.setText(`Level: ${this.player.level}`)

    // 更新生命值文本
    this.healthText.setText(`HP: ${Math.floor(this.player.health)}/${this.player.maxHealth}`)

    // 更新金币文本
    this.goldText.setText(`Gold: ${this.player.gold}`)
  }
} 