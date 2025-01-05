import React, { useEffect, useState } from 'react'
import { QuestSystem, Quest, QuestStatus } from '../game/systems/QuestSystem'

interface QuestPanelProps {
  isOpen: boolean
  onClose: () => void
}

const QuestPanel: React.FC<QuestPanelProps> = ({ isOpen, onClose }) => {
  const [activeQuests, setActiveQuests] = useState<Quest[]>([])
  const [availableQuests, setAvailableQuests] = useState<Quest[]>([])
  const [completedQuests, setCompletedQuests] = useState<Quest[]>([])
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null)

  useEffect(() => {
    if (isOpen) {
      const questSystem = QuestSystem.getInstance()
      setActiveQuests(questSystem.getActiveQuests())
      setAvailableQuests(questSystem.getAvailableQuests())
      setCompletedQuests(questSystem.getCompletedQuests())

      const handleUpdate = (questId: string, quest: Quest) => {
        setActiveQuests(questSystem.getActiveQuests())
        setAvailableQuests(questSystem.getAvailableQuests())
        setCompletedQuests(questSystem.getCompletedQuests())
        if (selectedQuest?.id === questId) {
          setSelectedQuest(quest)
        }
      }

      questSystem.addListener(handleUpdate)
      return () => questSystem.removeListener(handleUpdate)
    }
  }, [isOpen, selectedQuest])

  const handleActivateQuest = (quest: Quest) => {
    QuestSystem.getInstance().activateQuest(quest.id)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-4xl w-full max-h-[80vh] overflow-hidden flex">
        {/* 任务列表 */}
        <div className="w-1/3 border-r border-gray-700 pr-4 overflow-y-auto">
          <div className="space-y-4">
            {/* 进行中的任务 */}
            <div>
              <h3 className="text-white text-lg mb-2">进行中的任务</h3>
              <div className="space-y-2">
                {activeQuests.map(quest => (
                  <button
                    key={quest.id}
                    className={`w-full text-left p-2 rounded ${
                      selectedQuest?.id === quest.id ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                    onClick={() => setSelectedQuest(quest)}
                  >
                    <div className="text-white">{quest.name}</div>
                    <div className="text-sm text-gray-400">
                      {quest.objectives[0]?.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 可接任务 */}
            <div>
              <h3 className="text-white text-lg mb-2">可接任务</h3>
              <div className="space-y-2">
                {availableQuests.map(quest => (
                  <button
                    key={quest.id}
                    className={`w-full text-left p-2 rounded ${
                      selectedQuest?.id === quest.id ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                    onClick={() => setSelectedQuest(quest)}
                  >
                    <div className="text-white">{quest.name}</div>
                    <div className="text-sm text-gray-400">
                      {quest.objectives[0]?.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 已完成任务 */}
            <div>
              <h3 className="text-white text-lg mb-2">已完成任务</h3>
              <div className="space-y-2">
                {completedQuests.map(quest => (
                  <button
                    key={quest.id}
                    className={`w-full text-left p-2 rounded ${
                      selectedQuest?.id === quest.id ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                    onClick={() => setSelectedQuest(quest)}
                  >
                    <div className="text-white">{quest.name}</div>
                    <div className="text-sm text-gray-400">已完成</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 任务详情 */}
        <div className="flex-1 pl-4 overflow-y-auto">
          {selectedQuest ? (
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-white text-2xl">{selectedQuest.name}</h2>
                  <p className="text-gray-400">{selectedQuest.description}</p>
                </div>
                {selectedQuest.status === QuestStatus.AVAILABLE && (
                  <button
                    onClick={() => handleActivateQuest(selectedQuest)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    接受任务
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {/* 任务目标 */}
                <div>
                  <h3 className="text-white text-lg mb-2">任务目标</h3>
                  <div className="space-y-2">
                    {selectedQuest.objectives.map((objective, index) => (
                      <div
                        key={index}
                        className="bg-gray-700 p-2 rounded flex justify-between items-center"
                      >
                        <span className="text-white">{objective.description}</span>
                        <span className="text-gray-400">
                          {objective.current} / {objective.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 任务奖励 */}
                <div>
                  <h3 className="text-white text-lg mb-2">任务奖励</h3>
                  <div className="bg-gray-700 p-2 rounded">
                    <div className="space-y-1">
                      {selectedQuest.rewards.gold && (
                        <div className="text-yellow-400">
                          金币: {selectedQuest.rewards.gold}
                        </div>
                      )}
                      {selectedQuest.rewards.experience && (
                        <div className="text-blue-400">
                          经验: {selectedQuest.rewards.experience}
                        </div>
                      )}
                      {selectedQuest.rewards.items?.map((item, index) => (
                        <div key={index} className="text-purple-400">
                          物品: {item}
                        </div>
                      ))}
                      {selectedQuest.rewards.reputation && (
                        <div className="text-green-400">
                          声望: {selectedQuest.rewards.reputation}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 任务要求 */}
                {selectedQuest.requirements && (
                  <div>
                    <h3 className="text-white text-lg mb-2">任务要求</h3>
                    <div className="bg-gray-700 p-2 rounded">
                      <div className="space-y-1">
                        {selectedQuest.requirements.level && (
                          <div className="text-white">
                            等级要求: {selectedQuest.requirements.level}
                          </div>
                        )}
                        {selectedQuest.requirements.reputation && (
                          <div className="text-white">
                            声望要求: {selectedQuest.requirements.reputation}
                          </div>
                        )}
                        {selectedQuest.requirements.quests?.map((quest, index) => (
                          <div key={index} className="text-white">
                            前置任务: {quest}
                          </div>
                        ))}
                        {selectedQuest.requirements.items?.map((item, index) => (
                          <div key={index} className="text-white">
                            需要物品: {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-gray-400 text-center mt-8">
              选择一个任务查看详情
            </div>
          )}
        </div>

        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          关闭
        </button>
      </div>
    </div>
  )
}

export default QuestPanel 