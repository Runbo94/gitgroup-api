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
class IssueRoutes {
    constructor() {
        this.router = express_1.Router();
        /**
         * get all issue of the repository
         */
        this.router.get("/:name/:repos", (req, res) => __awaiter(this, void 0, void 0, function* () {
            const issues = yield issueModel_1.Issue.getAllIssues(req.params.name, req.params.repos);
            res.status(200).send(issues);
        }));
        /**
         * get all issues of the given project
         */
        this.router.get("/project_issues/:username/:projectId", (req, res) => __awaiter(this, void 0, void 0, function* () {
            const reposNames = yield projectModel_1.Project.getReposNamesOfProject(req.params.projectId);
            const result = [];
            for (let reposName of reposNames) {
                const issues = yield issueModel_1.Issue.getAllIssues(req.params.username, reposName);
                result.push(...issues);
            }
            res.status(200).send(result);
        }));
        /** close the issue */
        this.router.get("/close/:userName/:reposName/:issueId", (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { userName, reposName, issueId } = req.params;
            const token = req.headers.authorization;
            const theIssue = yield issueModel_1.Issue.getIssue(userName, reposName, issueId);
            const result = yield theIssue.close(token);
            res.status(200).send(result);
        }));
    }
    routes(app) {
        app.use("/issues", this.router);
    }
}
exports.IssueRoutes = IssueRoutes;
//# sourceMappingURL=issueRoutes.js.map