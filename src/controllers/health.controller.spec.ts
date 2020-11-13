import { Container } from "typedi";
import { HealthController } from "./health.controller";

describe("health.controller", () => {
  let healthController;

  beforeEach(() => {
    healthController = Container.get(HealthController);
  });

  it("canary validates test infrastructure", () => {
    expect(true).toBe(true);
  });

  describe("Given /health", () => {
    test('should return {status: "UP:}', async () => {
      await expect(healthController.healthCheck()).resolves.toEqual({
        status: "UP",
      });
    });
  });
});
