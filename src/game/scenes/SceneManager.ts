export class SceneManager {
  public destroy(): void {
    // 销毁所有场景
    for (const scene of this._scenes.values()) {
      scene.destroy();
    }
    this._scenes.clear();
    this._currentScene = null;
    SceneManager._instance = null;
  }
}