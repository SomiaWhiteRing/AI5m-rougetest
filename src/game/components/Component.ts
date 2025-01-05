import { EventEmitter } from 'events';
import { Entity } from '../entities/Entity';
import { nanoid } from 'nanoid';

export interface ComponentConfig {
  name: string;
  entity: Entity;
  enabled?: boolean;
}

export abstract class Component {
  private componentId: string;
  private componentName: string;
  protected entity: Entity;
  protected enabled: boolean;
  protected eventEmitter: EventEmitter;

  constructor(config: ComponentConfig) {
    this.componentId = nanoid();
    this.componentName = config.name;
    this.entity = config.entity;
    this.enabled = config.enabled ?? true;
    this.eventEmitter = new EventEmitter();

    // 注册到实体的更新循环
    this.entity.scene.events.on('update', this.update, this);
  }

  abstract onEnable(): void;
  abstract onDisable(): void;
  abstract onDestroy(): void;

  update(time: number, delta: number): void {
    if (this.enabled) {
      this.onUpdate(time, delta);
    }
  }

  protected abstract onUpdate(time: number, delta: number): void;

  enable(): void {
    if (!this.enabled) {
      this.enabled = true;
      this.onEnable();
      this.eventEmitter.emit('enabled');
    }
  }

  disable(): void {
    if (this.enabled) {
      this.enabled = false;
      this.onDisable();
      this.eventEmitter.emit('disabled');
    }
  }

  destroy(): void {
    this.entity.scene.events.off('update', this.update, this);
    this.onDestroy();
    this.eventEmitter.emit('destroyed');
    this.eventEmitter.removeAllListeners();
  }

  getComponentId(): string {
    return this.componentId;
  }

  getComponentName(): string {
    return this.componentName;
  }

  getEntity(): Entity {
    return this.entity;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  onComponentEvent(event: string, listener: (...args: any[]) => void): this {
    this.eventEmitter.on(event, listener);
    return this;
  }

  offComponentEvent(event: string, listener: (...args: any[]) => void): this {
    this.eventEmitter.off(event, listener);
    return this;
  }

  protected emitComponentEvent(event: string, ...args: any[]): void {
    this.eventEmitter.emit(event, ...args);
  }
}