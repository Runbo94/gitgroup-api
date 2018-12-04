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
//-------------------------------------------------------------------
// Mongoose related data
//-------------------------------------------------------------------
const mongoose = require("mongoose");
class RepositoryMongo {
}
RepositoryMongo.RepositorySchema = new mongoose.Schema({
    repository_id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    owner_id: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    _url: {
        type: String,
        required: true
    }
});
RepositoryMongo.RepositoryMongoModel = mongoose.model("repositories", RepositoryMongo.RepositorySchema);
exports.RepositoryMongo = RepositoryMongo;
const issueModel_1 = require("./issueModel");
const githubAPI_1 = require("../remoteConnection/github/githubAPI");
class Repository {
    constructor(repository_id, name, owner, description, url, issues, collaborators) {
        this.repository_id = repository_id;
        this.name = name;
        this.owner_id = owner;
        this.description = description;
        this._url = url;
        if (issues)
            this.issues = issues.slice(0);
        if (collaborators)
            this.collaborators = collaborators.slice(0);
    }
    //------------------------------------------------------------------------------
    // Getter and Setter Function
    //-------------------------------------------------------------------------------
    getId() {
        return this.repository_id;
    }
    getName() {
        return this.name;
    }
    setName(name) {
        this.name = name;
        //TODO: Set the name of repository in the GitHub
    }
    getOwner() {
        return this.owner_id;
    }
    getDescription() {
        return this.description;
    }
    setDescription(description) {
        this.description = description;
        //TODO: Set the description of repository in the GitHub
    }
    get url() {
        return this._url;
    }
    set url(value) {
        this._url = value;
    }
    getIssues() {
        const issues = this.issues.slice(0);
        return issues;
    }
    getCollaborators() {
        const collaborators = this.collaborators.slice(0);
        return collaborators;
    }
    //--------------------------------------------------------------------------------
    // Some Functions
    //--------------------------------------------------------------------------------
    // public async save(token: string): Promise<any> {
    //   const post: any = {
    //     name: this.name,
    //     description: this.description
    //   };
    //   let result: any;
    //   try {
    //     result = await github(token).post("/user/repos", post);
    //     this.owner_id = result.data.owner.login;
    //     this.repository_id = result.data.node_id;
    //     // save issues
    //     // save kanbans
    //     // save collaborators
    //   } catch (error) {
    //     throw error;
    //   }
    //   return result;
    // }
    //---------------------------------------------------------------------------------------
    // Some Static Functions
    //---------------------------------------------------------------------------------------
    /**
     * Get all the repositories of owener from Github
     * @param {string} token - the user access token
     * @returns {Promise<any>} if success, return Promise<Repository> , else, return Promise<any>
     */
    static getRepositoriesFromGithub(token) {
        return __awaiter(this, void 0, void 0, function* () {
            let theRepositories;
            // get the repository data from the github
            try {
                theRepositories = (yield githubAPI_1.github(token).get("/user/repos", {
                    params: {
                        type: "owner"
                    }
                })).data;
            }
            catch (error) {
                console.error("<Error> Fail to get the user repository data from the GitHub API.", error);
            }
            let repositoryObjs = [];
            for (let theRepository of theRepositories) {
                // TODO: optimize there!!!
                const issues = yield issueModel_1.Issue.getAllIssues(theRepository.owner.login, theRepository.name, token);
                repositoryObjs.push(new Repository(theRepository.node_id, theRepository.name, theRepository.owner.login, theRepository.description, theRepository.html_url, issues));
            }
            return repositoryObjs;
        });
    }
}
exports.Repository = Repository;
//# sourceMappingURL=repositoryModel.js.map