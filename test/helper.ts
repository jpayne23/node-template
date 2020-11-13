
import {ApiServer} from '../src/server';
import {LoggerApi, NoopLoggerService} from '../src/logger';
import Container from 'typedi';

export function buildApiServer(enableLogging?: boolean): ApiServer {
  const apiServer = Container.get(ApiServer);

  if (!enableLogging) {
    Container.set(LoggerApi, NoopLoggerService);
  }

  return apiServer;
}
