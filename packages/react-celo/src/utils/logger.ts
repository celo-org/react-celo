import { Maybe } from '../types';

export enum Level {
  Silent = 0,
  Debug = 1,
  Default = 2,
  Warning = 3,
  Error = 4,
}

export interface ILogger {
  debug(...args: unknown[]): void;
  log(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
}

/**
 * @internal Used the defined the default applicationLogger
 */
export class Logger implements ILogger {
  level: Level;

  constructor(level: Maybe<Level> = null, private namespace = '[react-celo]') {
    if (!level) {
      if (
        process.env.DEBUG === 'true' ||
        process.env.NODE_ENV !== 'production'
      ) {
        this.level = Level.Debug;
      } else {
        this.level = Level.Error;
      }
    } else {
      this.level = level;
    }
  }

  debug(...args: unknown[]) {
    if (this.level > Level.Debug) return;

    console.info(this.namespace, ...args);
  }

  log(...args: unknown[]) {
    if (this.level > Level.Default) return;

    console.log(this.namespace, ...args);
  }

  warn(...args: unknown[]) {
    if (this.level > Level.Warning) return;

    console.warn(this.namespace, ...args);
  }

  error(...args: unknown[]) {
    if (this.level > Level.Error) return;

    console.error(this.namespace, ...args);
  }
}

let applicationLogger: ILogger = new Logger();

function setApplicationLogger(logger: ILogger) {
  applicationLogger = logger;
}

function getApplicationLogger(): ILogger {
  return applicationLogger;
}
export { getApplicationLogger, setApplicationLogger };
