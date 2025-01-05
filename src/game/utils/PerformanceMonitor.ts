export interface PerformanceStats {
  totalTime: number;
  averageTime: number;
  maxTime: number;
  minTime: number;
  samples: number;
}

export class PerformanceMonitor {
  private metrics: Map<string, {
    startTime: number;
    times: number[];
  }> = new Map();

  startTracking(metricName: string): void {
    this.metrics.set(metricName, {
      startTime: performance.now(),
      times: [],
    });
  }

  endTracking(metricName: string): void {
    const metric = this.metrics.get(metricName);
    if (metric) {
      const endTime = performance.now();
      const duration = endTime - metric.startTime;
      metric.times.push(duration);
    }
  }

  getStats(metricName: string): PerformanceStats {
    const metric = this.metrics.get(metricName);
    if (!metric || metric.times.length === 0) {
      return {
        totalTime: 0,
        averageTime: 0,
        maxTime: 0,
        minTime: 0,
        samples: 0,
      };
    }

    const times = metric.times;
    const totalTime = times.reduce((sum, time) => sum + time, 0);
    const averageTime = totalTime / times.length;
    const maxTime = Math.max(...times);
    const minTime = Math.min(...times);

    return {
      totalTime,
      averageTime,
      maxTime,
      minTime,
      samples: times.length,
    };
  }

  clearMetrics(metricName?: string): void {
    if (metricName) {
      this.metrics.delete(metricName);
    } else {
      this.metrics.clear();
    }
  }

  getAllMetrics(): Map<string, PerformanceStats> {
    const allStats = new Map<string, PerformanceStats>();
    this.metrics.forEach((_, name) => {
      allStats.set(name, this.getStats(name));
    });
    return allStats;
  }
}