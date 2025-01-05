import React, { useEffect, useRef, useState } from 'react'
import { useGameStore } from '../stores/gameStore'

interface TouchPoint {
  id: number
  startX: number
  startY: number
  currentX: number
  currentY: number
}

interface TouchControlsProps {
  onMove?: (x: number, y: number) => void
  onSkillUse?: (skillId: string) => void
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onMove,
  onSkillUse
}) => {
  const [joystickTouch, setJoystickTouch] = useState<TouchPoint | null>(null)
  const [skillTouches, setSkillTouches] = useState<Map<string, TouchPoint>>(new Map())
  const joystickRef = useRef<HTMLDivElement>(null)
  const { settings } = useGameStore()

  const JOYSTICK_SIZE = 150
  const JOYSTICK_KNOB_SIZE = 50
  const SKILL_BUTTON_SIZE = 60
  const MAX_JOYSTICK_DISTANCE = JOYSTICK_SIZE / 2 - JOYSTICK_KNOB_SIZE / 2

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      const touch = e.touches[0]
      const target = touch.target as HTMLElement

      if (target.closest('.joystick-area')) {
        setJoystickTouch({
          id: touch.identifier,
          startX: touch.clientX,
          startY: touch.clientY,
          currentX: touch.clientX,
          currentY: touch.clientY
        })
      } else if (target.closest('.skill-button')) {
        const skillId = target.dataset.skillId
        if (skillId) {
          setSkillTouches(prev => {
            const next = new Map(prev)
            next.set(skillId, {
              id: touch.identifier,
              startX: touch.clientX,
              startY: touch.clientY,
              currentX: touch.clientX,
              currentY: touch.clientY
            })
            return next
          })
        }
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i]

        if (joystickTouch?.id === touch.identifier) {
          const deltaX = touch.clientX - joystickTouch.startX
          const deltaY = touch.clientY - joystickTouch.startY
          const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
          const angle = Math.atan2(deltaY, deltaX)

          const clampedDistance = Math.min(distance, MAX_JOYSTICK_DISTANCE)
          const newX = joystickTouch.startX + Math.cos(angle) * clampedDistance
          const newY = joystickTouch.startY + Math.sin(angle) * clampedDistance

          setJoystickTouch(prev => prev ? {
            ...prev,
            currentX: newX,
            currentY: newY
          } : null)

          // 计算移动方向和强度
          const normalizedX = deltaX / MAX_JOYSTICK_DISTANCE
          const normalizedY = deltaY / MAX_JOYSTICK_DISTANCE
          onMove?.(
            Math.abs(normalizedX) > 0.1 ? normalizedX : 0,
            Math.abs(normalizedY) > 0.1 ? normalizedY : 0
          )
        }
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault()
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i]

        if (joystickTouch?.id === touch.identifier) {
          setJoystickTouch(null)
          onMove?.(0, 0)
        }

        skillTouches.forEach((touchPoint, skillId) => {
          if (touchPoint.id === touch.identifier) {
            onSkillUse?.(skillId)
            setSkillTouches(prev => {
              const next = new Map(prev)
              next.delete(skillId)
              return next
            })
          }
        })
      }
    }

    if (joystickRef.current) {
      joystickRef.current.addEventListener('touchstart', handleTouchStart, { passive: false })
      document.addEventListener('touchmove', handleTouchMove, { passive: false })
      document.addEventListener('touchend', handleTouchEnd, { passive: false })
    }

    return () => {
      if (joystickRef.current) {
        joystickRef.current.removeEventListener('touchstart', handleTouchStart)
      }
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [joystickTouch, skillTouches, onMove, onSkillUse])

  const getJoystickKnobStyle = () => {
    if (!joystickTouch) return {}

    const rect = joystickRef.current?.getBoundingClientRect()
    if (!rect) return {}

    const deltaX = joystickTouch.currentX - joystickTouch.startX
    const deltaY = joystickTouch.currentY - joystickTouch.startY
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    const angle = Math.atan2(deltaY, deltaX)
    const clampedDistance = Math.min(distance, MAX_JOYSTICK_DISTANCE)

    return {
      transform: `translate(${Math.cos(angle) * clampedDistance}px, ${Math.sin(angle) * clampedDistance}px)`
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 pointer-events-none">
      <div className="container mx-auto p-4 flex justify-between items-end">
        {/* 虚拟摇杆 */}
        <div
          ref={joystickRef}
          className="joystick-area relative pointer-events-auto"
          style={{
            width: JOYSTICK_SIZE,
            height: JOYSTICK_SIZE
          }}
        >
          {/* 摇杆背景 */}
          <div
            className="absolute rounded-full bg-gray-800 bg-opacity-50"
            style={{
              width: JOYSTICK_SIZE,
              height: JOYSTICK_SIZE
            }}
          />
          {/* 摇杆手柄 */}
          <div
            className="absolute rounded-full bg-gray-600"
            style={{
              width: JOYSTICK_KNOB_SIZE,
              height: JOYSTICK_KNOB_SIZE,
              left: (JOYSTICK_SIZE - JOYSTICK_KNOB_SIZE) / 2,
              top: (JOYSTICK_SIZE - JOYSTICK_KNOB_SIZE) / 2,
              transition: joystickTouch ? 'none' : 'transform 0.2s',
              ...getJoystickKnobStyle()
            }}
          />
        </div>

        {/* 技能按钮 */}
        <div className="flex gap-2">
          {['skill1', 'skill2', 'skill3', 'skill4'].map(skillId => (
            <button
              key={skillId}
              data-skill-id={skillId}
              className={`
                skill-button relative pointer-events-auto rounded-full
                ${skillTouches.has(skillId) ? 'bg-blue-600' : 'bg-gray-700'}
                active:bg-blue-500
              `}
              style={{
                width: SKILL_BUTTON_SIZE,
                height: SKILL_BUTTON_SIZE
              }}
              onTouchStart={() => settings.vibration && navigator.vibrate?.(20)}
            >
              <img
                src={`/assets/icons/${skillId}.png`}
                alt={skillId}
                className="w-full h-full p-2"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
} 