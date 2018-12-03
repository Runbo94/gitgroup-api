"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cardModel_1 = require("../../models/cardModel");
describe("Test the construct of the Card class", () => {
    it("should create the correct object", () => {
        const cardObj = new cardModel_1.Card("1", "test title", "test body", "test owner", "test repos", "open", "test note");
        expect(cardObj).toMatchObject({
            id: "1",
            title: "test title",
            body: "test body",
            owner: "test owner",
            repos: "test repos",
            state: "open",
            note: "test note"
        });
    });
});
//# sourceMappingURL=cardModel.test.js.map