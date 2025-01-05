import { EventEmitter } from 'events';
import { GameLoop } from './core/GameLoop';
import { SceneManager } from './core/SceneManager';
import { MapManager } from './map/MapManager';
import { MainScene } from './scenes/MainScene';
import { Input } from './ui/Input';

export class Game extends EventEmitter {
  private static _instance: Game | null = null;
  private _canvas: HTMLCanvasElement;
  private _context: CanvasRenderingContext2D;
  private _sceneManager: SceneManager;
  private _mapManager: MapManager;
  private _isInitialized: boolean = false;
  private components: Array<Input> = [];
  private focusedComponent: Input | null = null;
  private animationFrameId: number | null = null;
  private lastTimestamp: number = 0;
  private _gameLoop: GameLoop = GameLoop.getInstance();

  private constructor(canvas: HTMLCanvasElement) {
    super();
    this._canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2D context');
    this._context = ctx;

    this._sceneManager = SceneManager.getInstance();
    this._mapManager = MapManager.getInstance();

    // 设置画布尺寸
    this.resizeCanvas();

    // 添加事件监听
    window.addEventListener('resize', this.resizeCanvas.bind(this));
    canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    canvas.addEventListener('keydown', this.handleKeyDown.bind(this));
    canvas.addEventListener('compositionstart', this.handleCompositionStart.bind(this));
    canvas.addEventListener('compositionupdate', this.handleCompositionUpdate.bind(this));
    canvas.addEventListener('compositionend', this.handleCompositionEnd.bind(this));

    // 创建测试输入框
    const testInput = new Input({
      position: { x: 100, y: 100 },
      size: { width: 200, height: 32 },
      placeholder: '请输入文本...',
      value: '',
      zIndex: 100,
    });
    this.addComponent(testInput);
  }

  static getInstance(canvas?: HTMLCanvasElement): Game {
    if (!Game._instance) {
      if (!canvas) {
        throw new Error('Canvas is required for first initialization');
      }
      Game._instance = new Game(canvas);
    }
    return Game._instance;
  }

  // 初始化游戏
  async initialize(): Promise<void> {
    if (this._isInitialized) return;

    // 初始化地图管理器
    this._mapManager.initRenderer(this._canvas);

    // 初始化场景
    this.initializeScenes();

    // 设置游戏循环事件监听
    this.setupEventListeners();

    this._isInitialized = true;
    this.emit('initialized');
  }

  // 初始化场景
  private initializeScenes(): void {
    // 创建主场景
    const mainScene = new MainScene();
    this._sceneManager.addScene({
      name: 'main',
      onInit: () => mainScene.init(),
      onEnter: () => mainScene.enter(),
      onExit: () => mainScene.exit(),
      onUpdate: (deltaTime) => mainScene.update(deltaTime),
      onRender: () => mainScene.render(),
    });

    // 切换到主场景
    this._sceneManager.switchScene('main');
  }

  // 设置事件监听
  private setupEventListeners(): void {
    // 游戏循环事件
    this._gameLoop.on('update', (deltaTime: number) => {
      this.update(deltaTime);
    });

    this._gameLoop.on('render', () => {
      this.render();
    });

    // 场景事件
    this._sceneManager.on('transitionStart', (data) => {
      this.emit('sceneTransitionStart', data);
    });

    this._sceneManager.on('transitionComplete', (data) => {
      this.emit('sceneTransitionComplete', data);
    });

    // 地图事件
    this._mapManager.on('mapGenerated', (data) => {
      this.emit('mapGenerated', data);
    });

    this._mapManager.on('mapRendered', () => {
      this.emit('mapRendered');
    });
  }

  // 更新游戏状态
  private update(deltaTime: number): void {
    if (!this._isInitialized) return;

    // 更新场景
    this._sceneManager.update(deltaTime);

    // 更新组件
    for (const component of this.components) {
      component.update(deltaTime);
    }
  }

  // 渲染游戏画面
  private render(): void {
    if (!this._isInitialized) return;

    // 清空画布
    this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);

    // 渲染场景
    this._sceneManager.render();

    // 渲染组件
    for (const component of this.components) {
      component.render(this._context);
    }
  }

  // 调整画布尺寸
  private resizeCanvas(): void {
    this._canvas.width = window.innerWidth;
    this._canvas.height = window.innerHeight;
  }

  // 添加组件
  addComponent(component: Input): void {
    this.components.push(component);
    this.components.sort((a, b) => (a.getStyle().zIndex || 0) - (b.getStyle().zIndex || 0));
  }

  // 移除组件
  removeComponent(component: Input): void {
    const index = this.components.indexOf(component);
    if (index !== -1) {
      this.components.splice(index, 1);
      if (this.focusedComponent === component) {
        this.focusedComponent = null;
      }
    }
  }

  // 处理鼠标按下事件
  private handleMouseDown(event: MouseEvent): void {
    const rect = this._canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // 从上到下遍历组件，找到第一个被点击的组件
    for (let i = this.components.length - 1; i >= 0; i--) {
      const component = this.components[i];
      if (component.containsPoint(x, y)) {
        if (this.focusedComponent !== component) {
          if (this.focusedComponent) {
            this.focusedComponent.onBlur();
          }
          this.focusedComponent = component;
          component.onFocus();
        }
        return;
      }
    }

    // 如果点击空白处，取消焦点
    if (this.focusedComponent) {
      this.focusedComponent.onBlur();
      this.focusedComponent = null;
    }
  }

  // 处理鼠标移动事件
  private handleMouseMove(event: MouseEvent): void {
    const rect = this._canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // 更新鼠标样式
    let isOverComponent = false;
    for (let i = this.components.length - 1; i >= 0; i--) {
      const component = this.components[i];
      if (component.containsPoint(x, y)) {
        this._canvas.style.cursor = 'text';
        isOverComponent = true;
        break;
      }
    }
    if (!isOverComponent) {
      this._canvas.style.cursor = 'default';
    }
  }

  // 处理鼠标松开事件
  private handleMouseUp(event: MouseEvent): void {
    // 可以添加拖拽等功能
  }

  // 处理键盘事件
  private handleKeyDown(event: KeyboardEvent): void {
    if (this.focusedComponent) {
      this.focusedComponent.onKeyDown(event);
    }
  }

  // 处理输入法编辑开始事件
  private handleCompositionStart(event: CompositionEvent): void {
    if (this.focusedComponent) {
      this.focusedComponent.onCompositionStart();
    }
  }

  // 处理输入法编辑更新事件
  private handleCompositionUpdate(event: CompositionEvent): void {
    if (this.focusedComponent) {
      this.focusedComponent.onCompositionUpdate(event.data);
    }
  }

  // 处理输入法编辑结束事件
  private handleCompositionEnd(event: CompositionEvent): void {
    if (this.focusedComponent) {
      this.focusedComponent.onCompositionEnd(event.data);
    }
  }

  // 启动游戏
  async start(): Promise<void> {
    if (!this._isInitialized) {
      await this.initialize();
    }

    this._gameLoop.start();
    this.emit('started');
  }

  // 停止游戏
  stop(): void {
    this._gameLoop.stop();
    this.emit('stopped');
  }

  // 暂停游戏
  pause(): void {
    this._gameLoop.pause();
    this.emit('paused');
  }

  // 恢复游戏
  resume(): void {
    this._gameLoop.resume();
    this.emit('resumed');
  }

  // 重置游戏
  reset(): void {
    this.stop();
    this._mapManager.clear();
    this._sceneManager.switchScene('main');
    this.start();
    this.emit('reset');
  }

  // 获取游戏循环实例
  getGameLoop(): GameLoop {
    return this._gameLoop;
  }

  // 获取场景管理器实例
  getSceneManager(): SceneManager {
    return this._sceneManager;
  }

  // 获取地图管理器实例
  getMapManager(): MapManager {
    return this._mapManager;
  }

  // 获取画布
  getCanvas(): HTMLCanvasElement {
    return this._canvas;
  }

  // 获取渲染上下文
  getContext(): CanvasRenderingContext2D {
    return this._context;
  }

  // 检查是否已初始化
  isInitialized(): boolean {
    return this._isInitialized;
  }

  public destroy(): void {
    if (!this._isInitialized) return;

    // 移除事件监听
    window.removeEventListener('resize', this.resizeCanvas.bind(this));
    this._canvas.removeEventListener('mousedown', this.handleMouseDown.bind(this));
    this._canvas.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    this._canvas.removeEventListener('mouseup', this.handleMouseUp.bind(this));
    this._canvas.removeEventListener('keydown', this.handleKeyDown.bind(this));
    this._canvas.removeEventListener('compositionstart', this.handleCompositionStart.bind(this));
    this._canvas.removeEventListener('compositionupdate', this.handleCompositionUpdate.bind(this));
    this._canvas.removeEventListener('compositionend', this.handleCompositionEnd.bind(this));

    // 销毁所有组件
    for (const component of this.components) {
      component.destroy();
    }
    this.components = [];
    this.focusedComponent = null;

    // 销毁场景管理器和地图管理器
    this._sceneManager.destroy();
    this._mapManager.destroy();

    // 重置状态
    this._isInitialized = false;
    Game._instance = null;

    this.emit('destroy');
  }
}