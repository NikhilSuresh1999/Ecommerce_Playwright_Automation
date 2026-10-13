export type LogLevel = 'INFO' | 'STEP' | 'WARN' | 'ERROR' | 'API';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  context: string;
  message: string;
}

export class TestLogger {
  private readonly logs: LogEntry[] = [];
  private readonly context: string;

  constructor(context = 'Framework') {
    this.context = context;
  }

  private record(level: LogLevel, message: string): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      context: this.context,
      message,
    };
    this.logs.push(entry);
    if (process.env.VERBOSE_LOGS === 'true') {
      console.log(`[${entry.timestamp}] [${entry.level}] [${entry.context}] ${entry.message}`);
    }
  }

  public info(message: string): void {
    this.record('INFO', message);
  }

  public step(message: string): void {
    this.record('STEP', message);
  }

  public warn(message: string): void {
    this.record('WARN', message);
  }

  public error(message: string): void {
    this.record('ERROR', message);
  }

  public api(method: string, endpoint: string, status: number, durationMs: number): void {
    this.record('API', `${method.toUpperCase()} ${endpoint} -> ${status} (${durationMs}ms)`);
  }

  public getLogs(): ReadonlyArray<LogEntry> {
    return this.logs;
  }

  public formatLogsAsText(): string {
    return this.logs
      .map((e) => `[${e.timestamp}] [${e.level.padEnd(5)}] [${e.context}] ${e.message}`)
      .join('\n');
  }
}

