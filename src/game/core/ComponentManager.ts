import { Component } from './Component';
import { Entity } from './Entity';
import { EventEmitter } from 'events';

export class ComponentManager extends EventEmitter {
  private _components: Map<string, Component[]>;
  private _entity: Entity;

  constructor(entity: Entity) {
    super();
    this._entity = entity;
    this._components = new Map();
  }

  // 添加组件
  addComponent<T extends Component>(component: T): T {
    const componentName = component.constructor.name;

    if (!this._components.has(componentName)) {
      this._components.set(componentName, []);
    }

    const components = this._components.get(componentName)!;
    components.push(component);

    // 按优先级排序
    components.sort((a, b) => b.priority - a.priority);

    // 初始化组件
    component.onInit();

    this.emit('componentAdded', { component, type: componentName });
    return component;
  }

  // 移除组件
  removeComponent<T extends Component>(component: T): void {
    const componentName = component.constructor.name;
    const components = this._components.get(componentName);

    if (components) {
      const index = components.indexOf(component);
      if (index !== -1) {
        components.splice(index, 1);
        component.destroy();

        if (components.length === 0) {
          this._components.delete(componentName);
        }

        this.emit('componentRemoved', { component, type: componentName });
      }
    }
  }

  // 移除指定类型的所有组件
  removeAllComponentsOfType(componentType: string): void {
    const components = this._components.get(componentType);

    if (components) {
      while (components.length > 0) {
        const component = components[0];
        this.removeComponent(component);
      }
    }
  }

  // 移除所有组件
  removeAllComponents(): void {
    for (const [componentType, components] of this._components.entries()) {
      this.removeAllComponentsOfType(componentType);
    }
  }

  // 获取指定类型的第一个组件
  getComponent<T extends Component>(componentType: string): T | null {
    const components = this._components.get(componentType);
    return components && components.length > 0 ? components[0] as T : null;
  }

  // 获取指定类型的所有组件
  getComponents<T extends Component>(componentType: string): T[] {
    return (this._components.get(componentType) || []) as T[];
  }

  // 检查是否有指定类型的组件
  hasComponent(componentType: string): boolean {
    const components = this._components.get(componentType);
    return components !== undefined && components.length > 0;
  }

  // 更新所有组件
  update(deltaTime: number): void {
    for (const components of this._components.values()) {
      for (const component of components) {
        if (component.isEnabled) {
          component.update(deltaTime);
        }
      }
    }
  }

  // 启用所有组件
  enableAllComponents(): void {
    for (const components of this._components.values()) {
      for (const component of components) {
        component.enable();
      }
    }
  }

  // 禁用所有组件
  disableAllComponents(): void {
    for (const components of this._components.values()) {
      for (const component of components) {
        component.disable();
      }
    }
  }

  // 获取所有组件类型
  getComponentTypes(): string[] {
    return Array.from(this._components.keys());
  }

  // 获取组件总数
  getComponentCount(): number {
    let count = 0;
    for (const components of this._components.values()) {
      count += components.length;
    }
    return count;
  }
}