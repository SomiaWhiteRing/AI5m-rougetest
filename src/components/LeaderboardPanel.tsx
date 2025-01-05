import React, { useEffect, useState } from 'react'
import { LeaderboardEntry, LeaderboardSystem } from '../systems/LeaderboardSystem'

interface LeaderboardPanelProps {
  onClose?: () => void
  currentPlayerName?: string
}

export const LeaderboardPanel: React.FC<LeaderboardPanelProps> = ({
  onClose,
  currentPlayerName
}) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [totalEntries, setTotalEntries] = useState(0)
  const entriesPerPage = 10

  useEffect(() => {
    const leaderboard = LeaderboardSystem.getInstance()
    setEntries(leaderboard.getEntries(currentPage * entriesPerPage, entriesPerPage))
    setTotalEntries(leaderboard.getTotalEntries())
  }, [currentPage])

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60000)
    const seconds = Math.floor((time % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString()
  }

  const totalPages = Math.ceil(totalEntries / entriesPerPage)

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">排行榜</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            关闭
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-300">
            <thead className="text-xs uppercase bg-gray-700">
              <tr>
                <th className="px-4 py-2">排名</th>
                <th className="px-4 py-2">玩家</th>
                <th className="px-4 py-2">分数</th>
                <th className="px-4 py-2">等级</th>
                <th className="px-4 py-2">时间</th>
                <th className="px-4 py-2">日期</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => (
                <tr
                  key={`${entry.playerName}_${entry.date}`}
                  className={`
                    ${entry.playerName === currentPlayerName ? 'bg-blue-900' : 'odd:bg-gray-700'}
                    hover:bg-gray-600
                  `}
                >
                  <td className="px-4 py-2">{currentPage * entriesPerPage + index + 1}</td>
                  <td className="px-4 py-2">{entry.playerName}</td>
                  <td className="px-4 py-2">{entry.score.toLocaleString()}</td>
                  <td className="px-4 py-2">{entry.level}</td>
                  <td className="px-4 py-2">{formatTime(entry.time)}</td>
                  <td className="px-4 py-2">{formatDate(entry.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            <button
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50"
            >
              上一页
            </button>
            <span className="text-gray-300">
              {currentPage + 1} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage === totalPages - 1}
              className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50"
            >
              下一页
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 