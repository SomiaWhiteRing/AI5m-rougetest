import Phaser from 'phaser'
import { GAME_CONFIG } from '../config/gameConfig'

interface Visible {
  visible: boolean
  setVisible(value: boolean): void
}

interface GameObject extends Visible {
  active: boolean
  on(event: string, fn: Function): void
  x: number
  y: number
  width?: number
  height?: number
}

export class RenderOptimizer {
  private static instance: RenderOptimizer
  private scene: Phaser.Scene
  private camera: Phaser.Cameras.Scene2D.Camera
  private cullPadding: number = 100 // 视野裁剪的额外边距

  private constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.camera = scene.cameras.main
  }

  static getInstance(scene: Phaser.Scene): RenderOptimizer {
    if (!RenderOptimizer.instance) {
      RenderOptimizer.instance = new RenderOptimizer(scene)
    }
    return RenderOptimizer.instance
  }

  optimizeGameObject(gameObject: Phaser.GameObjects.GameObject) {
    // 设置对象的裁剪区域
    if ('setCullPadding' in gameObject) {
      (gameObject as any).setCullPadding(this.cullPadding)
    }

    // 启用视野裁剪
    if (this.isVisible(gameObject)) {
      this.enableCulling(gameObject)
    }
  }

  private isVisible(obj: any): obj is GameObject {
    return (
      'visible' in obj &&
      'setVisible' in obj &&
      'active' in obj &&
      'on' in obj &&
      'x' in obj &&
      'y' in obj
    )
  }

  private enableCulling(gameObject: GameObject) {
    const updateVisibility = () => {
      if (!gameObject.active) return

      const bounds = this.getObjectBounds(gameObject)
      if (!bounds) return

      const cameraBounds = this.getCameraBounds()
      const isVisible = Phaser.Geom.Rectangle.Overlaps(cameraBounds, bounds)

      gameObject.setVisible(isVisible)
    }

    // 添加到场景更新列表
    this.scene.events.on('update', updateVisibility)

    // 当对象被销毁时移除更新监听
    gameObject.on('destroy', () => {
      this.scene.events.off('update', updateVisibility)
    })
  }

  private getObjectBounds(gameObject: GameObject): Phaser.Geom.Rectangle | null {
    if (!gameObject.x || !gameObject.y) return null

    const width = gameObject.width || GAME_CONFIG.tileSize
    const height = gameObject.height || GAME_CONFIG.tileSize

    return new Phaser.Geom.Rectangle(
      gameObject.x - width / 2 - this.cullPadding,
      gameObject.y - height / 2 - this.cullPadding,
      width + this.cullPadding * 2,
      height + this.cullPadding * 2
    )
  }

  private getCameraBounds(): Phaser.Geom.Rectangle {
    const camera = this.camera
    return new Phaser.Geom.Rectangle(
      camera.scrollX,
      camera.scrollY,
      camera.width,
      camera.height
    )
  }

  optimizeGroup(group: Phaser.GameObjects.Group) {
    group.getChildren().forEach(child => {
      this.optimizeGameObject(child)
    })

    // 监听新添加的对象
    group.on('addchild', (child: Phaser.GameObjects.GameObject) => {
      this.optimizeGameObject(child)
    })
  }

  optimizeParticles(emitter: Phaser.GameObjects.Particles.ParticleEmitter) {
    // 设置粒子系统的裁剪
    if ('setCullPadding' in emitter) {
      (emitter as any).setCullPadding(this.cullPadding)
    }
    if ('setDepth' in emitter) {
      (emitter as any).setDepth(1)
    }

    // 限制最大粒子数
    emitter.setQuantity(GAME_CONFIG.performance.maxParticles)
    
    // 设置粒子生命周期
    emitter.lifespan.onEmit = () => Phaser.Math.Between(500, 1000)

    // 设置粒子频率
    emitter.setFrequency(100)

    // 设置粒子缩放
    emitter.scaleX.onEmit = () => ({ start: 0.5, end: 0 })
    emitter.scaleY.onEmit = () => ({ start: 0.5, end: 0 })

    // 设置粒子透明度
    emitter.alpha.onEmit = () => ({ start: 1, end: 0 })
  }

  optimizeTilemap(tilemap: Phaser.Tilemaps.Tilemap) {
    // 设置瓦片地图的裁剪
    tilemap.setCollisionByProperty({ collides: true })
    tilemap.layers.forEach(layer => {
      if (layer.tilemapLayer) {
        layer.tilemapLayer.setCullPadding(this.cullPadding)
        layer.tilemapLayer.setDepth(0) // 确保地图在底层
      }
    })
  }

  setCullPadding(padding: number) {
    this.cullPadding = padding
  }

  update() {
    // 更新所有需要优化的对象
    this.scene.children.list.forEach(child => {
      if (this.isVisible(child)) {
        this.optimizeGameObject(child)
      }
    })
  }
} 