import express from "express";
import { AddressInfo } from "net";
import { useContainer, useExpressServer, Action } from "routing-controllers";
import swaggerUi from "swagger-ui-express";
import Container, { Inject } from "typedi";
import jwtDecode from "jwt-decode";
import controllers from "./controllers";
import http = require("http");
import * as openapi from "../openapi.json";
import * as packageJSON from "../package.json";
import { LoggerApi } from "./logger";

import helmet from "helmet";

const { ROUTE_PREFIX, DEFAULT_PORT } = packageJSON.config;

// const passport = require("passport");
const Prometheus = require("prom-client");

// --------------------------------------------------------------------------------
// Prometheus metric's setup
// --------------------------------------------------------------------------------

// enable prom-client to expose default application metrics
const collectDefaultMetrics = Prometheus.collectDefaultMetrics;

// define a custom prefix string for application metrics
collectDefaultMetrics({ prefix: "node_" });

// define a histogram to measure total request duration
const httpRequestDurationMicroseconds = new Prometheus.Histogram({
  name: "node_http_request_duration_ms",
  help: "Duration of HTTP requests in ms",
  labelNames: ["method", "code", "url"],
  buckets: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000], // buckets for response time from 0.1ms to 500ms
});

export class ApiServer {
  private readonly app: express.Application;
  private server: http.Server = null;
  private apiSpec = JSON.parse(JSON.stringify(openapi));
  public PORT: number = +process.env.PORT || parseInt(DEFAULT_PORT);

  constructor(@Inject("logger") private logger: LoggerApi) {
    this.apiSpec.default && delete this.apiSpec.default;
    useContainer(Container);
    this.app = express();
    this.logger.apply(this.app);

    // Prometheus: HttpRequestDurationMicroseconds
    // - runs before each request
    this.app.use((req, res, next) => {
      res.locals.startEpoch = Date.now();
      next();
    });

    // Helmet setup
    this.app.use(
      helmet.contentSecurityPolicy({
        directives: {
          defaultSrc: ["'self'"],
        },
      })
    );

    this.app.use(helmet.referrerPolicy({ policy: "same-origin" }));

    this.app.use(
      helmet.hsts({
        maxAge: 10886400, // 126 days
        includeSubDomains: true,
        preload: true,
      })
    );

    this.app.use(helmet.noSniff());
    this.app.use(helmet.ieNoOpen());

    this.app.use(
      helmet.frameguard({
        action: "deny", // This is irrelevant for microservices, but can be included
      })
    );

    this.app.use(helmet.hidePoweredBy());
    this.app.use(helmet.xssFilter());

    if (process.env.NODE_ENV !== "production") {
      // serve openapi.json
      this.app.use(`${ROUTE_PREFIX}/openapi.json`, (req, res, next) => {
        res.send(this.apiSpec);
      });

      // serve swagger-ui
      this.app.use(ROUTE_PREFIX + "/api-docs", swaggerUi.serve, swaggerUi.setup(this.apiSpec));
    }

    // Initialise AppID Passport strategy
    // passport.use(new APIStrategy({ oauthServerUrl: getAppIdCredentials().oauthUrl }));

    // Initialise AppID middleware
    // this.app.use(passport.initialize());

    // Secure all endpoints behind AppID except /health and /yourPublicEndpoint (to be adapted)
    // this.app.use(
    //   /^((?!(health|yourPublicEndpoint)).)*$/,
    //   passport.authenticate(APIStrategy.STRATEGY_NAME, { session: false })
    // );

    this.app.get(ROUTE_PREFIX + "/metrics", (req, res) => {
      res.set("Content-Type", Prometheus.register.contentType);
      res.end(Prometheus.register.metrics());
    });

    useExpressServer(this.app, {
      cors: true,
      controllers: controllers,
      routePrefix: ROUTE_PREFIX,
      // currentUserChecker: async (action: Action) => {
      //   const token = action.request.headers["authorization"];
      //   return token;
      // },
      // authorizationChecker: async (action: Action, roles: string[]) => {
      //   const token = action.request.headers["authorization"];
      //   if (!token) {
      //     return false;
      //   }
      //   if (!roles || roles.length === 0) {
      //     return true;
      //   }
      //   const userData = jwtDecode(token);

      //   //user roles and controller roles has at least one match
      //   if (userData.roles.some((r) => roles.indexOf(r) >= 0)) {
      //     return true;
      //   }

      //   return false;
      // },
    });

    // Prometheus: HttpRequestDurationMicroseconds
    // - runs after each request
    this.app.use((req, res, next) => {
      const responseTimeInMs = Date.now() - res.locals.startEpoch;

      httpRequestDurationMicroseconds.labels(req.method, res.statusCode, req.route.path).observe(responseTimeInMs);

      next();
    });
  }

  /**
   * Start the server
   * @returns {Promise<ApiServer>}
   */
  public async start(): Promise<ApiServer> {
    return new Promise<ApiServer>((resolve, reject) => {
      this.server = this.app
        .listen(this.PORT, () => {
          const addressInfo = this.server!.address() as AddressInfo;
          const address = addressInfo.address === "::" ? "localhost" : addressInfo.address;

          this.logger.info(`Listening to http://${address}:${addressInfo.port}${ROUTE_PREFIX}`);

          if (process.env.NODE_ENV !== "production") {
            this.logger.info(`OpenAPI spec at http://${address}:${addressInfo.port}${ROUTE_PREFIX}/api-docs`);
          }
          return resolve(this);
        })
        .on("error", (err: any) => {
          return reject(err);
        });
    });
  }

  /**
   * Stop the server (if running).
   * @returns {Promise<boolean>}
   */
  public async stop(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      if (this.server) {
        this.server.close(() => {
          return resolve(true);
        });
      } else {
        return resolve(false);
      }
    });
  }

  public getApp(): express.Application {
    return this.app;
  }
}
