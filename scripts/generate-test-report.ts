import fs from 'fs';
import path from 'path';

interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  suite: string;
}

interface CoverageResult {
  lines: { total: number; covered: number; pct: number };
  statements: { total: number; covered: number; pct: number };
  functions: { total: number; covered: number; pct: number };
  branches: { total: number; covered: number; pct: number };
}

interface TestReport {
  results: TestResult[];
  coverage: CoverageResult;
  duration: number;
  timestamp: string;
}

function readTestResults(): TestReport {
  try {
    const resultsPath = path.join(process.cwd(), 'test-report', 'test-results.json');
    const coveragePath = path.join(process.cwd(), 'coverage', 'coverage-summary.json');

    const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
    const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8')).total;

    return {
      results: results.testResults,
      coverage,
      duration: results.duration,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Failed to read test results:', error);
    process.exit(1);
  }
}

function generateMarkdownReport(report: TestReport): string {
  let markdown = '# Test Report\n\n';

  // 基本信息
  markdown += `Generated at: ${report.timestamp}\n`;
  markdown += `Total Duration: ${(report.duration / 1000).toFixed(2)}s\n\n`;

  // 测试结果摘要
  const total = report.results.length;
  const passed = report.results.filter(r => r.status === 'passed').length;
  const failed = report.results.filter(r => r.status === 'failed').length;
  const skipped = report.results.filter(r => r.status === 'skipped').length;

  markdown += '## Summary\n\n';
  markdown += `- Total Tests: ${total}\n`;
  markdown += `- Passed: ${passed} (${((passed / total) * 100).toFixed(1)}%)\n`;
  markdown += `- Failed: ${failed} (${((failed / total) * 100).toFixed(1)}%)\n`;
  markdown += `- Skipped: ${skipped} (${((skipped / total) * 100).toFixed(1)}%)\n\n`;

  // 覆盖率报告
  markdown += '## Coverage\n\n';
  markdown += '| Type | Coverage | Total | Covered |\n';
  markdown += '|------|----------|--------|----------|\n';
  markdown += `| Lines | ${report.coverage.lines.pct}% | ${report.coverage.lines.total} | ${report.coverage.lines.covered} |\n`;
  markdown += `| Statements | ${report.coverage.statements.pct}% | ${report.coverage.statements.total} | ${report.coverage.statements.covered} |\n`;
  markdown += `| Functions | ${report.coverage.functions.pct}% | ${report.coverage.functions.total} | ${report.coverage.functions.covered} |\n`;
  markdown += `| Branches | ${report.coverage.branches.pct}% | ${report.coverage.branches.total} | ${report.coverage.branches.covered} |\n\n`;

  // 按测试套件分组
  const suites = new Map<string, TestResult[]>();
  report.results.forEach(result => {
    if (!suites.has(result.suite)) {
      suites.set(result.suite, []);
    }
    suites.get(result.suite)!.push(result);
  });

  // 详细测试结果
  markdown += '## Test Results\n\n';
  suites.forEach((tests, suite) => {
    markdown += `### ${suite}\n\n`;
    markdown += '| Test | Status | Duration |\n';
    markdown += '|------|--------|----------|\n';

    tests.forEach(test => {
      const status = test.status === 'passed' ? '✅' : test.status === 'failed' ? '❌' : '⚠️';
      markdown += `| ${test.name} | ${status} | ${test.duration.toFixed(2)}ms |\n`;

      if (test.error) {
        markdown += `\n<details><summary>Error Details</summary>\n\n\`\`\`\n${test.error}\n\`\`\`\n</details>\n\n`;
      }
    });

    markdown += '\n';
  });

  // 失败的测试
  const failedTests = report.results.filter(r => r.status === 'failed');
  if (failedTests.length > 0) {
    markdown += '## Failed Tests\n\n';
    failedTests.forEach(test => {
      markdown += `### ${test.suite} - ${test.name}\n\n`;
      markdown += `Duration: ${test.duration.toFixed(2)}ms\n\n`;
      if (test.error) {
        markdown += '```\n' + test.error + '\n```\n\n';
      }
    });
  }

  return markdown;
}

function generateHTMLReport(report: TestReport): string {
  let html = `
<!DOCTYPE html>
<html>
<head>
  <title>Test Report</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    .summary {
      display: flex;
      justify-content: space-between;
      margin: 20px 0;
    }
    .summary-item {
      text-align: center;
      padding: 10px;
      border-radius: 5px;
    }
    .passed { background-color: #4caf50; color: white; }
    .failed { background-color: #f44336; color: white; }
    .skipped { background-color: #ff9800; color: white; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background-color: #f5f5f5;
    }
    .error-details {
      background-color: #fff3f3;
      padding: 10px;
      border-radius: 5px;
      margin: 10px 0;
      white-space: pre-wrap;
    }
  </style>
</head>
<body>
  <h1>Test Report</h1>
  
  <p>Generated at: ${report.timestamp}</p>
  <p>Total Duration: ${(report.duration / 1000).toFixed(2)}s</p>

  <div class="summary">
    <div class="summary-item passed">
      <h3>Passed</h3>
      <p>${report.results.filter(r => r.status === 'passed').length}</p>
    </div>
    <div class="summary-item failed">
      <h3>Failed</h3>
      <p>${report.results.filter(r => r.status === 'failed').length}</p>
    </div>
    <div class="summary-item skipped">
      <h3>Skipped</h3>
      <p>${report.results.filter(r => r.status === 'skipped').length}</p>
    </div>
  </div>

  <h2>Coverage</h2>
  <table>
    <tr>
      <th>Type</th>
      <th>Coverage</th>
      <th>Total</th>
      <th>Covered</th>
    </tr>
    <tr>
      <td>Lines</td>
      <td>${report.coverage.lines.pct}%</td>
      <td>${report.coverage.lines.total}</td>
      <td>${report.coverage.lines.covered}</td>
    </tr>
    <tr>
      <td>Statements</td>
      <td>${report.coverage.statements.pct}%</td>
      <td>${report.coverage.statements.total}</td>
      <td>${report.coverage.statements.covered}</td>
    </tr>
    <tr>
      <td>Functions</td>
      <td>${report.coverage.functions.pct}%</td>
      <td>${report.coverage.functions.total}</td>
      <td>${report.coverage.functions.covered}</td>
    </tr>
    <tr>
      <td>Branches</td>
      <td>${report.coverage.branches.pct}%</td>
      <td>${report.coverage.branches.total}</td>
      <td>${report.coverage.branches.covered}</td>
    </tr>
  </table>
`;

  // 按测试套件分组
  const suites = new Map<string, TestResult[]>();
  report.results.forEach(result => {
    if (!suites.has(result.suite)) {
      suites.set(result.suite, []);
    }
    suites.get(result.suite)!.push(result);
  });

  // 详细测试结果
  html += '<h2>Test Results</h2>';
  suites.forEach((tests, suite) => {
    html += `<h3>${suite}</h3>
    <table>
      <tr>
        <th>Test</th>
        <th>Status</th>
        <th>Duration</th>
      </tr>`;

    tests.forEach(test => {
      const status = test.status === 'passed' ? '✅' :
                    test.status === 'failed' ? '❌' : '⚠️';
      html += `
      <tr>
        <td>${test.name}</td>
        <td>${status}</td>
        <td>${test.duration.toFixed(2)}ms</td>
      </tr>`;

      if (test.error) {
        html += `
        <tr>
          <td colspan="3">
            <div class="error-details">${test.error}</div>
          </td>
        </tr>`;
      }
    });

    html += '</table>';
  });

  html += `
  </body>
  </html>`;

  return html;
}

function main(): void {
  console.log('Generating test report...');

  const report = readTestResults();

  // 创建报告目录
  const reportDir = path.join(process.cwd(), 'test-report');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  // 生成 Markdown 报告
  const markdown = generateMarkdownReport(report);
  fs.writeFileSync(path.join(reportDir, 'test-report.md'), markdown);

  // 生成 HTML 报告
  const html = generateHTMLReport(report);
  fs.writeFileSync(path.join(reportDir, 'test-report.html'), html);

  console.log('Test report generated successfully!');
  console.log(`- Markdown: ${path.join(reportDir, 'test-report.md')}`);
  console.log(`- HTML: ${path.join(reportDir, 'test-report.html')}`);
}

main();