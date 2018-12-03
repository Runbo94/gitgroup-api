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
const repositoryModel_1 = require("./../models/repositoryModel");
const authorization_1 = require("./../models/authorization");
class RepositoryRoutes {
    constructor() {
        this.router = express_1.Router();
        /**
         * GET /repos - get all repository
         */
        this.router.get("/", authorization_1.Authorization.authenticate, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const token = req.headers.authorization;
            const reposes = yield repositoryModel_1.Repository.getRepositoriesFromGithub(token);
            res.status(200).send(reposes);
        }));
    }
    routes(app) {
        app.use("/repos", this.router);
    }
}
exports.RepositoryRoutes = RepositoryRoutes;
//# sourceMappingURL=repositoryRoutes.js.map