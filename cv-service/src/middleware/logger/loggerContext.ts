export class LoggerData {
  url: string;
  body?: unknown;
  warnings: unknown[] = [];
  errors: unknown[] = [];
  status: number;
  responseTime: string;
}

export interface ILoggerAppContext {
  logger: LoggerData;
}
