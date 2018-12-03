"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const issueModel_1 = require("../../models/issueModel");
let testIssue;
describe("Test the constructor of the Issue.", () => {
    it("should create a new Issue object when the input is correct.", () => {
        const issueObj = new issueModel_1.Issue("1", "test title", "test body", "test owner", "test repos", "open");
        expect(issueObj).toMatchObject({
            id: "1",
            title: "test title",
            body: "test body",
            owner: "test owner",
            repos: "test repos",
            state: "open"
        });
    });
    it("should throw a RangeError when the input state is neither 'open' nor 'close'", () => {
        const constructorWithWrongInput = () => {
            return new issueModel_1.Issue("1", "test title", "test body", "test owner", "test repos", "Noropenclose");
        };
        expect(constructorWithWrongInput).toThrow(RangeError);
    });
});
beforeEach(() => {
    testIssue = new issueModel_1.Issue("1", "test title", "test body", "test owner", "test repos", "open");
});
describe("The function getId()", () => {
    it("should return the correct id of the Issue object", () => {
        expect(testIssue.getIssueId()).toEqual("1");
    });
});
describe("The function getTitle()", () => {
    it("should return the correct title of the Issue object", () => {
        expect(testIssue.getTitle()).toEqual("test title");
    });
});
describe("The function setTitle()", () => {
    it("should set a title of the Issue object", () => {
        testIssue.setTitle("test settitle");
        expect(testIssue.getTitle()).toEqual("test settitle");
    });
});
describe("The function getBody()", () => {
    it("should return the correct body of the Issue object", () => {
        expect(testIssue.getBody()).toEqual("test body");
    });
});
describe("The function setBody()", () => {
    it("should set a body of the Issue object", () => {
        testIssue.setBody("test setbody");
        expect(testIssue.getBody()).toEqual("test setbody");
    });
});
describe("The function getState()", () => {
    it("should return the correct state of the Issue object", () => {
        expect(testIssue.getState()).toEqual("open");
    });
});
describe("The function close()", () => {
    it("should set the state of the Issue object to close", () => {
        testIssue.close();
        expect(testIssue.getState()).toEqual("close");
    });
});
describe("The function open()", () => {
    it("should set the state of the Issue object to open", () => {
        testIssue.open();
        expect(testIssue.getState()).toEqual("open");
    });
});
describe("The function getOwner()", () => {
    it("should return the correct owner of the Issue object", () => {
        expect(testIssue.getOwner()).toEqual("test owner");
    });
});
describe("The function getRepos()", () => {
    it("should return the correct repositories of the Issue object", () => {
        expect(testIssue.getRepos()).toEqual("test repos");
    });
});
//# sourceMappingURL=issueModel.test.js.map