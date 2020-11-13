import { JsonController, Get } from "routing-controllers";

@JsonController("/health")
export class HealthController {
  @Get()
  async healthCheck(): Promise<{ status: string }> {
    return {
      status: "UP",
    };
  }
}
