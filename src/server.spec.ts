import request from "supertest";
import Container from "typedi";
import { ApiServer } from "./server";
import * as packageJSON from "../package.json";
import { MockLogger } from "./util/test-utils";
import * as appIDCredsHelper from "./util/appIdCreds";

const { ROUTE_PREFIX } = packageJSON.config;
const getCredentialsMock = jest.spyOn(appIDCredsHelper, "getAppIdCredentials");

getCredentialsMock.mockImplementation(() => {
  return {
    apikey: "mockClientId",
    clientId: "mockClientId",
    managementUrl: "oauthManagementUrl",
    oauthUrl: "mockOauthUrl",
    secret: "mockSecret",
    tenantId: "mockTenantId",
  };
});

describe("server", () => {
  let apiServer: ApiServer;
  beforeEach(() => {
    Container.set("logger", new MockLogger());
    apiServer = Container.get(ApiServer);
  });

  describe("", () => {
    it("should return 200 status", () => {
      return request(apiServer.getApp())
        .get(`${ROUTE_PREFIX}/api-docs/`)
        .expect(200);
    });
  });
});
