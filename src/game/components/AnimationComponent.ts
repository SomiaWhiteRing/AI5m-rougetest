import { Component } from '../core/Component';
import { Entity } from '../core/Entity';

export interface AnimationFrame {
  key: string;
  duration: number;
}

export interface AnimationData {
  name: string;
  frames: AnimationFrame[];
  loop?: boolean;
  frameRate?: number;
}

export class AnimationComponent extends Component {
  private _animations: Map<string, AnimationData>;
  private _currentAnimation: string | null;
  private _currentFrame: number;
  private _frameTime: number;
  private _isPlaying: boolean;
  private _defaultFrameRate: number;

  constructor(entity: Entity, defaultFrameRate: number = 24) {
    super(entity);
    this._animations = new Map();
    this._currentAnimation = null;
    this._currentFrame = 0;
    this._frameTime = 0;
    this._isPlaying = false;
    this._defaultFrameRate = defaultFrameRate;
  }

  onInit(): void {
    // 初始化时不需要特殊处理
  }

  // 添加动画
  addAnimation(animation: AnimationData): void {
    this._animations.set(animation.name, {
      ...animation,
      frameRate: animation.frameRate || this._defaultFrameRate,
      loop: animation.loop !== undefined ? animation.loop : true,
    });
  }

  // 移除动画
  removeAnimation(name: string): void {
    this._animations.delete(name);
    if (this._currentAnimation === name) {
      this.stop();
    }
  }

  // 播放动画
  play(name: string, resetFrame: boolean = true): void {
    const animation = this._animations.get(name);
    if (!animation) {
      console.warn(`Animation "${name}" not found`);
      return;
    }

    if (this._currentAnimation !== name || resetFrame) {
      this._currentAnimation = name;
      this._currentFrame = 0;
      this._frameTime = 0;
      this._isPlaying = true;
      this.emit('animationStart', { name });
    }
  }

  // 停止动画
  stop(): void {
    if (this._isPlaying) {
      this._isPlaying = false;
      this.emit('animationStop', { name: this._currentAnimation });
    }
  }

  // 暂停动画
  pause(): void {
    if (this._isPlaying) {
      this._isPlaying = false;
      this.emit('animationPause', { name: this._currentAnimation });
    }
  }

  // 恢复动画
  resume(): void {
    if (!this._isPlaying && this._currentAnimation) {
      this._isPlaying = true;
      this.emit('animationResume', { name: this._currentAnimation });
    }
  }

  // 更新动画
  protected onUpdate(deltaTime: number): void {
    if (!this._isPlaying || !this._currentAnimation) return;

    const animation = this._animations.get(this._currentAnimation);
    if (!animation) return;

    this._frameTime += deltaTime;
    const frameDuration = 1 / (animation.frameRate || this._defaultFrameRate);

    while (this._frameTime >= frameDuration) {
      this._frameTime -= frameDuration;
      this._currentFrame++;

      if (this._currentFrame >= animation.frames.length) {
        if (animation.loop) {
          this._currentFrame = 0;
          this.emit('animationLoop', { name: this._currentAnimation });
        } else {
          this._currentFrame = animation.frames.length - 1;
          this.stop();
          this.emit('animationComplete', { name: this._currentAnimation });
          break;
        }
      }

      // 发出帧更新事件
      this.emit('frameChanged', {
        name: this._currentAnimation,
        frame: animation.frames[this._currentFrame],
        frameIndex: this._currentFrame,
      });
    }
  }

  // 获取当前动画
  getCurrentAnimation(): string | null {
    return this._currentAnimation;
  }

  // 获取当前帧
  getCurrentFrame(): AnimationFrame | null {
    if (!this._currentAnimation) return null;
    const animation = this._animations.get(this._currentAnimation);
    if (!animation) return null;
    return animation.frames[this._currentFrame];
  }

  // 获取当前帧索引
  getCurrentFrameIndex(): number {
    return this._currentFrame;
  }

  // 检查动画是否存在
  hasAnimation(name: string): boolean {
    return this._animations.has(name);
  }

  // 获取动画数据
  getAnimation(name: string): AnimationData | undefined {
    return this._animations.get(name);
  }

  // 获取所有动画名称
  getAnimationNames(): string[] {
    return Array.from(this._animations.keys());
  }

  // 设置默认帧率
  setDefaultFrameRate(frameRate: number): void {
    this._defaultFrameRate = frameRate;
  }

  // 获取默认帧率
  getDefaultFrameRate(): number {
    return this._defaultFrameRate;
  }

  // 检查是否正在播放
  isPlaying(): boolean {
    return this._isPlaying;
  }
}