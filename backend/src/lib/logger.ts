/**
 * Lightweight structured logger for Cloudflare Workers.
 * Outputs JSON lines that are easy to search in `wrangler tail` or any log drain.
 */

type LogLevel = 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  msg: string;
  [key: string]: unknown;
}

function write(level: LogLevel, msg: string, extra?: Record<string, unknown>) {
  const entry: LogEntry = { level, msg, ...extra };
  const line = JSON.stringify(entry);

  if (level === 'error') {
    console.error(line);
  } else if (level === 'warn') {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export const log = {
  info: (msg: string, extra?: Record<string, unknown>) => write('info', msg, extra),
  warn: (msg: string, extra?: Record<string, unknown>) => write('warn', msg, extra),
  error: (msg: string, extra?: Record<string, unknown>) => write('error', msg, extra),
};
