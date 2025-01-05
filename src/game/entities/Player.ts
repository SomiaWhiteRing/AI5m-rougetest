import { Scene } from 'phaser'

export class Player extends Phaser.Physics.Arcade.Sprite {
  private _health: number = 100
  private _maxHealth: number = 100
  private _level: number = 1
  private _experience: number = 0
  private _experienceToNextLevel: number = 100
  private _gold: number = 0
  private _speed: number = 200
  private _damage: number = 10
  private _defense: number = 5

  constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y, 'player')
    scene.add.existing(this)
    scene.physics.add.existing(this)

    // 设置物理属性
    this.setCollideWorldBounds(true)
  }

  update(): void {
    // 处理移动输入
    const cursors = this.scene.input.keyboard.createCursorKeys()
    
    // 重置速度
    this.setVelocity(0)

    if (cursors.left.isDown) {
      this.setVelocityX(-this._speed)
    } else if (cursors.right.isDown) {
      this.setVelocityX(this._speed)
    }

    if (cursors.up.isDown) {
      this.setVelocityY(-this._speed)
    } else if (cursors.down.isDown) {
      this.setVelocityY(this._speed)
    }
  }

  // 公共访问器
  get health(): number {
    return this._health
  }

  get maxHealth(): number {
    return this._maxHealth
  }

  get level(): number {
    return this._level
  }

  get experience(): number {
    return this._experience
  }

  get experienceToNextLevel(): number {
    return this._experienceToNextLevel
  }

  get gold(): number {
    return this._gold
  }

  // 伤害处理
  takeDamage(amount: number): void {
    this._health = Math.max(0, this._health - Math.max(0, amount - this._defense))
    if (this._health <= 0) {
      this.die()
    }
  }

  // 治疗处理
  heal(amount: number): void {
    this._health = Math.min(this._maxHealth, this._health + amount)
  }

  // 获得经验
  gainExperience(amount: number): void {
    this._experience += amount
    while (this._experience >= this._experienceToNextLevel) {
      this.levelUp()
    }
  }

  // 获得金币
  gainGold(amount: number): void {
    this._gold += amount
  }

  // 花费金币
  spendGold(amount: number): boolean {
    if (this._gold >= amount) {
      this._gold -= amount
      return true
    }
    return false
  }

  // 升级处理
  private levelUp(): void {
    this._level++
    this._experience -= this._experienceToNextLevel
    this._experienceToNextLevel = Math.floor(this._experienceToNextLevel * 1.5)
    
    // 提升属性
    this._maxHealth += 10
    this._health = this._maxHealth
    this._damage += 2
    this._defense += 1
  }

  // 死亡处理
  private die(): void {
    // 触发死亡事件
    this.emit('died')
  }
} 