/*import { Project, ProjectMongoModel } from "../../models/projectModel";

describe("test saveToMongo() function", () => {
  it("should save the project to the mongodb and set its id", () => {
    jest
      .spyOn(ProjectMongoModel.prototype, "save")
      .mockImplementationOnce(callback => {
        const pro = {
          id: "test id",
          name: "test name"
        };
        const err = null;
        callback(err, pro);
      });

    const projectObj: Project = new Project("test name");
    projectObj.saveToMongo();
    expect(typeof projectObj.getId()).toEqual("string");
  });
});*/
//# sourceMappingURL=projectModel.test.js.map