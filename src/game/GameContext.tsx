import React, { createContext, useContext, useEffect, useState } from 'react'
import Phaser from 'phaser'
import { GameScene } from './scenes/GameScene'

interface TouchState {
  up: boolean
  down: boolean
  left: boolean
  right: boolean
  a: boolean
  b: boolean
}

interface GameContextType {
  game: Phaser.Game | null
  setTouchState: (state: TouchState) => void
}

const GameContext = createContext<GameContextType>({
  game: null,
  setTouchState: () => {}
})

export const useGame = () => useContext(GameContext)

interface GameProviderProps {
  children: React.ReactNode
  containerRef: React.RefObject<HTMLDivElement>
}

export const GameProvider: React.FC<GameProviderProps> = ({ children, containerRef }) => {
  const [game, setGame] = useState<Phaser.Game | null>(null)
  const [scene, setScene] = useState<GameScene | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: window.innerWidth,
      height: window.innerHeight * 0.6,
      scene: GameScene,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: false
        }
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
    }

    const game = new Phaser.Game(config)
    setGame(game)

    const gameScene = game.scene.getScene('GameScene') as GameScene
    setScene(gameScene)

    return () => {
      game.destroy(true)
    }
  }, [containerRef])

  const setTouchState = (state: TouchState) => {
    if (scene) {
      scene.setTouchState(state)
    }
  }

  return (
    <GameContext.Provider value={{ game, setTouchState }}>
      {children}
    </GameContext.Provider>
  )
} 