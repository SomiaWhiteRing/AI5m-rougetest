import { useEffect, useRef } from 'react';
import { Game } from './game/Game';
import './App.css';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // 初始化游戏
    const game = Game.getInstance(canvasRef.current);
    gameRef.current = game;

    // 启动游戏
    game.start();

    // 清理函数
    return () => {
      if (gameRef.current) {
        gameRef.current.stop();
      }
    };
  }, []);

  return (
    <div className="app">
      <div className="game-container">
        <canvas
          ref={canvasRef}
          className="game-canvas"
        />
        <div className="status-bar">
          <div className="status-item">
            <span className="label">生命值:</span>
            <div className="progress-bar">
              <div className="progress-fill health" style={{ width: '80%' }} />
            </div>
          </div>
          <div className="status-item">
            <span className="label">魔法值:</span>
            <div className="progress-bar">
              <div className="progress-fill mana" style={{ width: '60%' }} />
            </div>
          </div>
          <div className="status-item">
            <span className="label">经验值:</span>
            <div className="progress-bar">
              <div className="progress-fill exp" style={{ width: '40%' }} />
            </div>
          </div>
          <div className="status-item">
            <span className="label">等级:</span>
            <span className="value">1</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;