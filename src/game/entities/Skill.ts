import { SkillConfig, SkillType } from '../types/skill'
import { Player } from './Player'
import { Enemy } from './Enemy'

export class Skill {
  private config: SkillConfig
  private level: number = 1
  private lastUsedTime: number = 0
  private owner: Player

  constructor(config: SkillConfig, owner: Player) {
    this.config = config
    this.owner = owner
  }

  canUse(currentTime: number): boolean {
    if (this.config.isPassive) return false
    if (!this.meetsRequirements()) return false
    if (this.config.cooldown && currentTime - this.lastUsedTime < this.config.cooldown) return false
    if (this.config.manaCost && this.owner.getState().mana < this.config.manaCost) return false
    return true
  }

  use(currentTime: number, targetX?: number, targetY?: number): boolean {
    if (!this.canUse(currentTime)) return false

    // 消耗魔法值
    if (this.config.manaCost) {
      this.owner.consumeMana(this.config.manaCost)
    }

    // 应用技能效果
    this.applyEffects(targetX, targetY)

    // 更新冷却时间
    this.lastUsedTime = currentTime

    // 播放动画和音效
    if (this.config.animation) {
      this.owner.play(this.config.animation)
    }
    if (this.config.sound) {
      // TODO: 播放音效
    }

    return true
  }

  private applyEffects(targetX?: number, targetY?: number) {
    const scene = this.owner.scene
    const ownerState = this.owner.getState()

    this.config.effects.forEach(effect => {
      const value = this.calculateEffectValue(effect.type, effect.value)

      switch (effect.type) {
        case 'damage': {
          // 获取范围内的敌人
          const range = effect.range || 40
          const angle = effect.angle || 360
          const targets = this.getTargetsInRange(range, angle, targetX, targetY)
          
          targets.forEach(target => {
            target.takeDamage(value)
          })
          break
        }
        case 'heal':
          this.owner.heal(value)
          break
        case 'shield':
          this.owner.addShield(value, effect.duration)
          break
        case 'movement':
          if (targetX !== undefined && targetY !== undefined) {
            const angle = Phaser.Math.Angle.Between(
              this.owner.x,
              this.owner.y,
              targetX,
              targetY
            )
            const velocity = new Phaser.Math.Vector2()
            velocity.setToPolar(angle, value)
            this.owner.setVelocity(velocity.x, velocity.y)
          }
          break
        case 'teleport':
          if (targetX !== undefined && targetY !== undefined) {
            const distance = Phaser.Math.Distance.Between(
              this.owner.x,
              this.owner.y,
              targetX,
              targetY
            )
            if (distance <= value) {
              this.owner.setPosition(targetX, targetY)
            }
          }
          break
        case 'burn':
          // 获取范围内的敌人
          const burnTargets = this.getTargetsInRange(effect.range || 40)
          burnTargets.forEach(target => {
            target.addStatusEffect('burn', value, effect.duration)
          })
          break
        case 'chain': {
          // 闪电链效果
          const chainTargets = this.getTargetsInRange(effect.range || 150)
          let currentTarget = chainTargets[0]
          let remainingJumps = value

          while (currentTarget && remainingJumps > 0) {
            currentTarget.takeDamage(value)
            remainingJumps--

            if (remainingJumps > 0) {
              // 找到最近的下一个目标
              const nextTarget = this.findNearestTarget(currentTarget, chainTargets)
              if (nextTarget) {
                // 创建闪电效果
                this.createLightningEffect(currentTarget, nextTarget)
                currentTarget = nextTarget
              } else {
                break
              }
            }
          }
          break
        }
        // 被动效果
        case 'attack':
          ownerState.attack += value
          break
        case 'speed':
          ownerState.speed += value
          break
        case 'maxHealth':
          ownerState.maxHealth += value
          ownerState.health = Math.min(ownerState.health + value, ownerState.maxHealth)
          break
        case 'healthRegen':
          ownerState.healthRegen = (ownerState.healthRegen || 0) + value
          break
        case 'criticalChance':
          ownerState.criticalChance = (ownerState.criticalChance || 0) + value
          break
        case 'criticalDamage':
          ownerState.criticalDamage = (ownerState.criticalDamage || 0) + value
          break
        case 'lifesteal':
          ownerState.lifesteal = (ownerState.lifesteal || 0) + value
          break
        case 'thorns':
          ownerState.thorns = (ownerState.thorns || 0) + value
          break
        case 'dodge':
          ownerState.dodge = (ownerState.dodge || 0) + value
          break
      }
    })
  }

  private calculateEffectValue(type: string, baseValue: number): number {
    if (!this.config.upgrades) return baseValue

    const effect = this.config.upgrades.effects.find(e => e.type === type)
    if (!effect) return baseValue

    return effect.baseValue + effect.increment * (this.level - 1)
  }

  private getTargetsInRange(range: number, angle: number = 360, targetX?: number, targetY?: number): Enemy[] {
    const x = targetX ?? this.owner.x
    const y = targetY ?? this.owner.y

    const targets: Enemy[] = []
    const entities = this.owner.scene.children.list

    entities.forEach(entity => {
      if (entity instanceof Enemy && entity.active) {
        const distance = Phaser.Math.Distance.Between(x, y, entity.x, entity.y)
        if (distance <= range) {
          if (angle < 360) {
            const angleToTarget = Phaser.Math.Angle.Between(x, y, entity.x, entity.y)
            const normalizedAngle = Phaser.Math.Angle.Normalize(angleToTarget)
            const halfAngle = Phaser.Math.DegToRad(angle / 2)
            const ownerAngle = this.owner.rotation

            const minAngle = Phaser.Math.Angle.Normalize(ownerAngle - halfAngle)
            const maxAngle = Phaser.Math.Angle.Normalize(ownerAngle + halfAngle)

            if (normalizedAngle >= minAngle && normalizedAngle <= maxAngle) {
              targets.push(entity)
            }
          } else {
            targets.push(entity)
          }
        }
      }
    })

    return targets
  }

  private findNearestTarget(source: Enemy, targets: Enemy[]): Enemy | null {
    let nearestTarget: Enemy | null = null
    let minDistance = Infinity

    targets.forEach(target => {
      if (target !== source) {
        const distance = Phaser.Math.Distance.Between(
          source.x,
          source.y,
          target.x,
          target.y
        )
        if (distance < minDistance) {
          minDistance = distance
          nearestTarget = target
        }
      }
    })

    return nearestTarget
  }

  private createLightningEffect(source: Enemy, target: Enemy) {
    const graphics = this.owner.scene.add.graphics()
    graphics.lineStyle(2, 0x4444ff, 1)
    graphics.beginPath()
    graphics.moveTo(source.x, source.y)
    graphics.lineTo(target.x, target.y)
    graphics.strokePath()

    // 添加闪电动画
    this.owner.scene.tweens.add({
      targets: graphics,
      alpha: 0,
      duration: 200,
      onComplete: () => graphics.destroy()
    })
  }

  levelUp(): boolean {
    if (!this.config.upgrades || this.level >= this.config.upgrades.maxLevel) {
      return false
    }

    this.level++
    return true
  }

  getConfig(): SkillConfig {
    return this.config
  }

  getLevel(): number {
    return this.level
  }

  getCooldownProgress(currentTime: number): number {
    if (!this.config.cooldown) return 1

    const timeSinceLastUse = currentTime - this.lastUsedTime
    return Math.min(1, timeSinceLastUse / this.config.cooldown)
  }

  meetsRequirements(): boolean {
    const ownerState = this.owner.getState()

    // 检查等级要求
    if (ownerState.level < this.config.requirements.level) {
      return false
    }

    // 检查技能前置要求
    if (this.config.requirements.skills) {
      const hasRequiredSkills = this.config.requirements.skills.every(skillId => {
        return this.owner.hasSkill(skillId)
      })
      if (!hasRequiredSkills) return false
    }

    // 检查属性要求
    if (this.config.requirements.stats) {
      const stats = this.config.requirements.stats
      if (stats.strength && ownerState.strength < stats.strength) return false
      if (stats.agility && ownerState.agility < stats.agility) return false
      if (stats.vitality && ownerState.vitality < stats.vitality) return false
      if (stats.intelligence && ownerState.intelligence < stats.intelligence) return false
    }

    return true
  }
} 