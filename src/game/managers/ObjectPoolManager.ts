import Phaser from 'phaser'
import { Enemy } from '../entities/Enemy'
import { EnemyType, ENEMY_CONFIGS } from '../types/enemy'
import { GAME_CONFIG } from '../config/gameConfig'

interface PoolConfig {
  maxSize: number
  initialSize: number
}

interface PoolItem {
  type: string
  factory: () => any
  config?: any
}

export class ObjectPoolManager {
  private static instance: ObjectPoolManager
  private scene: Phaser.Scene
  private pools: Map<string, Phaser.GameObjects.Group> = new Map()
  private poolConfigs: Map<string, PoolConfig> = new Map()
  private poolItems: Map<string, PoolItem> = new Map()

  private constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.initializeDefaultPools()
  }

  static getInstance(scene: Phaser.Scene): ObjectPoolManager {
    if (!ObjectPoolManager.instance) {
      ObjectPoolManager.instance = new ObjectPoolManager(scene)
    }
    return ObjectPoolManager.instance
  }

  private initializeDefaultPools() {
    // 配置默认对象池
    this.poolConfigs.set('enemy', {
      maxSize: GAME_CONFIG.performance.maxEnemies,
      initialSize: 10
    })
    this.poolConfigs.set('particle', {
      maxSize: GAME_CONFIG.performance.maxParticles,
      initialSize: 20
    })

    // 初始化默认对象池
    this.registerPool('enemy', {
      type: 'enemy',
      factory: () => new Enemy(this.scene, 0, 0, ENEMY_CONFIGS[EnemyType.SLIME])
    })
    this.registerPool('particle', {
      type: 'particle',
      factory: () => this.scene.add.particles(0, 0, 'particle')
    })
  }

  registerPool(key: string, item: PoolItem) {
    this.poolItems.set(key, item)
    this.createPool(key)
  }

  private createPool(key: string) {
    const config = this.poolConfigs.get(key)
    const item = this.poolItems.get(key)
    if (!config || !item) return

    const group = this.scene.add.group({
      maxSize: config.maxSize,
      classType: item.factory().constructor
    })

    // 预创建对象
    for (let i = 0; i < config.initialSize; i++) {
      const obj = item.factory()
      obj.setActive(false)
      obj.setVisible(false)
      group.add(obj)
    }

    this.pools.set(key, group)
  }

  spawn(key: string, x: number, y: number, config?: any): any {
    const pool = this.pools.get(key)
    if (!pool) return null

    const obj = pool.get(x, y)
    if (!obj) return null

    obj.setActive(true)
    obj.setVisible(true)
    
    if (config) {
      if (key === 'enemy' && config.type && Object.values(EnemyType).includes(config.type)) {
        const enemyConfig = ENEMY_CONFIGS[config.type as EnemyType]
        if (enemyConfig) {
          Object.assign(obj, { enemyConfig })
        }
      } else {
        Object.assign(obj, config)
      }
    }

    return obj
  }

  despawn(key: string, obj: any) {
    const pool = this.pools.get(key)
    if (!pool) return

    obj.setActive(false)
    obj.setVisible(false)
    pool.killAndHide(obj)
  }

  clear(key?: string) {
    if (key) {
      const pool = this.pools.get(key)
      if (pool) {
        pool.clear(true, true)
      }
    } else {
      this.pools.forEach(pool => pool.clear(true, true))
    }
  }

  getPool(key: string): Phaser.GameObjects.Group | undefined {
    return this.pools.get(key)
  }

  getActiveCount(key: string): number {
    const pool = this.pools.get(key)
    return pool ? pool.countActive() : 0
  }

  getTotalCount(key: string): number {
    const pool = this.pools.get(key)
    return pool ? pool.getLength() : 0
  }
} 