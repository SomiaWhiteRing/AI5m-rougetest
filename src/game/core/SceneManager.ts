import { EventEmitter } from 'events';

export interface SceneConfig {
  name: string;
  onInit?: () => void;
  onEnter?: () => void;
  onExit?: () => void;
  onUpdate?: (deltaTime: number) => void;
  onRender?: () => void;
}

export class Scene extends EventEmitter {
  private _name: string;
  private _isActive: boolean = false;

  constructor(config: SceneConfig) {
    super();
    this._name = config.name;

    if (config.onInit) this.on('init', config.onInit);
    if (config.onEnter) this.on('enter', config.onEnter);
    if (config.onExit) this.on('exit', config.onExit);
    if (config.onUpdate) this.on('update', config.onUpdate);
    if (config.onRender) this.on('render', config.onRender);
  }

  get name(): string {
    return this._name;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  // 公共方法
  init(): void {
    this.initialize();
  }

  enter(): void {
    this.onEnter();
  }

  exit(): void {
    this.onExit();
  }

  update(deltaTime: number): void {
    this.onUpdate(deltaTime);
  }

  render(): void {
    this.onRender();
  }

  // 受保护的方法
  protected initialize(): void {
    this.emit('init');
  }

  protected onEnter(): void {
    this._isActive = true;
    this.emit('enter');
  }

  protected onExit(): void {
    this._isActive = false;
    this.emit('exit');
  }

  protected onUpdate(deltaTime: number): void {
    if (this._isActive) {
      this.emit('update', deltaTime);
    }
  }

  protected onRender(): void {
    if (this._isActive) {
      this.emit('render');
    }
  }
}

export class SceneManager extends EventEmitter {
  private static _instance: SceneManager;
  private _scenes: Map<string, Scene>;
  private _currentScene: Scene | null;
  private _nextScene: Scene | null;
  private _isTransitioning: boolean;
  private _transitionDuration: number;
  private _transitionTimer: number;

  private constructor() {
    super();
    this._scenes = new Map();
    this._currentScene = null;
    this._nextScene = null;
    this._isTransitioning = false;
    this._transitionDuration = 0.5; // 默认过渡时间为0.5秒
    this._transitionTimer = 0;
  }

  static getInstance(): SceneManager {
    if (!SceneManager._instance) {
      SceneManager._instance = new SceneManager();
    }
    return SceneManager._instance;
  }

  // 添加场景
  addScene(config: SceneConfig): Scene {
    if (this._scenes.has(config.name)) {
      throw new Error(`Scene ${config.name} already exists`);
    }

    const scene = new Scene(config);
    this._scenes.set(config.name, scene);
    return scene;
  }

  // 移除场景
  removeScene(name: string): void {
    if (this._currentScene?.name === name) {
      throw new Error('Cannot remove current scene');
    }
    this._scenes.delete(name);
  }

  // 切换场景
  switchScene(name: string, transitionDuration?: number): void {
    const nextScene = this._scenes.get(name);
    if (!nextScene) {
      throw new Error(`Scene ${name} not found`);
    }

    if (this._isTransitioning) {
      return;
    }

    this._nextScene = nextScene;
    this._isTransitioning = true;
    this._transitionTimer = 0;
    if (transitionDuration !== undefined) {
      this._transitionDuration = transitionDuration;
    }

    this.emit('transitionStart', {
      from: this._currentScene?.name,
      to: name,
    });
  }

  // 更新场景
  update(deltaTime: number): void {
    if (this._isTransitioning) {
      this.updateTransition(deltaTime);
    }

    if (this._currentScene) {
      this._currentScene.update(deltaTime);
    }
  }

  // 渲染场景
  render(): void {
    if (this._currentScene) {
      this._currentScene.render();
    }
  }

  // 获取当前场景
  getCurrentScene(): Scene | null {
    return this._currentScene;
  }

  // 获取场景
  getScene(name: string): Scene | undefined {
    return this._scenes.get(name);
  }

  // 检查场景是否存在
  hasScene(name: string): boolean {
    return this._scenes.has(name);
  }

  // 获取所有场景名称
  getSceneNames(): string[] {
    return Array.from(this._scenes.keys());
  }

  // 设置过渡时间
  setTransitionDuration(duration: number): void {
    this._transitionDuration = duration;
  }

  // 获取过渡时间
  getTransitionDuration(): number {
    return this._transitionDuration;
  }

  // 检查是否正在过渡
  isTransitioning(): boolean {
    return this._isTransitioning;
  }

  // 私有方法：更新场景过渡
  private updateTransition(deltaTime: number): void {
    this._transitionTimer += deltaTime;
    const progress = Math.min(1, this._transitionTimer / this._transitionDuration);

    if (progress >= 1) {
      this.completeTransition();
    }

    this.emit('transitionProgress', {
      progress,
      from: this._currentScene?.name,
      to: this._nextScene?.name,
    });
  }

  // 私有方法：完成场景过渡
  private completeTransition(): void {
    if (this._currentScene) {
      this._currentScene.exit();
    }

    this._currentScene = this._nextScene;
    this._nextScene = null;
    this._isTransitioning = false;

    if (this._currentScene) {
      if (!this._currentScene.isActive) {
        this._currentScene.init();
      }
      this._currentScene.enter();
    }

    this.emit('transitionComplete', {
      scene: this._currentScene?.name,
    });
  }
}