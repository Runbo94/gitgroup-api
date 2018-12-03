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
const kanbanModel_1 = require("../models/kanbanModel");
const kanbanColumnModel_1 = require("../models/kanbanColumnModel");
class KanbanRoutes {
    constructor() {
        this.router = express_1.Router();
        /**
         * POST /kanban/new - create a new kanban
         * receive:
         * {
         *  name*: kanbanName,
         *  state: default close,
         *  due*: kanban due day
         *  projectId*: the project id which the kanban belongs to
         *  columns:
         *  cards:
         * }
         */
        this.router.post("/new", (req, res) => __awaiter(this, void 0, void 0, function* () {
            let { name, due, projectId, columns } = req.body;
            // create column
            if (!columns) {
                const toDoCol = new kanbanColumnModel_1.KanbanColumn(undefined, "To Do");
                const inCol = new kanbanColumnModel_1.KanbanColumn(undefined, "In Progress");
                const reviewCol = new kanbanColumnModel_1.KanbanColumn(undefined, "In Review");
                const doneCol = new kanbanColumnModel_1.KanbanColumn(undefined, "Done");
                columns = [toDoCol, inCol, reviewCol, doneCol];
            }
            // create new Kanban object
            const theKanban = new kanbanModel_1.Kanban(undefined, name, "open", due, projectId, columns, [], [], []);
            const savedKanban = yield theKanban.saveToMongo();
            res.status(200).send(savedKanban);
        }));
        /**
         * get all kanbans for a project
         */
        this.router.get("/:projectId", (req, res) => __awaiter(this, void 0, void 0, function* () {
            const kanbans = yield kanbanModel_1.Kanban.getAllKanbansOfProject(req.params.projectId);
            res.status(200).send(kanbans);
        }));
        /** according to the kanban id, get the kanban */
        this.router.get("/kanban_id/:kanbanId", (req, res) => __awaiter(this, void 0, void 0, function* () {
            const theKanban = yield kanbanModel_1.Kanban.getKanbanById(req.params.kanbanId);
            res.status(200).send(theKanban);
        }));
        /** get a kanban column */
        this.router.get("/column/:kanbanId/:columnId", (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { kanbanId, columnId } = req.params;
            const theColumn = yield kanbanColumnModel_1.KanbanColumn.getColumn(kanbanId, columnId);
            res.status(200).send(theColumn);
        }));
    }
    /**
     * Bound all the routes
     * @param app express application
     */
    routes(app) {
        app.use("/kanban", this.router);
    }
}
exports.KanbanRoutes = KanbanRoutes;
//# sourceMappingURL=kanbanRoutes.js.map