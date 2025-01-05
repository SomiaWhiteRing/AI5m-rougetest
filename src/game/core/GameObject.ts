import { Scene, GameObjects, Physics } from 'phaser';
import { Component } from '../components/Component';
import { ComponentManager } from '../components/ComponentManager';

export class GameObject extends GameObjects.Container {
  protected componentManager: ComponentManager;
  public body: Physics.Arcade.Body;

  constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y);
    this.componentManager = new ComponentManager(this);

    // 启用物理系统
    scene.physics.world.enable(this);
    this.body = this.body as Physics.Arcade.Body;
  }

  addComponent<T extends Component>(component: T): T {
    return this.componentManager.addComponent(component);
  }

  getComponent<T extends Component>(componentType: new (...args: any[]) => T): T | undefined {
    return this.componentManager.getComponentsByType(componentType.name)[0] as T | undefined;
  }

  getComponents<T extends Component>(componentType: new (...args: any[]) => T): T[] {
    return this.componentManager.getComponentsByType(componentType.name) as T[];
  }

  removeComponent(component: Component): void {
    this.componentManager.removeComponent(component);
  }

  hasComponent<T extends Component>(componentType: new (...args: any[]) => T): boolean {
    return this.componentManager.hasComponentType(componentType.name);
  }

  getAllComponents(): Component[] {
    return this.componentManager.getAllComponents();
  }

  destroy(fromScene?: boolean): void {
    this.componentManager.destroy();
    super.destroy(fromScene);
  }
}