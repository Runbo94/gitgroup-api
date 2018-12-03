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
const userModel_1 = require("./userModel");
const projectModel_1 = require("./projectModel");
const githubAPI_1 = require("../remoteConnection/github/githubAPI");
const repositoryModel_1 = require("./repositoryModel");
class Owner extends userModel_1.User {
    constructor(id, name, projects, repositories) {
        super(id ? id : undefined, name ? name : undefined, repositories ? repositories : undefined);
        if (projects)
            this.projects = projects.slice(0);
    }
    /**
     * According to the github token, return the user information of that token owner
     * @returns the Promise of the owner
     */
    // public static async getMe(): Promise<any> {
    //   try {
    //     const userDate: any = await githubApi.get("/user");
    //     if (!userDate.data) return userDate;
    //     // get repositories
    //     // get projects
    //     return new User(userDate.data.login, userDate.data.node_id);
    //   } catch (error) {
    //     throw error;
    //   }
    // }
    static getOwnerFromGithub(token) {
        return __awaiter(this, void 0, void 0, function* () {
            let theUser;
            try {
                theUser = (yield githubAPI_1.github(token).get("/user")).data;
            }
            catch (error) {
                console.error("<Error> Fail to get the user from the GitHub API.", error);
            }
            const projects = yield projectModel_1.Project.getProjectsOfUser(theUser.node_id);
            const repositories = yield repositoryModel_1.Repository.getRepositoriesFromGithub(token);
            const owner = new Owner(theUser.node_id, theUser.login, projects, repositories);
            return owner;
        });
    }
}
exports.Owner = Owner;
//# sourceMappingURL=ownerModel.js.map