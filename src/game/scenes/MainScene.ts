import { Scene } from '../core/SceneManager';
import { Entity } from '../core/Entity';
import { MovementComponent } from '../components/MovementComponent';
import { AnimationComponent } from '../components/AnimationComponent';
import { CollisionComponent } from '../components/CollisionComponent';
import { AIComponent } from '../components/AIComponent';

export class MainScene {
  private _player: Entity | null = null;
  private _enemies: Entity[] = [];
  private _items: Entity[] = [];
  private _map: any = null; // 地图数据，后续需要实现地图系统

  // 初始化场景
  init(): void {
    // 初始化玩家
    this.createPlayer();

    // 初始化敌人
    this.createEnemies();

    // 初始化物品
    this.createItems();

    // 初始化地图
    this.createMap();

    // 设置碰撞
    this.setupCollisions();

    // 设置事件监听
    this.setupEventListeners();
  }

  // 进入场景
  enter(): void {
    // 场景进入时的逻辑
    console.log('Entering MainScene');
  }

  // 退出场景
  exit(): void {
    // 场景退出时的逻辑
    console.log('Exiting MainScene');
  }

  // 更新场景
  update(deltaTime: number): void {
    // 更新玩家
    if (this._player) {
      this._player.update(deltaTime);
    }

    // 更新敌人
    for (const enemy of this._enemies) {
      enemy.update(deltaTime);
    }

    // 更新物品
    for (const item of this._items) {
      item.update(deltaTime);
    }

    // 检查碰撞
    this.checkCollisions();
  }

  // 渲染场景
  render(): void {
    // 渲染逻辑，如果需要的话
    // 目前使用Canvas/WebGL渲染，可能不需要手动实现
  }

  private createPlayer(): void {
    // 创建玩家实体
    this._player = new Entity({
      maxHealth: 100,
      health: 100,
      shield: 0,
      maxShield: 50,
      level: 1,
      experience: 0,
      experienceToNextLevel: 100,
      attack: 10,
      defense: 5,
      speed: 5,
    });

    // 添加移动组件
    const movement = new MovementComponent(this._player, {
      maxSpeed: 200,
      acceleration: 800,
      deceleration: 800,
      rotationSpeed: 180,
    });
    this._player.addComponent(movement);

    // 添加动画组件
    const animation = new AnimationComponent(this._player);
    // 添加动画数据
    animation.addAnimation({
      name: 'idle',
      frames: [
        { key: 'player_idle_1', duration: 0.1 },
        { key: 'player_idle_2', duration: 0.1 },
      ],
      loop: true,
    });
    animation.addAnimation({
      name: 'walk',
      frames: [
        { key: 'player_walk_1', duration: 0.1 },
        { key: 'player_walk_2', duration: 0.1 },
        { key: 'player_walk_3', duration: 0.1 },
        { key: 'player_walk_4', duration: 0.1 },
      ],
      loop: true,
    });
    animation.addAnimation({
      name: 'attack',
      frames: [
        { key: 'player_attack_1', duration: 0.05 },
        { key: 'player_attack_2', duration: 0.05 },
        { key: 'player_attack_3', duration: 0.1 },
      ],
      loop: false,
    });
    this._player.addComponent(animation);

    // 添加碰撞组件
    const collision = new CollisionComponent(this._player, {
      type: 'circle',
      width: 32,
      height: 32,
      offset: { x: 0, y: 0 },
    });
    this._player.addComponent(collision);

    // 播放默认动画
    animation.play('idle');
  }

  private createEnemies(): void {
    // 创建示例敌人
    for (let i = 0; i < 5; i++) {
      const enemy = new Entity({
        maxHealth: 50,
        health: 50,
        shield: 0,
        maxShield: 0,
        level: 1,
        experience: 0,
        experienceToNextLevel: 100,
        attack: 5,
        defense: 2,
        speed: 3,
      });

      // 设置位置
      enemy.position = {
        x: Math.random() * 800,
        y: Math.random() * 600,
      };

      // 添加移动组件
      const movement = new MovementComponent(enemy, {
        maxSpeed: 100,
        acceleration: 400,
        deceleration: 400,
        rotationSpeed: 90,
      });
      enemy.addComponent(movement);

      // 添加动画组件
      const animation = new AnimationComponent(enemy);
      animation.addAnimation({
        name: 'idle',
        frames: [
          { key: 'enemy_idle_1', duration: 0.1 },
          { key: 'enemy_idle_2', duration: 0.1 },
        ],
        loop: true,
      });
      animation.addAnimation({
        name: 'walk',
        frames: [
          { key: 'enemy_walk_1', duration: 0.1 },
          { key: 'enemy_walk_2', duration: 0.1 },
        ],
        loop: true,
      });
      enemy.addComponent(animation);

      // 添加碰撞组件
      const collision = new CollisionComponent(enemy, {
        type: 'circle',
        width: 32,
        height: 32,
        offset: { x: 0, y: 0 },
      });
      enemy.addComponent(collision);

      // 添加AI组件
      const ai = new AIComponent(enemy, {
        detectionRange: 200,
        attackRange: 50,
        patrolRadius: 100,
        chaseSpeed: 150,
        patrolSpeed: 80,
        fleeThreshold: 0.3,
        attackCooldown: 1,
      });
      enemy.addComponent(ai);

      // 播放默认动画
      animation.play('idle');

      this._enemies.push(enemy);
    }
  }

  private createItems(): void {
    // 创建示例物品
    // 后续需要实现物品系统
  }

  private createMap(): void {
    // 创建地图
    // 后续需要实现地图系统
  }

  private setupCollisions(): void {
    // 设置碰撞检测
    if (!this._player) return;

    const playerCollision = this._player.getComponent<CollisionComponent>('CollisionComponent');
    if (!playerCollision) return;

    // 检查与敌人的碰撞
    for (const enemy of this._enemies) {
      const enemyCollision = enemy.getComponent<CollisionComponent>('CollisionComponent');
      if (!enemyCollision) continue;

      if (playerCollision.checkCollision(enemyCollision)) {
        playerCollision.onCollisionEnter(enemyCollision);
        enemyCollision.onCollisionEnter(playerCollision);
      }
    }
  }

  private setupEventListeners(): void {
    // 设置事件监听
    if (!this._player) return;

    // 监听玩家事件
    this._player.on('damaged', (data) => {
      console.log('Player damaged:', data);
    });

    this._player.on('healed', (data) => {
      console.log('Player healed:', data);
    });

    this._player.on('levelUp', (data) => {
      console.log('Player leveled up:', data);
    });

    // 监听敌人事件
    for (const enemy of this._enemies) {
      enemy.on('damaged', (data) => {
        console.log('Enemy damaged:', data);
      });

      enemy.on('died', () => {
        console.log('Enemy died');
        // 移除敌人
        this._enemies = this._enemies.filter(e => e !== enemy);
      });
    }
  }

  private checkCollisions(): void {
    // 检查碰撞
    this.setupCollisions();
  }

  // 公共方法
  getPlayer(): Entity | null {
    return this._player;
  }

  getEnemies(): Entity[] {
    return this._enemies;
  }

  getItems(): Entity[] {
    return this._items;
  }
}