import { Scene } from 'phaser'
import { Player } from '../entities/Player'
import { Enemy } from '../entities/Enemy'

export interface SkillConfig {
  id: string
  name: string
  description: string
  type: 'active' | 'passive'
  damage?: number
  healing?: number
  cooldown: number
  manaCost: number
  range: number
  area: number
  duration?: number
  effects?: {
    damage?: number
    healing?: number
    speed?: number
    defense?: number
  }
}

export abstract class Skill {
  protected scene: Scene
  protected config: SkillConfig
  protected cooldownTimer: number = 0
  protected isReady: boolean = true
  protected level: number = 1
  protected owner: Player

  constructor(scene: Scene, config: SkillConfig, owner: Player) {
    this.scene = scene
    this.config = config
    this.owner = owner
  }

  update(time: number, delta: number): void {
    // 更新冷却时间
    if (!this.isReady) {
      this.cooldownTimer += delta
      if (this.cooldownTimer >= this.config.cooldown) {
        this.isReady = true
        this.cooldownTimer = 0
      }
    }
  }

  // 使用技能
  use(target?: Enemy): boolean {
    if (!this.canUse()) return false

    // 执行技能效果
    this.execute(target)

    // 设置冷却
    this.startCooldown()

    return true
  }

  // 检查是否可以使用技能
  protected canUse(): boolean {
    return this.isReady && !this.owner.isDead()
  }

  // 开始冷却
  protected startCooldown(): void {
    this.isReady = false
    this.cooldownTimer = 0
  }

  // 升级技能
  levelUp(): void {
    this.level++
    this.onLevelUp()
  }

  // 获取技能等级
  getLevel(): number {
    return this.level
  }

  // 获取冷却进度(0-1)
  getCooldownProgress(): number {
    if (this.isReady) return 1
    return this.cooldownTimer / this.config.cooldown
  }

  // 获取技能配置
  getConfig(): SkillConfig {
    return this.config
  }

  // 抽象方法：执行技能效果
  protected abstract execute(target?: Enemy): void

  // 抽象方法：处理升级效果
  protected abstract onLevelUp(): void

  // 创建技能特效
  protected createEffect(x: number, y: number, texture: string): void {
    const effect = this.scene.add.sprite(x, y, texture)
    effect.play('skill_effect')
    effect.once('animationcomplete', () => {
      effect.destroy()
    })
  }

  // 计算技能伤害
  protected calculateDamage(): number {
    const baseDamage = this.config.damage || 0
    return baseDamage * (1 + (this.level - 1) * 0.2) // 每级增加20%伤害
  }

  // 计算技能治疗量
  protected calculateHealing(): number {
    const baseHealing = this.config.healing || 0
    return baseHealing * (1 + (this.level - 1) * 0.2) // 每级增加20%治疗量
  }

  // 应用技能效果
  protected applyEffects(target: Player | Enemy): void {
    if (!this.config.effects) return

    if (this.config.effects.damage) {
      if (target instanceof Enemy) {
        target.takeDamage(this.config.effects.damage)
      }
    }

    if (this.config.effects.healing) {
      if (target instanceof Player) {
        target.heal(this.config.effects.healing)
      }
    }
  }
} 