import React, { useState, useEffect } from 'react'
import { SaveManager } from '../game/managers/SaveManager'

interface SaveMenuProps {
  isOpen: boolean
  onClose: () => void
}

const SaveMenu: React.FC<SaveMenuProps> = ({ isOpen, onClose }) => {
  const [hasSave, setHasSave] = useState(false)
  const [exportCode, setExportCode] = useState('')
  const [importCode, setImportCode] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    setHasSave(SaveManager.getInstance().hasSave())
  }, [isOpen])

  const handleSave = () => {
    try {
      // 这里需要从游戏状态获取数据
      // 暂时使用空数据
      SaveManager.getInstance().saveGame({
        player: {
          health: 100,
          maxHealth: 100,
          attack: 10,
          defense: 5,
          speed: 200,
          experience: 0,
          level: 1,
          equipment: {},
          inventory: []
        },
        gameState: {
          score: 0,
          currentLevel: 1,
          completedLevels: [],
          unlockedSkills: [],
          discoveredItems: []
        },
        settings: {
          bgmVolume: 0.5,
          sfxVolume: 0.5,
          touchControls: true
        },
        timestamp: Date.now()
      })
      setSuccess('游戏已保存')
      setHasSave(true)
      setTimeout(() => setSuccess(''), 2000)
    } catch (error) {
      setError('保存失败')
      setTimeout(() => setError(''), 2000)
    }
  }

  const handleLoad = () => {
    try {
      const saveData = SaveManager.getInstance().loadGame()
      if (saveData) {
        // 这里需要将数据应用到游戏状态
        console.log('加载存档:', saveData)
        setSuccess('游戏已加载')
        setTimeout(() => setSuccess(''), 2000)
      }
    } catch (error) {
      setError('加载失败')
      setTimeout(() => setError(''), 2000)
    }
  }

  const handleDelete = () => {
    try {
      SaveManager.getInstance().deleteSave()
      setHasSave(false)
      setSuccess('存档已删除')
      setTimeout(() => setSuccess(''), 2000)
    } catch (error) {
      setError('删除失败')
      setTimeout(() => setError(''), 2000)
    }
  }

  const handleExport = () => {
    try {
      const code = SaveManager.getInstance().exportSave()
      setExportCode(code)
    } catch (error) {
      setError('导出失败')
      setTimeout(() => setError(''), 2000)
    }
  }

  const handleImport = () => {
    try {
      SaveManager.getInstance().importSave(importCode)
      setSuccess('存档已导入')
      setHasSave(true)
      setImportCode('')
      setTimeout(() => setSuccess(''), 2000)
    } catch (error) {
      setError('导入失败')
      setTimeout(() => setError(''), 2000)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-white text-2xl mb-4">存档菜单</h2>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              保存游戏
            </button>
            <button
              onClick={handleLoad}
              disabled={!hasSave}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              加载游戏
            </button>
            <button
              onClick={handleDelete}
              disabled={!hasSave}
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
            >
              删除存档
            </button>
          </div>

          <div className="border-t border-gray-700 pt-4">
            <h3 className="text-white text-lg mb-2">导出存档</h3>
            <button
              onClick={handleExport}
              disabled={!hasSave}
              className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50 mb-2"
            >
              生成存档码
            </button>
            {exportCode && (
              <textarea
                readOnly
                value={exportCode}
                className="w-full bg-gray-700 text-white p-2 rounded"
                rows={3}
              />
            )}
          </div>

          <div className="border-t border-gray-700 pt-4">
            <h3 className="text-white text-lg mb-2">导入存档</h3>
            <textarea
              value={importCode}
              onChange={(e) => setImportCode(e.target.value)}
              placeholder="在此粘贴存档码"
              className="w-full bg-gray-700 text-white p-2 rounded mb-2"
              rows={3}
            />
            <button
              onClick={handleImport}
              disabled={!importCode}
              className="w-full bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 disabled:opacity-50"
            >
              导入存档
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-2 bg-red-600 text-white rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 p-2 bg-green-600 text-white rounded">
            {success}
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-6 w-full bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          关闭
        </button>
      </div>
    </div>
  )
}

export default SaveMenu 