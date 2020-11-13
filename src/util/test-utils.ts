import { LoggerApi } from "../logger";
export class MockLogger extends LoggerApi {
  static mockErrorLogger = jest.fn();
  static mockInfoLogger = jest.fn();
  static mockDebugLogger = jest.fn();
  static mockWarnLogger = jest.fn();
  static mockTraceLogger = jest.fn();

  child = jest.fn().mockReturnValue({
    info: MockLogger.mockInfoLogger,
    error: MockLogger.mockErrorLogger,
    debug: MockLogger.mockDebugLogger,
    warn: MockLogger.mockWarnLogger,
    log: () => {},
    trace: MockLogger.mockTraceLogger,
    apply: () => {},
    fatal: () => {},
  });

  fatal = jest.fn();
  error = MockLogger.mockErrorLogger;
  info = MockLogger.mockInfoLogger;
  debug = MockLogger.mockDebugLogger;
  warn = MockLogger.mockWarnLogger;
  log = jest.fn();
  trace = MockLogger.mockTraceLogger;
  apply = jest.fn();
}

export type PublicInterfaceOf<T> = {
  [Member in keyof T]: T[Member];
};

export const clone = <T>(x: T) => JSON.parse(JSON.stringify(x)) as T;

/**
 * getMockFunctionCallArgument
 * @param mockFunction mocked function
 * @param callNumber number of invocation in the array of calls, defaults to 0
 * @param argNumber number of argument in the array, defaults to 0
 */
export const getMockFunctionCallArgument = (
  mockFunction: jest.Mock,
  callNumber = 0,
  argNumber = 0
) => {
  return mockFunction.mock.calls[callNumber][argNumber];
};
