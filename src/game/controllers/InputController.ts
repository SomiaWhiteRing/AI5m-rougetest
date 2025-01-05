import Phaser from 'phaser'

interface TouchState {
  up: boolean
  down: boolean
  left: boolean
  right: boolean
  a: boolean
  b: boolean
}

export class InputController {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys
  private touchState: TouchState = {
    up: false,
    down: false,
    left: false,
    right: false,
    a: false,
    b: false
  }

  constructor(scene: Phaser.Scene) {
    this.cursors = scene.input.keyboard.createCursorKeys()
  }

  setTouchState(state: TouchState) {
    this.touchState = state
  }

  isUp(): boolean {
    return this.cursors.up.isDown || this.touchState.up
  }

  isDown(): boolean {
    return this.cursors.down.isDown || this.touchState.down
  }

  isLeft(): boolean {
    return this.cursors.left.isDown || this.touchState.left
  }

  isRight(): boolean {
    return this.cursors.right.isDown || this.touchState.right
  }

  isActionA(): boolean {
    return this.cursors.space.isDown || this.touchState.a
  }

  isActionB(): boolean {
    return this.cursors.shift.isDown || this.touchState.b
  }
} 