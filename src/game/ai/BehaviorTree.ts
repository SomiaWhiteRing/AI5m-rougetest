export enum NodeStatus {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  RUNNING = 'RUNNING'
}

export interface Context {
  [key: string]: any;
}

export interface Node<T extends Context = Context> {
  tick(context: T): NodeStatus;
}

// 选择节点：执行子节点直到一个成功
export class Selector<T extends Context = Context> implements Node<T> {
  constructor(private children: Node<T>[]) {}

  tick(context: T): NodeStatus {
    for (const child of this.children) {
      const status = child.tick(context);
      if (status !== NodeStatus.FAILURE) {
        return status;
      }
    }
    return NodeStatus.FAILURE;
  }
}

// 序列节点：执行所有子节点直到一个失败
export class Sequence<T extends Context = Context> implements Node<T> {
  constructor(private children: Node<T>[]) {}

  tick(context: T): NodeStatus {
    for (const child of this.children) {
      const status = child.tick(context);
      if (status !== NodeStatus.SUCCESS) {
        return status;
      }
    }
    return NodeStatus.SUCCESS;
  }
}

// 条件节点：检查条件是否满足
export class Condition<T extends Context = Context> implements Node<T> {
  constructor(private condition: (context: T) => boolean) {}

  tick(context: T): NodeStatus {
    return this.condition(context) ? NodeStatus.SUCCESS : NodeStatus.FAILURE;
  }
}

// 动作节点：执行具体动作
export class Action<T extends Context = Context> implements Node<T> {
  constructor(private action: (context: T) => NodeStatus) {}

  tick(context: T): NodeStatus {
    return this.action(context);
  }
}

// 反转节点：反转子节点的结果
export class Inverter<T extends Context = Context> implements Node<T> {
  constructor(private child: Node<T>) {}

  tick(context: T): NodeStatus {
    const status = this.child.tick(context);
    if (status === NodeStatus.SUCCESS) return NodeStatus.FAILURE;
    if (status === NodeStatus.FAILURE) return NodeStatus.SUCCESS;
    return status;
  }
}

// 重复节点：重复执行子节点指定次数
export class Repeater<T extends Context = Context> implements Node<T> {
  private count: number = 0;

  constructor(private child: Node<T>, private times: number = -1) {}

  tick(context: T): NodeStatus {
    if (this.times === -1 || this.count < this.times) {
      const status = this.child.tick(context);
      if (status === NodeStatus.SUCCESS) {
        this.count++;
      }
      if (this.times === -1) {
        return NodeStatus.RUNNING;
      }
      return this.count >= this.times ? NodeStatus.SUCCESS : NodeStatus.RUNNING;
    }
    return NodeStatus.SUCCESS;
  }

  reset() {
    this.count = 0;
  }
}

// 并行节点：同时执行所有子节点
export class Parallel<T extends Context = Context> implements Node<T> {
  constructor(
    private children: Node<T>[],
    private requiredSuccesses: number = -1
  ) {}

  tick(context: T): NodeStatus {
    let successes = 0;
    let failures = 0;

    for (const child of this.children) {
      const status = child.tick(context);
      
      if (status === NodeStatus.SUCCESS) {
        successes++;
      } else if (status === NodeStatus.FAILURE) {
        failures++;
      }
    }

    if (this.requiredSuccesses === -1) {
      // 所有节点都必须成功
      if (failures > 0) return NodeStatus.FAILURE;
      if (successes === this.children.length) return NodeStatus.SUCCESS;
    } else {
      // 达到指定数量的成功节点
      if (successes >= this.requiredSuccesses) return NodeStatus.SUCCESS;
      if (this.children.length - failures < this.requiredSuccesses) return NodeStatus.FAILURE;
    }

    return NodeStatus.RUNNING;
  }
}

// 装饰器节点：修改子节点的行为
export class UntilSuccess<T extends Context = Context> implements Node<T> {
  constructor(private child: Node<T>) {}

  tick(context: T): NodeStatus {
    const status = this.child.tick(context);
    return status === NodeStatus.SUCCESS ? NodeStatus.SUCCESS : NodeStatus.RUNNING;
  }
}

export class UntilFailure<T extends Context = Context> implements Node<T> {
  constructor(private child: Node<T>) {}

  tick(context: T): NodeStatus {
    const status = this.child.tick(context);
    return status === NodeStatus.FAILURE ? NodeStatus.SUCCESS : NodeStatus.RUNNING;
  }
}

// 行为树
export class BehaviorTree<T extends Context = Context> {
  constructor(private root: Node<T>) {}

  tick(context: T): NodeStatus {
    return this.root.tick(context);
  }
} 