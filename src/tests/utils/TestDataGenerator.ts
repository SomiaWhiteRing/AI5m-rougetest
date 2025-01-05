import { Scene } from 'phaser';
import { Entity } from '../../game/entities/Entity';
import { Effect } from '../../game/effects/Effect';
import { EffectType } from '../../game/effects/EffectType';
import { Item } from '../../game/entities/Item';
import { ItemType } from '../../game/types/ItemType';

export class TestDataGenerator {
  private mockScene: Scene;

  constructor() {
    this.mockScene = this.createMockScene();
  }

  createMockScene(): Scene {
    return {
      add: {
        sprite: () => ({
          setDepth: () => ({}),
          setOrigin: () => ({}),
          setScale: () => ({})
        })
      },
      physics: {
        add: {
          sprite: () => ({
            setDepth: () => ({}),
            setOrigin: () => ({}),
            setScale: () => ({})
          })
        }
      },
      time: {
        now: Date.now()
      }
    } as unknown as Scene;
  }

  createMockEntity(): Entity {
    return new Entity(this.mockScene, 0, 0, 'test');
  }

  createMockItem(type: ItemType = ItemType.CONSUMABLE): Item {
    return new Item(this.mockScene, 0, 0, {
      id: 'test_item',
      name: 'Test Item',
      type: type,
      maxStack: 99,
      maxDurability: 100,
      effects: []
    });
  }

  createRandomEffect(duration: number = 5000): Effect {
    const types = Object.values(EffectType);
    const randomType = types[Math.floor(Math.random() * types.length)];
    return {
      type: randomType,
      value: Math.floor(Math.random() * 50) + 1,
      duration: duration,
      startTime: Date.now()
    };
  }
} 