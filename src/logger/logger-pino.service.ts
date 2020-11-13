import pino from "pino";
import expressPino from "express-pino-logger";
import { Service } from "typedi";
import { LoggerApi } from "./logger.api";

// tslint:disable
class ChildLogger extends LoggerApi {
  private static _children: { [name: string]: LoggerApi } = {};
  private static _buildMessage = (message, args) => {
    const mergingObject = {};

    mergingObject[
      typeof message == "string" ? "msg" : "logEventMessage"
    ] = message;
    if (args?.length > 0) mergingObject["logEventData"] = args;

    return mergingObject;
  };

  constructor(private logger: pino.Logger) {
    super();
  }

  error(message: any, ...args: any): void {
    this.logger.error(ChildLogger._buildMessage(message, args));
  }

  log(message: any, ...args: any): void {
    this.logger.info(ChildLogger._buildMessage(message, args));
  }

  debug(message: any, ...args: any): void {
    this.logger.debug(ChildLogger._buildMessage(message, args));
  }

  info(message: any, ...args: any): void {
    this.logger.info(ChildLogger._buildMessage(message, args));
  }

  warn(message: any, ...args: any): void {
    this.logger.warn(ChildLogger._buildMessage(message, args));
  }

  fatal(message: any, ...args: any): void {
    this.logger.fatal(ChildLogger._buildMessage(message, args));
  }

  trace(message: any, ...args: any): void {
    this.logger.trace(ChildLogger._buildMessage(message, args));
  }

  child(component: string): LoggerApi {
    if (ChildLogger._children[component]) {
      return ChildLogger._children[component];
    }

    return (ChildLogger._children[component] = new ChildLogger(
      this.logger.child({ component })
    ));
  }

  apply(app: { use: (app: any) => void }): void {
    app.use(
      expressPino({
        name: "expressLogger",
        level: process.env.EXPRESS_LOG_LEVEL || "warn",
        useLevel: "debug",
      })
    );
  }
}

@Service("logger")
export class PinoLoggerService extends ChildLogger {
  constructor() {
    super(PinoLoggerService.buildLogger());
  }

  static buildLogger() {
    return pino({
      name: "appLogger",
      level: process.env.APP_LOG_LEVEL || "warn",
    });
  }
}
