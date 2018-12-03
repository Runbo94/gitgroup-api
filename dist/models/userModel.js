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
//-------------------------------------------------------------------------
// Mongoose Related Data
//-------------------------------------------------------------------------
const mongoose = require("mongoose");
const repositoryModel_1 = require("./repositoryModel");
const projectModel_1 = require("./projectModel");
class UserMongo {
}
UserMongo.userSchema = new mongoose.Schema({
    node_id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    projects: [projectModel_1.ProjectMongo.ProjectMongoModel.schema],
    repository: [repositoryModel_1.RepositoryMongo.RepositoryMongoModel.schema]
});
UserMongo.UserMongoModel = mongoose.model("users", UserMongo.userSchema);
exports.UserMongo = UserMongo;
const githubAPI_1 = require("../remoteConnection/github/githubAPI");
/**
 * User Class
 * @author Runbo Zhao
 */
class User {
    constructor(id, name, repositories) {
        if (id)
            this.id = id;
        if (name)
            this.name = name;
        if (repositories)
            this.repositories = repositories.slice(0);
    }
    //------------------------------------------------------------
    // Getter and Setter Functions
    //------------------------------------------------------------
    getId() {
        return this.id;
    }
    getName() {
        return this.name;
    }
    getRepositories() {
        return this.repositories;
    }
    //------------------------------------------------------------------
    // Some Functions
    //------------------------------------------------------------------
    //------------------------------------------------------------------
    // Some Static Functions
    //------------------------------------------------------------------
    static getUserFromGithb(token) {
        return __awaiter(this, void 0, void 0, function* () {
            let theUser;
            try {
                theUser = (yield githubAPI_1.github(token).get("/user")).data;
            }
            catch (error) {
                console.error("<Error> Fail to get the user from GitHub.", error);
            }
            const user = new User(theUser.node_id, theUser.login);
            return user;
        });
    }
}
exports.User = User;
//# sourceMappingURL=userModel.js.map