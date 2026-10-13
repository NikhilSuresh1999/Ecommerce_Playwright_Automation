import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';

interface SuiteMetrics {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  flaky: number;
}

export default class EnterpriseSummaryReporter implements Reporter {
  private startTime = 0;
  private totalTests = 0;
  private passed = 0;
  private failed = 0;
  private skipped = 0;
  private flaky = 0;
  private readonly suiteBreakdown = new Map<string, SuiteMetrics>();

  onBegin(_config: FullConfig, suite: Suite): void {
    this.startTime = Date.now();
    this.totalTests = suite.allTests().length;
    console.log('\n================================================================================');
    console.log(' 🚀 ENTERPRISE PLAYWRIGHT AUTOMATION SUITE - EXECUTION STARTED');
    console.log(` 📋 Discovered Total Test Scenarios: ${this.totalTests}`);
    console.log('================================================================================\n');
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    const relativeFile = path
      .relative(process.cwd(), test.location.file)
      .replace(/\\/g, '/');

    if (!this.suiteBreakdown.has(relativeFile)) {
      this.suiteBreakdown.set(relativeFile, {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        flaky: 0,
      });
    }

    const metrics = this.suiteBreakdown.get(relativeFile)!;

    // Only count final attempt for a test case
    const isFinalAttempt =
      result.status === 'passed' ||
      result.status === 'skipped' ||
      result.retry === test.retries;

    if (!isFinalAttempt) {
      return;
    }

    metrics.total++;

    if (result.status === 'passed') {
      if (result.retry > 0) {
        this.flaky++;
        metrics.flaky++;
      }
      this.passed++;
      metrics.passed++;
    } else if (result.status === 'skipped') {
      this.skipped++;
      metrics.skipped++;
    } else {
      this.failed++;
      metrics.failed++;
    }
  }

  onEnd(result: FullResult): void {
    const durationSec = ((Date.now() - this.startTime) / 1000).toFixed(2);
    const executed = this.passed + this.failed;
    const passRate = executed > 0 ? ((this.passed / executed) * 100).toFixed(2) : '0.00';

    console.log('\n================================================================================');
    console.log(' 📊 ENTERPRISE PLAYWRIGHT AUTOMATION - EXECUTIVE SUMMARY');
    console.log('================================================================================');
    console.log(` 🏁 Overall Status : ${result.status.toUpperCase()}`);
    console.log(` 🧪 Total Scenarios: ${this.passed + this.failed + this.skipped}`);
    console.log(` ✅ Passed         : ${this.passed}`);
    console.log(` ❌ Failed         : ${this.failed}`);
    console.log(` ⚠️  Flaky (Retried): ${this.flaky}`);
    console.log(` ⏭️  Skipped        : ${this.skipped}`);
    console.log(` 📈 Pass Rate      : ${passRate}%`);
    console.log(` ⏱️  Duration       : ${durationSec}s`);
    console.log('--------------------------------------------------------------------------------');
    console.log(' 📁 SUITE BREAKDOWN:');

    const summaryRows: Array<{
      suite: string;
      total: number;
      passed: number;
      failed: number;
      skipped: number;
    }> = [];

    for (const [suiteName, stats] of this.suiteBreakdown.entries()) {
      console.log(
        `  • ${suiteName.padEnd(58)} | Total: ${String(stats.total).padStart(3)} | ✅ ${String(stats.passed).padStart(3)} | ❌ ${stats.failed}`
      );
      summaryRows.push({
        suite: suiteName,
        total: stats.total,
        passed: stats.passed,
        failed: stats.failed,
        skipped: stats.skipped,
      });
    }
    console.log('================================================================================\n');

    // Persist JSON & Markdown Executive Report for CI/CD and Portfolio Artifacts
    const reportsDir = path.resolve(process.cwd(), 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const summaryPayload = {
      timestamp: new Date().toISOString(),
      status: result.status,
      durationSeconds: Number(durationSec),
      passRate: `${passRate}%`,
      totals: {
        total: this.passed + this.failed + this.skipped,
        passed: this.passed,
        failed: this.failed,
        flaky: this.flaky,
        skipped: this.skipped,
      },
      suites: summaryRows,
    };

    fs.writeFileSync(
      path.join(reportsDir, 'executive-summary.json'),
      JSON.stringify(summaryPayload, null, 2),
      'utf-8'
    );

    const mdLines = [
      '# 📊 Enterprise Playwright Automation — Executive Test Summary',
      '',
      `- **Status**: \`${result.status.toUpperCase()}\``,
      `- **Total Test Cases**: **${summaryPayload.totals.total}**`,
      `- **Passed**: **${this.passed}** ✅`,
      `- **Failed**: **${this.failed}** ❌`,
      `- **Pass Rate**: **${passRate}%**`,
      `- **Execution Time**: **${durationSec}s**`,
      '',
      '## Suite-Level Breakdown',
      '',
      '| Test Suite | Total | Passed | Failed | Skipped |',
      '| :--- | :---: | :---: | :---: | :---: |',
      ...summaryRows.map(
        (r) => `| \`${r.suite}\` | ${r.total} | ${r.passed} ✅ | ${r.failed} | ${r.skipped} |`
      ),
      '',
    ];

    fs.writeFileSync(
      path.join(reportsDir, 'executive-summary.md'),
      mdLines.join('\n'),
      'utf-8'
    );
  }
}

