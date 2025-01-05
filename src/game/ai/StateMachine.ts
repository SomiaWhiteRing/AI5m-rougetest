import { EventEmitter } from 'events';

export interface State<T> {
  name: string;
  enter?: (owner: T) => void;
  update?: (owner: T, time: number, delta: number) => void;
  exit?: (owner: T) => void;
}

export class StateMachine<T> {
  private owner: T;
  private states: Map<string, State<T>>;
  private currentState: State<T> | null;
  private previousState: State<T> | null;
  private globalState: State<T> | null;
  private isLocked: boolean;
  private eventEmitter: EventEmitter;

  constructor(owner: T) {
    this.owner = owner;
    this.states = new Map();
    this.currentState = null;
    this.previousState = null;
    this.globalState = null;
    this.isLocked = false;
    this.eventEmitter = new EventEmitter();
  }

  addState(state: State<T>): void {
    this.states.set(state.name, state);
    this.eventEmitter.emit('stateAdded', state.name);
  }

  removeState(name: string): void {
    if (this.currentState?.name === name) {
      this.changeState('idle'); // 切换到默认状态
    }
    this.states.delete(name);
    this.eventEmitter.emit('stateRemoved', name);
  }

  setGlobalState(state: State<T> | null): void {
    if (this.globalState) {
      this.globalState.exit?.(this.owner);
    }
    this.globalState = state;
    if (state) {
      state.enter?.(this.owner);
    }
    this.eventEmitter.emit('globalStateChanged', state?.name);
  }

  changeState(name: string): void {
    if (this.isLocked) {
      console.warn('State machine is locked, cannot change state');
      return;
    }

    const newState = this.states.get(name);
    if (!newState) {
      console.warn(`State ${name} not found`);
      return;
    }

    // 保存前一个状态
    this.previousState = this.currentState;

    // 退出当前状态
    if (this.currentState) {
      this.isLocked = true;
      this.currentState.exit?.(this.owner);
      this.isLocked = false;
    }

    // 进入新状态
    this.currentState = newState;
    this.isLocked = true;
    this.currentState.enter?.(this.owner);
    this.isLocked = false;

    this.eventEmitter.emit('stateChanged', {
      from: this.previousState?.name,
      to: this.currentState.name,
    });
  }

  revertToPreviousState(): void {
    if (this.previousState) {
      this.changeState(this.previousState.name);
    }
  }

  update(time: number, delta: number): void {
    // 更新全局状态
    this.globalState?.update?.(this.owner, time, delta);

    // 更新当前状态
    this.currentState?.update?.(this.owner, time, delta);
  }

  getCurrentState(): State<T> | null {
    return this.currentState;
  }

  getPreviousState(): State<T> | null {
    return this.previousState;
  }

  getGlobalState(): State<T> | null {
    return this.globalState;
  }

  isInState(name: string): boolean {
    return this.currentState?.name === name;
  }

  hasState(name: string): boolean {
    return this.states.has(name);
  }

  getStates(): string[] {
    return Array.from(this.states.keys());
  }

  clear(): void {
    if (this.currentState) {
      this.currentState.exit?.(this.owner);
    }
    if (this.globalState) {
      this.globalState.exit?.(this.owner);
    }
    this.states.clear();
    this.currentState = null;
    this.previousState = null;
    this.globalState = null;
    this.eventEmitter.emit('cleared');
  }

  on(event: string, listener: (...args: any[]) => void): void {
    this.eventEmitter.on(event, listener);
  }

  off(event: string, listener: (...args: any[]) => void): void {
    this.eventEmitter.off(event, listener);
  }

  destroy(): void {
    this.clear();
    this.eventEmitter.removeAllListeners();
  }
}