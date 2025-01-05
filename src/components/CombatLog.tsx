import React, { useEffect, useRef } from 'react'

interface CombatMessage {
  id: string
  type: 'damage' | 'heal' | 'buff' | 'debuff' | 'status' | 'system'
  text: string
  timestamp: number
}

interface CombatLogProps {
  messages: CombatMessage[]
}

export const CombatLog: React.FC<CombatLogProps> = ({ messages }) => {
  const logRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [messages])

  const getMessageColor = (type: CombatMessage['type']) => {
    switch (type) {
      case 'damage':
        return 'text-red-400'
      case 'heal':
        return 'text-green-400'
      case 'buff':
        return 'text-blue-400'
      case 'debuff':
        return 'text-purple-400'
      case 'status':
        return 'text-yellow-400'
      default:
        return 'text-gray-400'
    }
  }

  return (
    <div
      ref={logRef}
      className="bg-gray-800 bg-opacity-80 rounded-lg p-4 h-full overflow-y-auto pointer-events-auto"
    >
      <div className="flex flex-col gap-2">
        {messages.map(message => (
          <div
            key={message.id}
            className={`text-sm ${getMessageColor(message.type)} transition-opacity duration-200`}
          >
            <span className="text-gray-500">
              {new Date(message.timestamp).toLocaleTimeString()}
            </span>
            {' '}
            {message.text}
          </div>
        ))}
      </div>
    </div>
  )
} 