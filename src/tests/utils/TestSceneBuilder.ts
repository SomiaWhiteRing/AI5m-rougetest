import { Scene } from 'phaser';
import { Entity, EntityState } from '../../game/entities/Entity';
import { GameEffect } from '../../game/effects/GameEffect';
import { TestDataGenerator } from './TestDataGenerator';
import { EffectType } from '../../game/effects/EffectType';

export class TestSceneBuilder {
  private scene: Scene;
  private entities: Entity[] = [];
  private effects: GameEffect[] = [];
  private customSetup?: () => void;

  constructor() {
    this.scene = TestDataGenerator.createMockScene();
  }

  withPlayer(customState?: Partial<EntityState>): this {
    const player = new Entity(this.scene, 0, 0, 'player', customState);
    this.entities.push(player);
    return this;
  }

  withEnemy(count: number = 1, customState?: Partial<EntityState>): this {
    for (let i = 0; i < count; i++) {
      const enemy = new Entity(this.scene, 0, 0, 'enemy', customState);
      this.entities.push(enemy);
    }
    return this;
  }

  withEffect(effect: GameEffect): this {
    this.effects.push(effect);
    return this;
  }

  withRandomEffects(count: number): this {
    const effectTypes = [
      EffectType.DAMAGE,
      EffectType.HEAL,
      EffectType.SHIELD,
      EffectType.BUFF,
      EffectType.DEBUFF
    ];

    for (let i = 0; i < count; i++) {
      const type = effectTypes[Math.floor(Math.random() * effectTypes.length)];
      const value = Math.floor(Math.random() * 50) + 1;
      const duration = Math.floor(Math.random() * 5000) + 1000;
      this.effects.push(TestDataGenerator.createMockEffect(type, value, duration));
    }
    return this;
  }

  withCustomSetup(setup: () => void): this {
    this.customSetup = setup;
    return this;
  }

  build() {
    // 执行自定义设置
    if (this.customSetup) {
      this.customSetup();
    }

    return {
      scene: this.scene,
      entities: this.entities,
      effects: this.effects,
      getPlayer: () => this.entities[0],
      getEnemies: () => this.entities.slice(1),
      getEffects: () => this.effects,
      cleanup: () => {
        this.entities.forEach(entity => {
          entity.getSprite().destroy();
        });
        this.entities = [];
        this.effects = [];
      }
    };
  }

  static createCombatScene() {
    return new TestSceneBuilder()
      .withPlayer({
        health: 100,
        maxHealth: 100,
        attack: 20,
        defense: 10,
        critChance: 0.2,
        critMultiplier: 2.0,
        mana: 100,
        maxMana: 100,
        level: 1,
        experience: 0,
        gold: 0,
        dodgeChance: 0.1,
        shield: 0
      })
      .withEnemy(1, {
        health: 80,
        maxHealth: 80,
        attack: 15,
        defense: 8,
        critChance: 0.1,
        critMultiplier: 1.5,
        mana: 50,
        maxMana: 50,
        level: 1,
        experience: 0,
        gold: 10,
        dodgeChance: 0.1,
        shield: 0
      })
      .withRandomEffects(2)
      .build();
  }

  static createBossScene() {
    return new TestSceneBuilder()
      .withPlayer({
        health: 200,
        maxHealth: 200,
        attack: 30,
        defense: 15,
        critChance: 0.25,
        critMultiplier: 2.5,
        mana: 150,
        maxMana: 150,
        level: 5,
        experience: 0,
        gold: 100,
        dodgeChance: 0.15,
        shield: 0
      })
      .withEnemy(1, {
        health: 500,
        maxHealth: 500,
        attack: 40,
        defense: 20,
        critChance: 0.15,
        critMultiplier: 2.0,
        mana: 200,
        maxMana: 200,
        level: 10,
        experience: 0,
        gold: 1000,
        dodgeChance: 0.05,
        shield: 50
      })
      .withRandomEffects(3)
      .build();
  }

  static createMobScene(mobCount: number) {
    return new TestSceneBuilder()
      .withPlayer({
        health: 150,
        maxHealth: 150,
        attack: 25,
        defense: 12,
        critChance: 0.2,
        critMultiplier: 2.0,
        mana: 100,
        maxMana: 100,
        level: 3,
        experience: 0,
        gold: 50,
        dodgeChance: 0.1,
        shield: 0
      })
      .withEnemy(mobCount, {
        health: 40,
        maxHealth: 40,
        attack: 10,
        defense: 5,
        critChance: 0.1,
        critMultiplier: 1.5,
        mana: 30,
        maxMana: 30,
        level: 1,
        experience: 0,
        gold: 5,
        dodgeChance: 0.05,
        shield: 0
      })
      .withRandomEffects(Math.min(mobCount, 5))
      .build();
  }

  static createPerformanceTestScene(entityCount: number) {
    const builder = new TestSceneBuilder()
      .withPlayer({
        health: 100,
        maxHealth: 100,
        attack: 10,
        defense: 5,
        critChance: 0.1,
        critMultiplier: 1.5,
        mana: 100,
        maxMana: 100,
        level: 1,
        experience: 0,
        gold: 0,
        dodgeChance: 0.05,
        shield: 0
      })
      .withEnemy(entityCount - 1, {
        health: 50,
        maxHealth: 50,
        attack: 8,
        defense: 3,
        critChance: 0.1,
        critMultiplier: 1.5,
        mana: 50,
        maxMana: 50,
        level: 1,
        experience: 0,
        gold: 1,
        dodgeChance: 0.05,
        shield: 0
      });

    if (entityCount <= 100) {
      builder.withRandomEffects(Math.floor(entityCount / 2));
    }

    return builder.build();
  }
} 