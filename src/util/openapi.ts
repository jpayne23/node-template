import {
  getMetadataArgsStorage,
  createExpressServer,
  RoutingControllersOptions,
} from "routing-controllers";
import { routingControllersToSpec } from "routing-controllers-openapi";
import * as tsj from "ts-json-schema-generator";
import { writeFileSync } from "fs";
import controllers from "../controllers";
import * as packageJSON from "../../package.json";

const { ROUTE_PREFIX, DEFAULT_PORT } = packageJSON.config;
const { name, description } = packageJSON;

const buildDescription = (initialDescription) => {
  return `**${initialDescription}**  
    
  Download source openapi.json: [local](http://localhost:${DEFAULT_PORT}${ROUTE_PREFIX}/openapi.json), [dev](https://service.dev.pipt.com${ROUTE_PREFIX}/openapi.json), [staging](https://service.staging.pipt.com${ROUTE_PREFIX}/openapi.json)  
    
  Get your tokens from:  
  DEV: [service-auth](https://service.dev.pipt.com/auth/api-docs)  
  STAGING: [service-auth](https://service.staging.pipt.com/auth/api-docs)  
    
  **Enjoy!**`;
};

export function generateSwaggerSpec(typesGlob: string) {
  const storage = getMetadataArgsStorage();
  const routingControllerOptions: RoutingControllersOptions = {
    cors: true,
  };
  const additionalProperties = {
    info: {
      title: name,
      description: buildDescription(description),
      version: "",
    },

    servers: [
      {
        url: `http://localhost:${DEFAULT_PORT}${ROUTE_PREFIX}`,
        description: "localhost",
      },
      {
        url: `https://service.dev.pipt.com${ROUTE_PREFIX}`,
        description: "development server",
      },
      {
        url: `https://service.staging.pipt.com${ROUTE_PREFIX}`,
        description: "staging server",
      },
    ],
  };
  const spec = routingControllersToSpec(
    storage,
    routingControllerOptions,
    additionalProperties
  );

  // Create the schemas only for the types included in the spec
  const typesInSpec: string[] = extractTypesFromSpec(spec);
  const generator = tsj.createGenerator({ path: typesGlob });
  let schemas = {};
  typesInSpec.forEach((type) => {
    let typeSchema = generator.createSchema(type);
    schemas = { ...schemas, ...typeSchema.definitions };
  });

  // Hack: routing-controllers-openapi expects schemas in #/components/schemas/
  // but ts-json-schema-generator expects them in #/definitions/
  // so we do a hacky replace on the string
  const schemaString = JSON.stringify(schemas).replace(
    new RegExp("/definitions", "g"),
    "/components/schemas"
  );
  const newSchemas = JSON.parse(schemaString);

  spec.components.schemas = newSchemas as any;
  spec.components.securitySchemes = {
    bearerAuth: {
      type: "http",
      scheme: "bearer",
    },
  };
  return spec;
}

if (!module.parent) {
  createExpressServer({ controllers });
  writeFileSync(
    "openapi.json",
    JSON.stringify(generateSwaggerSpec("src/types/**/*.ts"), null, 2)
  );
}
function extractTypesFromSpec(spec) {
  const typesInSpec: string[] = [];

  for (const pathName in spec.paths) {
    const path = spec.paths[pathName];
    for (const methodName in path) {
      const method = path[methodName];
      const requestSchemaRef: string =
        method.requestBody?.content?.["application/json"]?.schema?.["$ref"];
      if (requestSchemaRef) {
        const type = requestSchemaRef.replace("#/components/schemas/", "");
        if (!typesInSpec.includes(type)) typesInSpec.push(type);
      }
      for (const responseName in method.responses) {
        const response = method.responses[responseName];
        const responseSchemaRef =
          response.content?.["application/json"]?.schema?.["$ref"];
        if (responseSchemaRef) {
          const type = responseSchemaRef.replace("#/components/schemas/", "");
          if (!typesInSpec.includes(type)) typesInSpec.push(type);
        }
      }
    }
  }
  return typesInSpec;
}
