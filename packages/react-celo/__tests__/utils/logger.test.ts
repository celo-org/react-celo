import {
  getApplicationLogger,
  Level,
  Logger,
  setApplicationLogger,
} from '../../src/utils/logger';

describe('set and get applicationLogger', () => {
  it('replaces the default applicationLogger', () => {
    const fakeLogger = Symbol('logger');

    expect(getApplicationLogger()).toBeInstanceOf(Logger);
    // @ts-expect-error fakeLogger isn't a logger, but this is a test.
    expect(() => setApplicationLogger(fakeLogger)).not.toThrowError();
    expect(getApplicationLogger()).toEqual(fakeLogger);
  });
});

const spies = {
  debug: jest.spyOn(console, 'info'),
  log: jest.spyOn(console, 'log'),
  warn: jest.spyOn(console, 'warn'),
  error: jest.spyOn(console, 'error'),
};
beforeEach(() => {
  Object.values(spies).forEach((spy) => spy.mockReset());
});

describe('default applicationLogger in dev', () => {
  const logger = new Logger();
  it('debugs', () => {
    expect(() => logger.debug(1)).not.toThrowError();
    expect(spies.debug).toBeCalledWith('[react-celo]', 1);
  });
  it('logs', () => {
    expect(() => logger.log(1)).not.toThrowError();
    expect(spies.log).toBeCalledWith('[react-celo]', 1);
  });
  it('warns', () => {
    expect(() => logger.warn(1)).not.toThrowError();
    expect(spies.warn).toBeCalledWith('[react-celo]', 1);
  });
  it('errors', () => {
    expect(() => logger.error(1)).not.toThrowError();
    expect(spies.error).toBeCalledWith('[react-celo]', 1);
  });
});

describe('default applicationLogger in production', () => {
  let logger: Logger;
  const previousEnv = process.env.NODE_ENV;

  beforeEach(() => {
    process.env.NODE_ENV = 'production';
    logger = new Logger();
  });
  afterAll(() => {
    process.env.NODE_ENV = previousEnv;
  });

  it('doesnt debug', () => {
    expect(() => logger.debug(1)).not.toThrowError();
    expect(spies.debug).not.toBeCalled();
  });
  it('doesnt log', () => {
    expect(() => logger.log(1)).not.toThrowError();
    expect(spies.log).not.toBeCalled();
  });
  it('doesnt warn', () => {
    expect(() => logger.warn(1)).not.toThrowError();
    expect(spies.warn).not.toBeCalled();
  });
  it('errors', () => {
    expect(() => logger.error(1)).not.toThrowError();
    expect(spies.error).toBeCalledWith('[react-celo]', 1);
  });
});

describe('custom applicationLogger in production', () => {
  let logger: Logger;
  const previousEnv = process.env.NODE_ENV;

  beforeEach(() => {
    process.env.NODE_ENV = 'production';
    logger = new Logger(Level.Debug);
  });
  afterAll(() => {
    process.env.NODE_ENV = previousEnv;
  });
  it('debugs', () => {
    expect(() => logger.debug(1)).not.toThrowError();
    expect(spies.debug).toBeCalledWith('[react-celo]', 1);
  });
  it('logs', () => {
    expect(() => logger.log(1)).not.toThrowError();
    expect(spies.log).toBeCalledWith('[react-celo]', 1);
  });
  it('warns', () => {
    expect(() => logger.warn(1)).not.toThrowError();
    expect(spies.warn).toBeCalledWith('[react-celo]', 1);
  });
  it('errors', () => {
    expect(() => logger.error(1)).not.toThrowError();
    expect(spies.error).toBeCalledWith('[react-celo]', 1);
  });
});
