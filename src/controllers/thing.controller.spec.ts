import { Container } from "typedi";
import { ThingController } from "./thing.controller";

describe("The thing controller", () => {
  let thingController;
  beforeEach(() => {
    thingController = Container.get(ThingController);
  });

  describe("GET /thing", () => {
    it("should return an array of things", async () => {
      await expect(thingController.getThings()).resolves.toEqual([{ id: "thing1", name: "I am a thing" }]);
    });
  });

  describe("GET /thing/:id", () => {
    it("should return the thing for given id", async () => {
      await expect(thingController.getThingById("thing2")).resolves.toEqual({ id: "thing2", name: "I am a thing" });
    });
  });

  describe("POST /thing", () => {
    it("should return the created thing on success", async () => {
      await expect(thingController.postThing({ id: "newThing", name: "I am a new thing" })).resolves.toEqual({
        id: "newThing",
        name: "I am a new thing",
      });
    });
  });
});
