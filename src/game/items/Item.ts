import { Scene } from 'phaser'
import { Player } from '../entities/Player'

export interface ItemConfig {
  id: string
  name: string
  description: string
  type: 'consumable' | 'equipment' | 'material'
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  stackable: boolean
  maxStack: number
  value: number
  effects?: {
    health?: number
    damage?: number
    defense?: number
    speed?: number
  }
}

export class Item extends Phaser.Physics.Arcade.Sprite {
  private config: ItemConfig
  private isPickedUp: boolean = false

  constructor(scene: Scene, x: number, y: number, config: ItemConfig) {
    super(scene, x, y, 'items')
    this.config = config

    // 添加到场景
    scene.add.existing(this)
    scene.physics.add.existing(this)

    // 设置物理属性
    this.setCollideWorldBounds(true)
    this.setBounce(0.2)
    this.setDrag(100)

    // 设置动画帧
    this.setFrame(this.getFrameByRarity())
  }

  pickup(player: Player): void {
    if (this.isPickedUp) return

    // 根据物品类型处理效果
    if (this.config.type === 'consumable') {
      this.applyEffects(player)
    }

    // 标记为已拾取
    this.isPickedUp = true

    // 播放拾取音效
    this.scene.sound.play('pickup')

    // 销毁物品精灵
    this.destroy()
  }

  private applyEffects(player: Player): void {
    if (!this.config.effects) return

    if (this.config.effects.health) {
      player.heal(this.config.effects.health)
    }
  }

  private getFrameByRarity(): number {
    switch (this.config.rarity) {
      case 'common':
        return 0
      case 'uncommon':
        return 1
      case 'rare':
        return 2
      case 'epic':
        return 3
      case 'legendary':
        return 4
      default:
        return 0
    }
  }

  // Getters
  getId(): string {
    return this.config.id
  }

  getName(): string {
    return this.config.name
  }

  getDescription(): string {
    return this.config.description
  }

  getType(): string {
    return this.config.type
  }

  getRarity(): string {
    return this.config.rarity
  }

  getValue(): number {
    return this.config.value
  }

  isStackable(): boolean {
    return this.config.stackable
  }

  getMaxStack(): number {
    return this.config.maxStack
  }

  getEffects(): ItemConfig['effects'] | undefined {
    return this.config.effects
  }
} 