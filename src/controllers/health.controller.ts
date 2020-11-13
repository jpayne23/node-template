import { JsonController, Get } from "routing-controllers";
import { OpenAPI } from "routing-controllers-openapi";

@JsonController("/health")
export class HealthController {
  @Get()
  async healthCheck(): Promise<{ status: string }> {
    return {
      status: "UP",
    };
  }
}
