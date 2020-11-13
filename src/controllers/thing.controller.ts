import { JsonController, Get, Param, Post, Body } from "routing-controllers";
import { Thing } from "../types/thing";

@JsonController("/v1/things")
export class ThingController {
  @Get()
  async getThings(): Promise<Thing[]> {
    return [
      {
        id: "thing1",
        name: "I am a thing",
      },
    ];
  }

  @Get("/:id")
  async getThingById(@Param("id") thingId: string): Promise<Thing> {
    return {
      id: thingId,
      name: "I am a thing",
    };
  }

  @Post()
  async postThing(@Body() postThingRequest: Thing): Promise<Thing> {
    return postThingRequest;
  }
}
