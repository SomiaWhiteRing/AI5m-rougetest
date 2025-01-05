import { useCallback, useEffect, useState } from 'react'

interface TouchState {
  up: boolean
  down: boolean
  left: boolean
  right: boolean
  a: boolean
  b: boolean
}

export const useTouch = () => {
  const [touchState, setTouchState] = useState<TouchState>({
    up: false,
    down: false,
    left: false,
    right: false,
    a: false,
    b: false
  })

  const handleTouchStart = useCallback((e: TouchEvent, direction: keyof TouchState) => {
    e.preventDefault()
    setTouchState(prev => ({ ...prev, [direction]: true }))
  }, [])

  const handleTouchEnd = useCallback((e: TouchEvent, direction: keyof TouchState) => {
    e.preventDefault()
    setTouchState(prev => ({ ...prev, [direction]: false }))
  }, [])

  useEffect(() => {
    const preventDefaultTouch = (e: TouchEvent) => {
      e.preventDefault()
    }

    document.addEventListener('touchmove', preventDefaultTouch, { passive: false })
    document.addEventListener('touchstart', preventDefaultTouch, { passive: false })

    return () => {
      document.removeEventListener('touchmove', preventDefaultTouch)
      document.removeEventListener('touchstart', preventDefaultTouch)
    }
  }, [])

  return {
    touchState,
    handleTouchStart,
    handleTouchEnd
  }
} 