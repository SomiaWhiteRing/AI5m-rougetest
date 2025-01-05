import { Scene } from 'phaser'
import { Entity } from '../entities/Entity'
import { CombatManager } from './CombatManager'
import { SkillConfig, SkillType, TargetType, SKILLS } from '../../config/skills'
import { Effect } from '../../systems/EffectSystem'

export class SkillManager {
  private scene: Scene
  private combatManager: CombatManager
  private cooldowns: Map<string, number> = new Map()
  private lastCastTime: Map<string, number> = new Map()

  constructor(scene: Scene, combatManager: CombatManager) {
    this.scene = scene
    this.combatManager = combatManager
  }

  canUseSkill(caster: Entity, skillId: string): boolean {
    const skill = SKILLS[skillId]
    if (!skill) return false

    // 检查等级要求
    if (caster.getLevel() < skill.requiredLevel) return false

    // 检查冷却
    const lastCast = this.lastCastTime.get(skillId) || 0
    if (this.scene.time.now - lastCast < skill.cooldown) return false

    // 检查魔法值
    if (caster.getMana() < skill.manaCost) return false

    return true
  }

  useSkill(caster: Entity, skillId: string, target?: Entity): boolean {
    const skill = SKILLS[skillId]
    if (!skill || !this.canUseSkill(caster, skillId)) return false

    // 检查目标
    if (skill.targetType === TargetType.SINGLE && !target) return false
    if (skill.targetType === TargetType.SELF) target = caster

    // 消耗魔法值
    caster.consumeMana(skill.manaCost)

    // 设置冷却
    this.lastCastTime.set(skillId, this.scene.time.now)

    // 应用技能效果
    this.applySkillEffects(skill, caster, target)

    // 播放动画和音效
    if (skill.animation) {
      // TODO: 播放技能动画
    }
    if (skill.sound) {
      // TODO: 播放技能音效
    }

    return true
  }

  private applySkillEffects(skill: SkillConfig, caster: Entity, target?: Entity) {
    if (!target) return

    // 应用伤害
    if (skill.damage) {
      this.combatManager.attack(caster, target, skill.damage)
    }

    // 应用效果
    if (skill.effects) {
      skill.effects.forEach(effectConfig => {
        const effect = new Effect({
          type: effectConfig.type,
          value: effectConfig.value,
          duration: effectConfig.duration,
          interval: effectConfig.interval,
          source: caster
        })
        this.combatManager.applyEffect(effect, target)
      })
    }

    // 处理AOE效果
    if (skill.targetType === TargetType.AOE && skill.aoeRadius) {
      const nearbyEntities = this.getNearbyEntities(target, skill.aoeRadius)
      nearbyEntities.forEach(entity => {
        if (entity !== target) {
          if (skill.damage) {
            this.combatManager.attack(caster, entity, skill.damage)
          }
          if (skill.effects) {
            skill.effects.forEach(effectConfig => {
              const effect = new Effect({
                type: effectConfig.type,
                value: effectConfig.value,
                duration: effectConfig.duration,
                interval: effectConfig.interval,
                source: caster
              })
              this.combatManager.applyEffect(effect, entity)
            })
          }
        }
      })
    }
  }

  private getNearbyEntities(center: Entity, radius: number): Entity[] {
    // TODO: 实现获取范围内实体的逻辑
    return []
  }

  getCooldown(skillId: string): number {
    const lastCast = this.lastCastTime.get(skillId) || 0
    const skill = SKILLS[skillId]
    if (!skill) return 0

    const remainingCooldown = skill.cooldown - (this.scene.time.now - lastCast)
    return Math.max(0, remainingCooldown)
  }

  update() {
    // 更新冷却时间
    this.cooldowns.forEach((cooldown, skillId) => {
      const remaining = this.getCooldown(skillId)
      if (remaining <= 0) {
        this.cooldowns.delete(skillId)
      } else {
        this.cooldowns.set(skillId, remaining)
      }
    })
  }
} 