import { Scene } from 'phaser';
import { Entity } from '../entities/Entity';
import { SkillManager } from '../managers/SkillManager';
import {
  BehaviorTree,
  Selector,
  Sequence,
  Condition,
  Action,
  NodeStatus,
  Context
} from './BehaviorTree';

export interface EnemyAIContext extends Context {
  scene: Scene;
  self: Entity;
  target?: Entity;
  skillManager: SkillManager;
  lastSkillUse: Map<string, number>;
  patrolPoints?: Phaser.Math.Vector2[];
  currentPatrolIndex?: number;
  chaseRange: number;
  attackRange: number;
}

export class EnemyAI {
  private behaviorTree: BehaviorTree;
  private context: EnemyAIContext;

  constructor(context: EnemyAIContext) {
    this.context = context;
    this.behaviorTree = this.createBehaviorTree();
  }

  private createBehaviorTree(): BehaviorTree {
    return new BehaviorTree(
      new Selector([
        // 1. 检查生命值并逃跑
        new Sequence([
          new Condition(this.isLowHealth.bind(this)),
          new Action(this.flee.bind(this))
        ]),

        // 2. 攻击目标
        new Sequence([
          new Condition(this.hasTarget.bind(this)),
          new Selector([
            // 2.1 使用技能
            new Sequence([
              new Condition(this.isInAttackRange.bind(this)),
              new Action(this.useSkill.bind(this))
            ]),
            // 2.2 追逐目标
            new Sequence([
              new Condition(this.isInChaseRange.bind(this)),
              new Action(this.chase.bind(this))
            ])
          ])
        ]),

        // 3. 巡逻
        new Sequence([
          new Condition(this.hasPatrolPoints.bind(this)),
          new Action(this.patrol.bind(this))
        ]),

        // 4. 待机
        new Action(this.idle.bind(this))
      ])
    );
  }

  // 条件检查
  private isLowHealth(context: EnemyAIContext): boolean {
    return context.self.getHp() < context.self.getMaxHp() * 0.3;
  }

  private hasTarget(context: EnemyAIContext): boolean {
    return !!context.target && !context.target.isDead();
  }

  private isInAttackRange(context: EnemyAIContext): boolean {
    if (!context.target) return false;
    const distance = Phaser.Math.Distance.Between(
      context.self.x,
      context.self.y,
      context.target.x,
      context.target.y
    );
    return distance <= context.attackRange;
  }

  private isInChaseRange(context: EnemyAIContext): boolean {
    if (!context.target) return false;
    const distance = Phaser.Math.Distance.Between(
      context.self.x,
      context.self.y,
      context.target.x,
      context.target.y
    );
    return distance <= context.chaseRange;
  }

  private hasPatrolPoints(context: EnemyAIContext): boolean {
    return !!context.patrolPoints && context.patrolPoints.length > 0;
  }

  // 动作执行
  private flee(context: EnemyAIContext): NodeStatus {
    if (!context.target) return NodeStatus.FAILURE;

    const angle = Phaser.Math.Angle.Between(
      context.target.x,
      context.target.y,
      context.self.x,
      context.self.y
    );

    const speed = context.self.getSpeed();
    context.self.setVelocity(
      Math.cos(angle) * speed,
      Math.sin(angle) * speed
    );

    return NodeStatus.RUNNING;
  }

  private useSkill(context: EnemyAIContext): NodeStatus {
    if (!context.target) return NodeStatus.FAILURE;

    // 尝试使用可用的技能
    const availableSkills = ['basicAttack', 'fireball', 'frostNova'];
    for (const skillId of availableSkills) {
      if (context.skillManager.canUseSkill(context.self, skillId)) {
        context.skillManager.useSkill(context.self, skillId, context.target);
        return NodeStatus.SUCCESS;
      }
    }

    return NodeStatus.FAILURE;
  }

  private chase(context: EnemyAIContext): NodeStatus {
    if (!context.target) return NodeStatus.FAILURE;

    const angle = Phaser.Math.Angle.Between(
      context.self.x,
      context.self.y,
      context.target.x,
      context.target.y
    );

    const speed = context.self.getSpeed();
    context.self.setVelocity(
      Math.cos(angle) * speed,
      Math.sin(angle) * speed
    );

    return NodeStatus.RUNNING;
  }

  private patrol(context: EnemyAIContext): NodeStatus {
    if (!context.patrolPoints || !context.patrolPoints.length) {
      return NodeStatus.FAILURE;
    }

    if (typeof context.currentPatrolIndex !== 'number') {
      context.currentPatrolIndex = 0;
    }

    const target = context.patrolPoints[context.currentPatrolIndex];
    const distance = Phaser.Math.Distance.Between(
      context.self.x,
      context.self.y,
      target.x,
      target.y
    );

    if (distance < 10) {
      // 到达当前巡逻点，移动到下一个
      context.currentPatrolIndex = (context.currentPatrolIndex + 1) % context.patrolPoints.length;
      return NodeStatus.SUCCESS;
    }

    const angle = Phaser.Math.Angle.Between(
      context.self.x,
      context.self.y,
      target.x,
      target.y
    );

    const speed = context.self.getSpeed() * 0.5; // 巡逻时速度较慢
    context.self.setVelocity(
      Math.cos(angle) * speed,
      Math.sin(angle) * speed
    );

    return NodeStatus.RUNNING;
  }

  private idle(context: EnemyAIContext): NodeStatus {
    context.self.setVelocity(0, 0);
    return NodeStatus.SUCCESS;
  }

  update() {
    this.behaviorTree.tick(this.context);
  }
} 