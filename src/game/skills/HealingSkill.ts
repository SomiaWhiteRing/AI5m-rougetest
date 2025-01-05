import { Scene } from 'phaser'
import { Skill, SkillConfig } from './Skill'
import { Player } from '../entities/Player'
import { Enemy } from '../entities/Enemy'

export class HealingSkill extends Skill {
  private healingParticles: Phaser.GameObjects.Particles.ParticleEmitterManager | null = null

  constructor(scene: Scene, owner: Player) {
    const config: SkillConfig = {
      id: 'healing',
      name: '治疗术',
      description: '恢复生命值',
      type: 'active',
      healing: 50,
      cooldown: 5000,
      manaCost: 30,
      range: 0,
      area: 0
    }
    super(scene, config, owner)
  }

  protected execute(target?: Enemy): void {
    // 计算治疗量
    const healAmount = this.calculateHealing()

    // 应用治疗效果
    this.owner.heal(healAmount)

    // 创建治疗特效
    this.createHealingEffect()

    // 播放音效
    this.scene.sound.play('healing_cast')
  }

  protected onLevelUp(): void {
    // 升级时增加治疗量
    this.config.healing = this.calculateHealing()
    
    // 每3级减少冷却时间
    if (this.level % 3 === 0) {
      this.config.cooldown = Math.max(2000, this.config.cooldown - 500)
    }
  }

  private createHealingEffect(): void {
    // 创建粒子效果
    if (!this.healingParticles) {
      this.healingParticles = this.scene.add.particles('healing_particle')
    }

    const emitter = this.healingParticles.createEmitter({
      x: this.owner.x,
      y: this.owner.y,
      speed: { min: 50, max: 100 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 1000,
      quantity: 20,
      blendMode: 'ADD'
    })

    // 1秒后停止发射
    this.scene.time.delayedCall(1000, () => {
      emitter.stop()
    })
  }

  update(time: number, delta: number): void {
    super.update(time, delta)

    // 更新粒子效果位置
    if (this.healingParticles) {
      this.healingParticles.setPosition(this.owner.x, this.owner.y)
    }
  }

  // 清理资源
  destroy(): void {
    if (this.healingParticles) {
      this.healingParticles.destroy()
      this.healingParticles = null
    }
  }
} 