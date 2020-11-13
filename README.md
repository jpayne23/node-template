# node template

## Template features

- Dockerfile uses node:12 base image
- Script to build and run the service in a local docker container (docker subdirectory)
- openapi generates api-docs including Bearer token support
- pre-push hook for validation and testing
- routing-controllers and typedi
- controllers unit testing without supertest
- npm run scripts:
  - "dev": runs the service with pino-pretty output
  - "validate": runs tests and typescript check
  - "openapi": creates the openapi spec file

## Template todos:

- Add strict mode to tsconfig and fix problems (e.g. server.ts and stringUtils.spec.ts)
- Fix spec file for server.ts
- make sure .secrets & docker/dockerenv.vars has a list of required env vars for the service
- Provide updated instructions for
  - webhook
