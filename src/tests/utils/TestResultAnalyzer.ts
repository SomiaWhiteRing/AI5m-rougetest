interface TestResult {
  name: string;
  duration: number;
  success: boolean;
  error?: Error;
  memoryUsage?: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    arrayBuffers: number;
  };
  performanceMetrics?: {
    fps?: number;
    frameTime?: number;
    renderTime?: number;
    updateTime?: number;
    networkLatency?: number;
  };
}

interface TestSuite {
  name: string;
  results: TestResult[];
  startTime: number;
  endTime: number;
}

export class TestResultAnalyzer {
  private suites: TestSuite[] = [];
  private currentSuite: TestSuite | null = null;

  startSuite(name: string) {
    this.currentSuite = {
      name,
      results: [],
      startTime: Date.now(),
      endTime: 0
    };
  }

  endSuite() {
    if (this.currentSuite) {
      this.currentSuite.endTime = Date.now();
      this.suites.push(this.currentSuite);
      this.currentSuite = null;
    }
  }

  addResult(result: TestResult) {
    if (this.currentSuite) {
      this.currentSuite.results.push(result);
    }
  }

  generateReport(): string {
    let report = '# Test Results Report\n\n';

    // 总体统计
    const totalTests = this.getTotalTests();
    const totalSuccess = this.getSuccessfulTests();
    const totalFailures = totalTests - totalSuccess;
    const totalDuration = this.getTotalDuration();

    report += '## Summary\n\n';
    report += `- Total Tests: ${totalTests}\n`;
    report += `- Successful: ${totalSuccess}\n`;
    report += `- Failed: ${totalFailures}\n`;
    report += `- Total Duration: ${this.formatDuration(totalDuration)}\n`;
    report += `- Success Rate: ${((totalSuccess / totalTests) * 100).toFixed(2)}%\n\n`;

    // 性能统计
    report += '## Performance Metrics\n\n';
    const performanceStats = this.analyzePerformance();
    report += '### Memory Usage\n\n';
    report += `- Average Heap Used: ${this.formatBytes(performanceStats.averageHeapUsed)}\n`;
    report += `- Peak Heap Used: ${this.formatBytes(performanceStats.peakHeapUsed)}\n`;
    report += `- Memory Leaks Detected: ${performanceStats.potentialMemoryLeaks}\n\n`;

    report += '### Performance Metrics\n\n';
    report += `- Average FPS: ${performanceStats.averageFPS?.toFixed(2) || 'N/A'}\n`;
    report += `- Average Frame Time: ${performanceStats.averageFrameTime?.toFixed(2) || 'N/A'}ms\n`;
    report += `- Average Network Latency: ${performanceStats.averageNetworkLatency?.toFixed(2) || 'N/A'}ms\n\n`;

    // 详细测试结果
    report += '## Test Suites\n\n';
    this.suites.forEach(suite => {
      report += `### ${suite.name}\n\n`;
      report += `Duration: ${this.formatDuration(suite.endTime - suite.startTime)}\n\n`;
      
      const successCount = suite.results.filter(r => r.success).length;
      const failureCount = suite.results.length - successCount;
      
      report += `- Tests: ${suite.results.length}\n`;
      report += `- Passed: ${successCount}\n`;
      report += `- Failed: ${failureCount}\n\n`;

      if (failureCount > 0) {
        report += '#### Failures\n\n';
        suite.results
          .filter(r => !r.success)
          .forEach(result => {
            report += `- ${result.name}\n`;
            report += `  - Error: ${result.error?.message}\n`;
            report += `  - Duration: ${this.formatDuration(result.duration)}\n\n`;
          });
      }
    });

    // 建议和改进
    report += '## Recommendations\n\n';
    const recommendations = this.generateRecommendations();
    recommendations.forEach(rec => {
      report += `- ${rec}\n`;
    });

    return report;
  }

  private getTotalTests(): number {
    return this.suites.reduce((total, suite) => total + suite.results.length, 0);
  }

  private getSuccessfulTests(): number {
    return this.suites.reduce((total, suite) => 
      total + suite.results.filter(r => r.success).length, 0);
  }

  private getTotalDuration(): number {
    return this.suites.reduce((total, suite) => 
      total + (suite.endTime - suite.startTime), 0);
  }

  private analyzePerformance() {
    const memoryMetrics = this.suites.flatMap(s => 
      s.results.filter(r => r.memoryUsage).map(r => r.memoryUsage!));
    
    const performanceMetrics = this.suites.flatMap(s => 
      s.results.filter(r => r.performanceMetrics).map(r => r.performanceMetrics!));

    const averageHeapUsed = memoryMetrics.length > 0
      ? memoryMetrics.reduce((sum, m) => sum + m.heapUsed, 0) / memoryMetrics.length
      : 0;

    const peakHeapUsed = memoryMetrics.length > 0
      ? Math.max(...memoryMetrics.map(m => m.heapUsed))
      : 0;

    const potentialMemoryLeaks = memoryMetrics.length > 1
      ? this.detectMemoryLeaks(memoryMetrics)
      : 0;

    const averageFPS = performanceMetrics
      .filter(m => m.fps)
      .reduce((sum, m) => sum + (m.fps || 0), 0) / performanceMetrics.length || undefined;

    const averageFrameTime = performanceMetrics
      .filter(m => m.frameTime)
      .reduce((sum, m) => sum + (m.frameTime || 0), 0) / performanceMetrics.length || undefined;

    const averageNetworkLatency = performanceMetrics
      .filter(m => m.networkLatency)
      .reduce((sum, m) => sum + (m.networkLatency || 0), 0) / performanceMetrics.length || undefined;

    return {
      averageHeapUsed,
      peakHeapUsed,
      potentialMemoryLeaks,
      averageFPS,
      averageFrameTime,
      averageNetworkLatency
    };
  }

  private detectMemoryLeaks(memoryMetrics: NonNullable<TestResult['memoryUsage']>[]): number {
    let leakCount = 0;
    const threshold = 1024 * 1024; // 1MB

    for (let i = 1; i < memoryMetrics.length; i++) {
      const increase = memoryMetrics[i].heapUsed - memoryMetrics[i - 1].heapUsed;
      if (increase > threshold) {
        leakCount++;
      }
    }

    return leakCount;
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const stats = this.analyzePerformance();

    // 性能建议
    if (stats.averageFPS && stats.averageFPS < 60) {
      recommendations.push('Consider optimizing render performance to achieve 60 FPS');
    }

    if (stats.potentialMemoryLeaks > 0) {
      recommendations.push('Investigate potential memory leaks in the application');
    }

    if (stats.averageNetworkLatency && stats.averageNetworkLatency > 100) {
      recommendations.push('Network latency is high, consider optimizing network operations');
    }

    // 测试覆盖率建议
    const totalTests = this.getTotalTests();
    if (totalTests < 100) {
      recommendations.push('Increase test coverage by adding more test cases');
    }

    // 失败率建议
    const failureRate = 1 - (this.getSuccessfulTests() / totalTests);
    if (failureRate > 0.1) {
      recommendations.push('High test failure rate detected, investigate and fix failing tests');
    }

    return recommendations;
  }

  private formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  }

  private formatBytes(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }
} 