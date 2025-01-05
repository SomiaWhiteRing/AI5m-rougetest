import { Entity } from './Entity';
import { EventEmitter } from 'events';

export abstract class Component extends EventEmitter {
  protected _entity: Entity;
  protected _isEnabled: boolean = true;
  protected _priority: number = 0;

  constructor(entity: Entity) {
    super();
    this._entity = entity;
  }

  // 获取所属实体
  get entity(): Entity {
    return this._entity;
  }

  // 获取组件优先级
  get priority(): number {
    return this._priority;
  }

  // 设置组件优先级
  set priority(value: number) {
    this._priority = value;
  }

  // 获取组件启用状态
  get isEnabled(): boolean {
    return this._isEnabled;
  }

  // 启用组件
  enable(): void {
    if (!this._isEnabled) {
      this._isEnabled = true;
      this.onEnable();
      this.emit('enabled');
    }
  }

  // 禁用组件
  disable(): void {
    if (this._isEnabled) {
      this._isEnabled = false;
      this.onDisable();
      this.emit('disabled');
    }
  }

  // 生命周期方法
  // 组件初始化时调用
  abstract onInit(): void;

  // 组件启用时调用
  protected onEnable(): void {}

  // 组件禁用时调用
  protected onDisable(): void {}

  // 组件更新前调用
  protected onPreUpdate(deltaTime: number): void {}

  // 组件更新时调用
  protected onUpdate(deltaTime: number): void {}

  // 组件更新后调用
  protected onPostUpdate(deltaTime: number): void {}

  // 组件销毁时调用
  protected onDestroy(): void {}

  // 更新方法
  update(deltaTime: number): void {
    if (!this._isEnabled) return;

    this.onPreUpdate(deltaTime);
    this.onUpdate(deltaTime);
    this.onPostUpdate(deltaTime);
  }

  // 销毁组件
  destroy(): void {
    this.onDestroy();
    this.emit('destroyed');
    this.removeAllListeners();
  }
}