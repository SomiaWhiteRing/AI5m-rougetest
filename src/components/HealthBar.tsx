import React from 'react';

interface HealthBarProps {
  current: number;
  max: number;
}

export const HealthBar: React.FC<HealthBarProps> = ({ current, max }) => {
  const percentage = (current / max) * 100;
  const isLowHealth = percentage <= 20;

  return (
    <div className="health-bar-container">
      <div
        role="progressbar"
        className={`health-bar ${isLowHealth ? 'low-health' : ''}`}
        style={{ width: `${percentage}%` }}
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={max}
      />
      <span className="health-text">{`${current}/${max}`}</span>
    </div>
  );
};