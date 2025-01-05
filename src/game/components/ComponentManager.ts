import { Component } from './Component';
import { Entity } from '../entities/Entity';
import { EventEmitter } from 'events';

export class ComponentManager {
  private components: Map<string, Component>;
  private componentsByType: Map<string, Set<Component>>;
  private entity: Entity;
  private eventEmitter: EventEmitter;

  constructor(entity: Entity) {
    this.components = new Map();
    this.componentsByType = new Map();
    this.entity = entity;
    this.eventEmitter = new EventEmitter();
  }

  addComponent<T extends Component>(component: T): T {
    const id = component.getComponentId();
    const name = component.getComponentName();

    // 添加到组件映射
    this.components.set(id, component);

    // 添加到类型映射
    if (!this.componentsByType.has(name)) {
      this.componentsByType.set(name, new Set());
    }
    this.componentsByType.get(name)!.add(component);

    // 发送事件
    this.eventEmitter.emit('componentAdded', component);

    return component;
  }

  removeComponent(component: Component): void {
    const id = component.getComponentId();
    const name = component.getComponentName();

    // 从组件映射中移除
    this.components.delete(id);

    // 从类型映射中移除
    const typeSet = this.componentsByType.get(name);
    if (typeSet) {
      typeSet.delete(component);
      if (typeSet.size === 0) {
        this.componentsByType.delete(name);
      }
    }

    // 销毁组件
    component.destroy();

    // 发送事件
    this.eventEmitter.emit('componentRemoved', component);
  }

  getComponent<T extends Component>(id: string): T | undefined {
    return this.components.get(id) as T | undefined;
  }

  getComponentsByType<T extends Component>(name: string): T[] {
    const typeSet = this.componentsByType.get(name);
    return typeSet ? Array.from(typeSet) as T[] : [];
  }

  hasComponent(id: string): boolean {
    return this.components.has(id);
  }

  hasComponentType(name: string): boolean {
    const typeSet = this.componentsByType.get(name);
    return typeSet ? typeSet.size > 0 : false;
  }

  getAllComponents(): Component[] {
    return Array.from(this.components.values());
  }

  clear(): void {
    // 销毁所有组件
    for (const component of this.components.values()) {
      component.destroy();
    }

    // 清空映射
    this.components.clear();
    this.componentsByType.clear();

    // 发送事件
    this.eventEmitter.emit('cleared');
  }

  onManagerEvent(event: string, listener: (...args: any[]) => void): this {
    this.eventEmitter.on(event, listener);
    return this;
  }

  offManagerEvent(event: string, listener: (...args: any[]) => void): this {
    this.eventEmitter.off(event, listener);
    return this;
  }

  getEntity(): Entity {
    return this.entity;
  }

  destroy(): void {
    this.clear();
    this.eventEmitter.removeAllListeners();
  }
}