"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const issueModel_1 = require("../models/issueModel");
const projectModel_1 = require("../models/projectModel");
const cardModel_1 = require("../models/cardModel");
class CardRoutes {
    constructor() {
        this.router = express_1.Router();
        /**get all the issue card, same with the get issue */
        this.router.get("/:name/:repos", (req, res) => __awaiter(this, void 0, void 0, function* () {
            const issues = yield issueModel_1.Issue.getAllIssues(req.params.name, req.params.repos);
            res.status(200).send(issues);
        }));
        this.router.get("/project_cards/:username/:projectId", (req, res) => __awaiter(this, void 0, void 0, function* () {
            const reposNames = yield projectModel_1.Project.getReposNamesOfProject(req.params.projectId);
            const result = [];
            for (let reposName of reposNames) {
                const issues = yield issueModel_1.Issue.getAllIssues(req.params.username, reposName);
                result.push(...issues);
            }
            res.status(200).send(result);
        }));
        /**
         * POST /cards/add_new_card/:kanban_id/:column_id
         *  create a new card.
         *  the request body format:
         *    {issueId, title, body, owner, repos, state, note, id?}
         */
        this.router.post("/add_new_card/:kanban_id/:column_id", (req, res) => __awaiter(this, void 0, void 0, function* () {
            const token = req.headers.authorization;
            const { id, issueId, title, body, owner, repos, state, note, number } = req.body;
            const kanbanId = req.params.kanban_id;
            const columnId = req.params.column_id;
            let theIssue = new issueModel_1.Issue(issueId, title, body, owner, repos, state, number);
            let theCard = new cardModel_1.Card(theIssue, note, kanbanId, columnId, id);
            const result = yield theCard.saveToMongo(token);
            res.status(200).send(result);
        }));
        this.router.delete("/:kanban_id/:column_id/:card_id", (req, res) => __awaiter(this, void 0, void 0, function* () {
            const token = req.headers.authorization;
            const { kanban_id, column_id, card_id } = req.params;
            const result = yield cardModel_1.Card.deleteACard(kanban_id, column_id, card_id, token);
            res.status(200).send(result);
        }));
    }
    routes(app) {
        app.use("/cards", this.router);
    }
}
exports.CardRoutes = CardRoutes;
//# sourceMappingURL=cardRoutes.js.map