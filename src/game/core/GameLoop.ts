import { EventEmitter } from 'events';
import { SceneManager } from './SceneManager';

export class GameLoop extends EventEmitter {
  private static _instance: GameLoop;
  private _isRunning: boolean;
  private _isPaused: boolean;
  private _lastTime: number;
  private _accumulator: number;
  private _timeStep: number;
  private _maxFrameTime: number;
  private _frameId: number | null;
  private _sceneManager: SceneManager;

  private constructor() {
    super();
    this._isRunning = false;
    this._isPaused = false;
    this._lastTime = 0;
    this._accumulator = 0;
    this._timeStep = 1 / 60; // 固定时间步长（60fps）
    this._maxFrameTime = 0.25; // 最大帧时间，防止螺旋效应
    this._frameId = null;
    this._sceneManager = SceneManager.getInstance();
  }

  static getInstance(): GameLoop {
    if (!GameLoop._instance) {
      GameLoop._instance = new GameLoop();
    }
    return GameLoop._instance;
  }

  // 启动游戏循环
  start(): void {
    if (this._isRunning) return;

    this._isRunning = true;
    this._isPaused = false;
    this._lastTime = performance.now() / 1000;
    this._accumulator = 0;

    this.emit('start');
    this.loop();
  }

  // 停止游戏循环
  stop(): void {
    if (!this._isRunning) return;

    this._isRunning = false;
    this._isPaused = false;
    if (this._frameId !== null) {
      cancelAnimationFrame(this._frameId);
      this._frameId = null;
    }

    this.emit('stop');
  }

  // 暂停游戏循环
  pause(): void {
    if (!this._isRunning || this._isPaused) return;

    this._isPaused = true;
    this.emit('pause');
  }

  // 恢复游戏循环
  resume(): void {
    if (!this._isRunning || !this._isPaused) return;

    this._isPaused = false;
    this._lastTime = performance.now() / 1000;
    this.emit('resume');
  }

  // 设置固定时间步长
  setTimeStep(timeStep: number): void {
    this._timeStep = timeStep;
  }

  // 设置最大帧时间
  setMaxFrameTime(maxFrameTime: number): void {
    this._maxFrameTime = maxFrameTime;
  }

  // 获取当前是否正在运行
  isRunning(): boolean {
    return this._isRunning;
  }

  // 获取当前是否暂停
  isPaused(): boolean {
    return this._isPaused;
  }

  // 获取固定时间步长
  getTimeStep(): number {
    return this._timeStep;
  }

  // 获取最大帧时间
  getMaxFrameTime(): number {
    return this._maxFrameTime;
  }

  // 主循环
  private loop(): void {
    this._frameId = requestAnimationFrame(() => this.loop());

    if (!this._isRunning || this._isPaused) return;

    const currentTime = performance.now() / 1000;
    let deltaTime = currentTime - this._lastTime;
    this._lastTime = currentTime;

    // 限制最大帧时间，防止螺旋效应
    if (deltaTime > this._maxFrameTime) {
      deltaTime = this._maxFrameTime;
    }

    // 累加器模式，确保固定时间步长
    this._accumulator += deltaTime;

    // 发出帧开始事件
    this.emit('frameStart', { deltaTime, currentTime });

    // 固定时间步长更新
    while (this._accumulator >= this._timeStep) {
      this.fixedUpdate(this._timeStep);
      this._accumulator -= this._timeStep;
    }

    // 变帧率更新
    this.update(deltaTime);

    // 渲染
    this.render();

    // 发出帧结束事件
    this.emit('frameEnd', { deltaTime, currentTime });
  }

  // 固定时间步长更新
  private fixedUpdate(timeStep: number): void {
    this.emit('fixedUpdate', timeStep);
  }

  // 变帧率更新
  private update(deltaTime: number): void {
    // 更新场景
    this._sceneManager.update(deltaTime);
    this.emit('update', deltaTime);
  }

  // 渲染
  private render(): void {
    // 渲染场景
    this._sceneManager.render();
    this.emit('render');
  }
}