import { Scene } from 'phaser'
import { Player } from '../entities/Player'
import { Enemy } from '../entities/Enemy'
import { ENEMY_CONFIGS } from '../types/enemy'

export class GameScene extends Scene {
  private player!: Player
  private enemies: Enemy[] = []
  private map!: Phaser.Tilemaps.Tilemap
  private spawnTimer: number = 0
  private spawnInterval: number = 3000 // 每3秒生成一个敌人

  constructor() {
    super({ key: 'GameScene' })
  }

  preload(): void {
    // 加载资源
    this.load.image('tiles', 'assets/tiles.png')
    this.load.tilemapTiledJSON('map', 'assets/map.json')
    this.load.image('player', 'assets/player.png')
    this.load.spritesheet('enemies', 'assets/enemies.png', { frameWidth: 32, frameHeight: 32 })
    this.load.spritesheet('items', 'assets/items.png', { frameWidth: 32, frameHeight: 32 })
  }

  create(): void {
    // 创建地图
    this.createMap()

    // 创建玩家
    this.player = new Player(this, 400, 300)

    // 设置相机跟随
    this.cameras.main.startFollow(this.player)
    this.cameras.main.setZoom(1.5)

    // 设置世界边界
    this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)

    // 创建初始敌人
    this.spawnEnemies(5)
  }

  update(time: number, delta: number): void {
    // 更新玩家
    this.player.update()

    // 更新敌人
    this.enemies.forEach(enemy => {
      enemy.update(time)
    })

    // 生成新敌人
    this.spawnTimer += delta
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0
      this.spawnEnemies(1)
    }

    // 清理已销毁的敌人
    this.enemies = this.enemies.filter(enemy => enemy.active)
  }

  private createMap(): void {
    // 创建地图
    this.map = this.make.tilemap({ key: 'map' })
    const tileset = this.map.addTilesetImage('tiles', 'tiles')
    if (!tileset) return

    // 创建图层
    this.map.createLayer('ground', tileset, 0, 0)
    const wallsLayer = this.map.createLayer('walls', tileset, 0, 0)
    if (!wallsLayer) return

    // 设置墙壁碰撞
    wallsLayer.setCollisionByProperty({ collides: true })
    this.physics.add.collider(this.player, wallsLayer)
  }

  private spawnEnemies(count: number): void {
    for (let i = 0; i < count; i++) {
      // 随机选择敌人类型
      const enemyTypes = Object.keys(ENEMY_CONFIGS)
      const randomType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)]
      const config = ENEMY_CONFIGS[randomType]

      // 随机生成位置
      const x = Phaser.Math.Between(100, this.map.widthInPixels - 100)
      const y = Phaser.Math.Between(100, this.map.heightInPixels - 100)

      // 创建敌人
      const enemy = new Enemy(this, x, y, config)
      enemy.setTarget(this.player)
      this.enemies.push(enemy)

      // 添加碰撞
      this.physics.add.collider(enemy, this.map.getLayer('walls').tilemapLayer)
      this.physics.add.collider(enemy, this.player)
    }
  }
} 