import React, { useEffect, useState } from 'react'
import { TutorialStep } from '../systems/TutorialSystem'

interface TutorialTooltipProps {
  step: TutorialStep
  onComplete?: () => void
  onSkip?: () => void
}

export const TutorialTooltip: React.FC<TutorialTooltipProps> = ({
  step,
  onComplete,
  onSkip
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [targetElement, setTargetElement] = useState<Element | null>(null)

  useEffect(() => {
    if (step.target) {
      const element = document.querySelector(step.target)
      setTargetElement(element)
      updatePosition(element)
    } else {
      // 如果没有目标元素，显示在屏幕中央
      setPosition({
        top: window.innerHeight / 2,
        left: window.innerWidth / 2
      })
    }
  }, [step])

  useEffect(() => {
    const handleResize = () => {
      updatePosition(targetElement)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [targetElement])

  const updatePosition = (element: Element | null) => {
    if (!element) return

    const rect = element.getBoundingClientRect()
    const tooltipWidth = 300 // 提示框的预估宽度
    const tooltipHeight = 150 // 提示框的预估高度
    const padding = 20 // 与目标元素的间距

    let top = 0
    let left = 0

    switch (step.position) {
      case 'top':
        top = rect.top - tooltipHeight - padding
        left = rect.left + (rect.width - tooltipWidth) / 2
        break
      case 'right':
        top = rect.top + (rect.height - tooltipHeight) / 2
        left = rect.right + padding
        break
      case 'bottom':
        top = rect.bottom + padding
        left = rect.left + (rect.width - tooltipWidth) / 2
        break
      case 'left':
        top = rect.top + (rect.height - tooltipHeight) / 2
        left = rect.left - tooltipWidth - padding
        break
      default:
        // 默认显示在目标元素下方
        top = rect.bottom + padding
        left = rect.left + (rect.width - tooltipWidth) / 2
    }

    // 确保提示框不会超出屏幕边界
    top = Math.max(padding, Math.min(top, window.innerHeight - tooltipHeight - padding))
    left = Math.max(padding, Math.min(left, window.innerWidth - tooltipWidth - padding))

    setPosition({ top, left })
  }

  return (
    <div
      className="fixed z-50 pointer-events-auto"
      style={{
        top: position.top,
        left: position.left,
        transform: 'translate(-50%, -50%)'
      }}
    >
      <div className="bg-gray-800 rounded-lg p-4 shadow-lg w-[300px]">
        <div className="mb-2">
          <h3 className="text-lg font-bold text-white">{step.title}</h3>
        </div>

        <div className="mb-4">
          <p className="text-gray-300">{step.description}</p>
        </div>

        <div className="flex justify-between">
          {step.required ? (
            <button
              onClick={onComplete}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
            >
              继续
            </button>
          ) : (
            <button
              onClick={onComplete}
              className="px-4 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
            >
              跳过
            </button>
          )}

          {!step.required && (
            <button
              onClick={onSkip}
              className="px-4 py-2 text-gray-400 hover:text-white"
            >
              跳过教程
            </button>
          )}
        </div>

        {step.target && targetElement && (
          <div
            className="absolute w-3 h-3 bg-gray-800 transform rotate-45"
            style={{
              top: step.position === 'bottom' ? -6 : 'auto',
              bottom: step.position === 'top' ? -6 : 'auto',
              left: step.position === 'right' ? -6 : 'auto',
              right: step.position === 'left' ? -6 : 'auto',
              [step.position === 'top' || step.position === 'bottom' ? 'left' : 'top']: '50%',
              marginLeft: step.position === 'top' || step.position === 'bottom' ? -6 : 0,
              marginTop: step.position === 'left' || step.position === 'right' ? -6 : 0
            }}
          />
        )}
      </div>
    </div>
  )
} 