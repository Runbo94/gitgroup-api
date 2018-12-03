"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const userModel_1 = require("../../models/userModel");
let testUser;
describe("test user class constructor", () => {
    it("should create a new user object with basic name and id", () => {
        const user = new userModel_1.User("1", "test name");
        expect(user).toMatchObject({
            id: "1",
            name: "test name"
        });
    });
});
beforeEach(() => {
    testUser = new userModel_1.User("1", "test name");
});
describe("The function getId()", () => {
    it("should return the correct id of the User object", () => {
        expect(testUser.getId()).toEqual("1");
    });
});
describe("The function getName()", () => {
    it("should return the correct name of the User object", () => {
        expect(testUser.getName()).toEqual("test name");
    });
});
//# sourceMappingURL=userModel.test.js.map