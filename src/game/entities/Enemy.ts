import { Scene } from 'phaser'
import { EnemyConfig } from '../types/enemy'
import { Player } from './Player'

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  private config: EnemyConfig
  private health: number
  private target: Player | null = null
  private aggroRange: number = 200
  private attackRange: number = 50
  private attackCooldown: number = 1000
  private lastAttackTime: number = 0
  private isDead: boolean = false

  constructor(scene: Scene, x: number, y: number, config: EnemyConfig) {
    super(scene, x, y, 'enemies', 0)

    this.config = config
    this.health = config.health

    scene.add.existing(this)
    scene.physics.add.existing(this)

    // 设置物理属性
    this.setCollideWorldBounds(true)
    this.setBounce(0)
    this.setDrag(1000)
  }

  setTarget(player: Player): void {
    this.target = player
  }

  getHealth(): number {
    return this.health
  }

  takeDamage(amount: number): void {
    this.health = Math.max(0, this.health - amount)
    if (this.health === 0 && !this.isDead) {
      this.die()
    }
  }

  private die(): void {
    this.isDead = true
    if (this.target) {
      this.target.gainExperience(this.config.experience)
      this.target.gainGold(this.config.gold)
    }
    this.destroy()
  }

  update(time: number): void {
    if (this.isDead || !this.target) return

    const distance = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      this.target.x,
      this.target.y
    )

    if (distance <= this.aggroRange) {
      if (distance <= this.attackRange) {
        // 在攻击范围内
        if (time - this.lastAttackTime >= this.attackCooldown) {
          this.attack()
          this.lastAttackTime = time
        }
      } else {
        // 追逐玩家
        const angle = Phaser.Math.Angle.Between(
          this.x,
          this.y,
          this.target.x,
          this.target.y
        )
        const velocityX = Math.cos(angle) * this.config.speed
        const velocityY = Math.sin(angle) * this.config.speed
        this.setVelocity(velocityX, velocityY)
      }
    } else {
      // 停止移动
      this.setVelocity(0, 0)
    }
  }

  private attack(): void {
    if (this.target) {
      this.target.takeDamage(this.config.damage)
    }
  }
} 