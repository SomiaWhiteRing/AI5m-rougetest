import { execSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

interface CoverageData {
  statements: number;
  branches: number;
  functions: number;
  lines: number;
  timestamp: number;
}

interface CoverageHistory {
  data: CoverageData[];
  lastUpdate: number;
}

const COVERAGE_DIR = join(process.cwd(), 'coverage');
const HISTORY_FILE = join(COVERAGE_DIR, 'coverage-history.json');
const REPORT_FILE = join(COVERAGE_DIR, 'coverage-report.html');

function ensureDirectoryExists(dir: string): void {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function runTests(): void {
  console.log('Running tests with coverage...');
  execSync('npm run test:coverage', { stdio: 'inherit' });
}

function parseCoverageData(): CoverageData {
  const summaryPath = join(COVERAGE_DIR, 'coverage-summary.json');
  const summary = JSON.parse(readFileSync(summaryPath, 'utf-8'));
  const total = summary.total;

  return {
    statements: total.statements.pct,
    branches: total.branches.pct,
    functions: total.functions.pct,
    lines: total.lines.pct,
    timestamp: Date.now()
  };
}

function loadCoverageHistory(): CoverageHistory {
  if (existsSync(HISTORY_FILE)) {
    return JSON.parse(readFileSync(HISTORY_FILE, 'utf-8'));
  }
  return {
    data: [],
    lastUpdate: Date.now()
  };
}

function updateCoverageHistory(newData: CoverageData): void {
  const history = loadCoverageHistory();
  history.data.push(newData);
  history.lastUpdate = Date.now();

  // 只保留最近30天的数据
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  history.data = history.data.filter(data => data.timestamp >= thirtyDaysAgo);

  writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
}

function generateHTMLReport(history: CoverageHistory): void {
  const latestData = history.data[history.data.length - 1];
  const trend = calculateTrend(history.data);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Test Coverage Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .container { max-width: 800px; margin: 0 auto; }
    .metric { margin: 20px 0; padding: 10px; border: 1px solid #ccc; }
    .good { color: green; }
    .warning { color: orange; }
    .bad { color: red; }
    .trend { font-size: 0.9em; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Test Coverage Report</h1>
    <p>Last updated: ${new Date(history.lastUpdate).toLocaleString()}</p>
    
    <div class="metric">
      <h2>Statements Coverage</h2>
      <p class="${getCoverageClass(latestData.statements)}">
        ${latestData.statements}% ${getTrendIcon(trend.statements)}
      </p>
      <p class="trend">30-day trend: ${trend.statements > 0 ? '+' : ''}${trend.statements.toFixed(2)}%</p>
    </div>

    <div class="metric">
      <h2>Branches Coverage</h2>
      <p class="${getCoverageClass(latestData.branches)}">
        ${latestData.branches}% ${getTrendIcon(trend.branches)}
      </p>
      <p class="trend">30-day trend: ${trend.branches > 0 ? '+' : ''}${trend.branches.toFixed(2)}%</p>
    </div>

    <div class="metric">
      <h2>Functions Coverage</h2>
      <p class="${getCoverageClass(latestData.functions)}">
        ${latestData.functions}% ${getTrendIcon(trend.functions)}
      </p>
      <p class="trend">30-day trend: ${trend.functions > 0 ? '+' : ''}${trend.functions.toFixed(2)}%</p>
    </div>

    <div class="metric">
      <h2>Lines Coverage</h2>
      <p class="${getCoverageClass(latestData.lines)}">
        ${latestData.lines}% ${getTrendIcon(trend.lines)}
      </p>
      <p class="trend">30-day trend: ${trend.lines > 0 ? '+' : ''}${trend.lines.toFixed(2)}%</p>
    </div>
  </div>
</body>
</html>`;

  writeFileSync(REPORT_FILE, html);
}

function calculateTrend(data: CoverageData[]): CoverageData {
  if (data.length < 2) return { statements: 0, branches: 0, functions: 0, lines: 0, timestamp: 0 };

  const first = data[0];
  const last = data[data.length - 1];

  return {
    statements: last.statements - first.statements,
    branches: last.branches - first.branches,
    functions: last.functions - first.functions,
    lines: last.lines - first.lines,
    timestamp: 0
  };
}

function getCoverageClass(value: number): string {
  if (value >= 80) return 'good';
  if (value >= 60) return 'warning';
  return 'bad';
}

function getTrendIcon(trend: number): string {
  if (trend > 0) return '↑';
  if (trend < 0) return '↓';
  return '→';
}

function main(): void {
  try {
    console.log('Starting coverage report generation...');
    
    ensureDirectoryExists(COVERAGE_DIR);
    runTests();
    
    const coverageData = parseCoverageData();
    updateCoverageHistory(coverageData);
    
    const history = loadCoverageHistory();
    generateHTMLReport(history);
    
    console.log('Coverage report generated successfully!');
    console.log(`Report location: ${REPORT_FILE}`);
  } catch (error) {
    console.error('Error generating coverage report:', error);
    process.exit(1);
  }
}

main(); 