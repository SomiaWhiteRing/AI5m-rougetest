import fs from 'fs';
import path from 'path';

interface PerformanceThresholds {
  entityCreation: number;
  entityUpdate: number;
  combatUpdate: number;
  effectsProcessing: number;
  itemProcessing: number;
  gameLoop: number;
  savingLoop: number;
  concurrentCombat: number;
  concurrentSaving: number;
}

interface PerformanceResult {
  name: string;
  totalTime: number;
  averageTime: number;
  maxTime: number;
  minTime: number;
  samples: number;
}

const thresholds: PerformanceThresholds = {
  entityCreation: 1000,    // 1秒
  entityUpdate: 16,        // 16毫秒
  combatUpdate: 1000,      // 1秒
  effectsProcessing: 1,    // 1毫秒
  itemProcessing: 1000,    // 1秒
  gameLoop: 16,           // 16毫秒
  savingLoop: 10000,      // 10秒
  concurrentCombat: 1000,  // 1秒
  concurrentSaving: 5000,   // 5秒
};

function readPerformanceResults(): PerformanceResult[] {
  try {
    const resultsPath = path.join(process.cwd(), 'test-report', 'performance.json');
    const data = fs.readFileSync(resultsPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to read performance results:', error);
    process.exit(1);
  }
}

function checkPerformance(results: PerformanceResult[]): void {
  let hasFailure = false;

  results.forEach(result => {
    const threshold = thresholds[result.name as keyof PerformanceThresholds];
    if (threshold === undefined) {
      console.warn(`No threshold defined for metric: ${result.name}`);
      return;
    }

    const isSuccess = result.averageTime <= threshold;
    console.log(`\nChecking ${result.name}:`);
    console.log(`  Average Time: ${result.averageTime.toFixed(2)}ms`);
    console.log(`  Threshold: ${threshold}ms`);
    console.log(`  Status: ${isSuccess ? '✅ PASS' : '❌ FAIL'}`);

    if (!isSuccess) {
      hasFailure = true;
      console.log(`  Exceeded by: ${(result.averageTime - threshold).toFixed(2)}ms`);
    }

    // 输出详细统计信息
    console.log('  Details:');
    console.log(`    Total Time: ${result.totalTime.toFixed(2)}ms`);
    console.log(`    Max Time: ${result.maxTime.toFixed(2)}ms`);
    console.log(`    Min Time: ${result.minTime.toFixed(2)}ms`);
    console.log(`    Samples: ${result.samples}`);
  });

  if (hasFailure) {
    console.error('\n❌ Performance check failed!');
    process.exit(1);
  } else {
    console.log('\n✅ All performance checks passed!');
  }
}

function generateReport(results: PerformanceResult[]): void {
  const reportPath = path.join(process.cwd(), 'test-report', 'performance-report.md');
  let report = '# Performance Test Report\n\n';

  report += `Generated at: ${new Date().toISOString()}\n\n`;
  report += '## Performance Metrics\n\n';

  results.forEach(result => {
    const threshold = thresholds[result.name as keyof PerformanceThresholds];
    const status = result.averageTime <= threshold ? '✅ PASS' : '❌ FAIL';

    report += `### ${result.name}\n\n`;
    report += `- Status: ${status}\n`;
    report += `- Average Time: ${result.averageTime.toFixed(2)}ms\n`;
    report += `- Threshold: ${threshold}ms\n`;
    report += `- Total Time: ${result.totalTime.toFixed(2)}ms\n`;
    report += `- Max Time: ${result.maxTime.toFixed(2)}ms\n`;
    report += `- Min Time: ${result.minTime.toFixed(2)}ms\n`;
    report += `- Samples: ${result.samples}\n\n`;

    if (result.averageTime > threshold) {
      report += `⚠️ Exceeded threshold by ${(result.averageTime - threshold).toFixed(2)}ms\n\n`;
    }
  });

  report += '## Summary\n\n';
  const failedTests = results.filter(r =>
    r.averageTime > thresholds[r.name as keyof PerformanceThresholds]
  );

  if (failedTests.length > 0) {
    report += `❌ ${failedTests.length} metrics failed performance thresholds:\n\n`;
    failedTests.forEach(test => {
      report += `- ${test.name}\n`;
    });
  } else {
    report += '✅ All performance metrics are within acceptable thresholds.\n';
  }

  fs.writeFileSync(reportPath, report);
  console.log(`\nPerformance report generated: ${reportPath}`);
}

function main(): void {
  console.log('Running performance checks...\n');
  const results = readPerformanceResults();
  checkPerformance(results);
  generateReport(results);
}

main();