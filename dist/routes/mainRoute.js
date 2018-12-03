"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const projectRoutes_1 = require("./projectRoutes");
const repositoryRoutes_1 = require("./repositoryRoutes");
const authorizationRoutes_1 = require("./authorizationRoutes");
const userRoutes_1 = require("./userRoutes");
const issueRoutes_1 = require("./issueRoutes");
const cardRoutes_1 = require("./cardRoutes");
const kanbanRoutes_1 = require("./kanbanRoutes");
class MainRoute {
    routes(app) {
        app.use(function (req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, PATCH");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
            next();
        });
        new userRoutes_1.UserRoutes().routes(app);
        new projectRoutes_1.ProjectRoutes().routes(app);
        new repositoryRoutes_1.RepositoryRoutes().routes(app);
        new authorizationRoutes_1.AuthorizationRoutes().routes(app);
        new issueRoutes_1.IssueRoutes().routes(app);
        new cardRoutes_1.CardRoutes().routes(app);
        new kanbanRoutes_1.KanbanRoutes().routes(app);
    }
}
exports.MainRoute = MainRoute;
//# sourceMappingURL=mainRoute.js.map