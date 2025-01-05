import React from 'react'
import { useTouch } from '../hooks/useTouch'
import { useGame } from '../game/GameContext'

interface ControlsProps {
  className?: string
}

const Controls: React.FC<ControlsProps> = ({ className = '' }) => {
  const { touchState, handleTouchStart, handleTouchEnd } = useTouch()
  const { setTouchState } = useGame()

  React.useEffect(() => {
    setTouchState(touchState)
  }, [touchState, setTouchState])

  return (
    <div className={`bg-gray-800 p-4 ${className}`}>
      <div className="grid grid-cols-3 gap-4 h-full">
        {/* 左侧空白 */}
        <div></div>
        
        {/* 方向键 */}
        <div className="grid grid-cols-3 grid-rows-3 gap-2">
          <div></div>
          <button
            className="bg-gray-700 rounded-lg p-4 active:bg-gray-600"
            onTouchStart={(e) => handleTouchStart(e.nativeEvent, 'up')}
            onTouchEnd={(e) => handleTouchEnd(e.nativeEvent, 'up')}
          >
            ↑
          </button>
          <div></div>
          <button
            className="bg-gray-700 rounded-lg p-4 active:bg-gray-600"
            onTouchStart={(e) => handleTouchStart(e.nativeEvent, 'left')}
            onTouchEnd={(e) => handleTouchEnd(e.nativeEvent, 'left')}
          >
            ←
          </button>
          <div></div>
          <button
            className="bg-gray-700 rounded-lg p-4 active:bg-gray-600"
            onTouchStart={(e) => handleTouchStart(e.nativeEvent, 'right')}
            onTouchEnd={(e) => handleTouchEnd(e.nativeEvent, 'right')}
          >
            →
          </button>
          <div></div>
          <button
            className="bg-gray-700 rounded-lg p-4 active:bg-gray-600"
            onTouchStart={(e) => handleTouchStart(e.nativeEvent, 'down')}
            onTouchEnd={(e) => handleTouchEnd(e.nativeEvent, 'down')}
          >
            ↓
          </button>
          <div></div>
        </div>
        
        {/* 右侧功能键 */}
        <div className="grid grid-rows-2 gap-4">
          <button
            className="bg-blue-600 rounded-lg p-4 active:bg-blue-700"
            onTouchStart={(e) => handleTouchStart(e.nativeEvent, 'a')}
            onTouchEnd={(e) => handleTouchEnd(e.nativeEvent, 'a')}
          >
            A
          </button>
          <button
            className="bg-red-600 rounded-lg p-4 active:bg-red-700"
            onTouchStart={(e) => handleTouchStart(e.nativeEvent, 'b')}
            onTouchEnd={(e) => handleTouchEnd(e.nativeEvent, 'b')}
          >
            B
          </button>
        </div>
      </div>
    </div>
  )
}

export default Controls 