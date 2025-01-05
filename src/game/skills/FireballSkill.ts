import { Scene } from 'phaser'
import { Skill, SkillConfig } from './Skill'
import { Player } from '../entities/Player'
import { Enemy } from '../entities/Enemy'

export class FireballSkill extends Skill {
  private projectileSpeed: number = 300
  private projectiles: Phaser.Physics.Arcade.Sprite[] = []

  constructor(scene: Scene, owner: Player) {
    const config: SkillConfig = {
      id: 'fireball',
      name: '火球术',
      description: '发射一个火球，造成范围伤害',
      type: 'active',
      damage: 30,
      cooldown: 2000,
      manaCost: 20,
      range: 300,
      area: 50
    }
    super(scene, config, owner)
  }

  protected execute(target?: Enemy): void {
    // 获取鼠标位置
    const pointer = this.scene.input.activePointer
    const angle = Phaser.Math.Angle.Between(
      this.owner.x,
      this.owner.y,
      pointer.worldX,
      pointer.worldY
    )

    // 创建火球
    const fireball = this.scene.physics.add.sprite(
      this.owner.x,
      this.owner.y,
      'fireball'
    )

    // 设置火球属性
    fireball.setRotation(angle)
    fireball.setVelocity(
      Math.cos(angle) * this.projectileSpeed,
      Math.sin(angle) * this.projectileSpeed
    )

    // 添加到投射物列表
    this.projectiles.push(fireball)

    // 创建碰撞检测
    this.scene.physics.add.overlap(
      fireball,
      this.scene.enemies,
      this.onHitEnemy,
      undefined,
      this
    )

    // 设置自动销毁
    this.scene.time.delayedCall(2000, () => {
      fireball.destroy()
      this.projectiles = this.projectiles.filter(p => p !== fireball)
    })

    // 播放音效
    this.scene.sound.play('fireball_cast')
  }

  protected onLevelUp(): void {
    // 升级时增加伤害
    this.config.damage = this.calculateDamage()
    
    // 每3级减少冷却时间
    if (this.level % 3 === 0) {
      this.config.cooldown = Math.max(500, this.config.cooldown - 200)
    }
  }

  private onHitEnemy(projectile: Phaser.Physics.Arcade.Sprite, enemy: Enemy): void {
    // 造成伤害
    const damage = this.calculateDamage()
    enemy.takeDamage(damage)

    // 创建爆炸效果
    this.createEffect(projectile.x, projectile.y, 'explosion')

    // 播放音效
    this.scene.sound.play('fireball_hit')

    // 销毁火球
    projectile.destroy()
    this.projectiles = this.projectiles.filter(p => p !== projectile)
  }

  update(time: number, delta: number): void {
    super.update(time, delta)

    // 更新火球位置
    this.projectiles.forEach(projectile => {
      // 检查是否超出范围
      const distance = Phaser.Math.Distance.Between(
        this.owner.x,
        this.owner.y,
        projectile.x,
        projectile.y
      )

      if (distance > this.config.range) {
        projectile.destroy()
        this.projectiles = this.projectiles.filter(p => p !== projectile)
      }
    })
  }
} 