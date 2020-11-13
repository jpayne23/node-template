import { IAppIdCredentials } from "../types/AppIdCredentials";

export function getAppIdCredentials(): IAppIdCredentials {
  const appIDCredentials = JSON.parse(process.env.APPID_CREDENTIALS!);

  return {
    apikey: appIDCredentials.apikey,
    clientId: appIDCredentials.clientId,
    managementUrl: appIDCredentials.managementUrl,
    oauthUrl: appIDCredentials.oauthServerUrl,
    secret: appIDCredentials.secret,
    tenantId: appIDCredentials.tenantId,
  };
}
