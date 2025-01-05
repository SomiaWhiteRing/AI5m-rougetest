import React, { useEffect, useState } from 'react';
import { CombatEvent } from '../game/managers/CombatManager';
import { Entity } from '../game/entities/Entity';

interface CombatUIProps {
  player: Entity;
  target?: Entity;
  onCombatEvent: (callback: (event: CombatEvent) => void) => void;
  offCombatEvent: (callback: (event: CombatEvent) => void) => void;
}

export const CombatUI: React.FC<CombatUIProps> = ({
  player,
  target,
  onCombatEvent,
  offCombatEvent
}) => {
  const [combatLog, setCombatLog] = useState<CombatEvent[]>([]);
  const [playerHp, setPlayerHp] = useState(player.getHp());
  const [playerShield, setPlayerShield] = useState(player.getShield());
  const [targetHp, setTargetHp] = useState(target?.getHp() || 0);
  const [targetShield, setTargetShield] = useState(target?.getShield() || 0);

  useEffect(() => {
    const handleCombatEvent = (event: CombatEvent) => {
      setCombatLog(prev => [...prev.slice(-4), event]);
      
      if (event.target === player) {
        setPlayerHp(player.getHp());
        setPlayerShield(player.getShield());
      } else if (event.target === target) {
        setTargetHp(target?.getHp() || 0);
        setTargetShield(target?.getShield() || 0);
      }
    };

    onCombatEvent(handleCombatEvent);
    return () => offCombatEvent(handleCombatEvent);
  }, [player, target, onCombatEvent, offCombatEvent]);

  const getEventText = (event: CombatEvent): string => {
    const sourceName = event.source ? '玩家' : '敌人';
    const targetName = event.target === player ? '玩家' : '敌人';

    switch (event.type) {
      case 'damage':
        return `${sourceName}对${targetName}造成${event.value}点伤害`;
      case 'heal':
        return `${sourceName}治疗${targetName}${event.value}点生命`;
      case 'shield':
        return `${sourceName}为${targetName}添加${event.value}点护盾`;
      case 'effect':
        return `${sourceName}对${targetName}施加效果`;
      case 'death':
        return `${targetName}死亡`;
      default:
        return '';
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-800 bg-opacity-75">
      <div className="flex justify-between mb-4">
        <div className="text-white">
          <div className="mb-2">
            玩家生命值: {playerHp}
            {playerShield > 0 && ` (护盾: ${playerShield})`}
          </div>
          {target && (
            <div>
              敌人生命值: {targetHp}
              {targetShield > 0 && ` (护盾: ${targetShield})`}
            </div>
          )}
        </div>
      </div>
      
      <div className="text-white">
        {combatLog.map((event, index) => (
          <div key={index} className="mb-1">
            {getEventText(event)}
          </div>
        ))}
      </div>
    </div>
  );
}; 