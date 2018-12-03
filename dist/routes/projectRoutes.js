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
const authorization_1 = require("./../models/authorization");
const projectModel_1 = require("../models/projectModel");
const kanbanModel_1 = require("../models/kanbanModel");
class ProjectRoutes {
    constructor() {
        this.router = express_1.Router();
        /**
         * POST host/project/new
         *   Create a new project
         *   Request format: {*name, *description, *repositories}
         */
        this.router.post("/new", authorization_1.Authorization.authenticate, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const token = req.headers.authorization;
            const { name, description, repositories } = req.body;
            const project = new projectModel_1.Project(undefined, // the id of the project, the mongodb will assign it one ID
            name, // the name of the project
            undefined, // the owner id of the project, it will get from the access token
            description, // the description of the project
            repositories, // the repositories of the project
            [], // the kanban IDs the project has
            [] // the collaborators of the project
            );
            const theProject = yield project.saveToMongo(token);
            res.status(200).send(theProject);
        }));
        /**
         * GET host/project/name/:projectId
         *   get the name of the project with given projectId
         */
        this.router.get("/name/:projectId", (req, res) => __awaiter(this, void 0, void 0, function* () {
            const projectId = req.params.projectId;
            const theProject = yield projectModel_1.Project.getFromMongo(projectId);
            const projectName = theProject.getName();
            res.status(200).send(projectName);
        }));
        this.router.get("/overview/:projectId", (req, res) => __awaiter(this, void 0, void 0, function* () {
            const projectId = req.params.projectId;
            const theProject = yield projectModel_1.Project.getFromMongo(projectId);
            const theRepositories = theProject.getRepositories();
            const theNumOfRepos = theRepositories.length;
            const theKanbanIds = theProject.getKanbanIds();
            const theNumOfKanbans = theKanbanIds.length;
            let theNumOfIncludeIssues = 0;
            let theNumOfFinishedIssues = 0;
            // get kanban
            for (const kanbanId of theKanbanIds) {
                const theKanban = yield kanbanModel_1.Kanban.getKanbanById(kanbanId);
                theNumOfIncludeIssues += theKanban.includeIssueIds
                    ? theKanban.includeIssueIds.length
                    : 0;
                theNumOfFinishedIssues += theKanban.finishedIssueIds
                    ? theKanban.finishedIssueIds.length
                    : 0;
            }
            res.status(200).send({
                theNumOfRepos,
                theNumOfKanbans,
                theNumOfIncludeIssues,
                theNumOfFinishedIssues
            });
        }));
    }
    routes(app) {
        app.use("/project", this.router);
    }
}
exports.ProjectRoutes = ProjectRoutes;
//# sourceMappingURL=projectRoutes.js.map