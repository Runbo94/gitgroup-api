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
//----------------------------------------------------------------------------
// Project(Mongo)
//----------------------------------------------------------------------------
const mongoose = require("mongoose");
const repositoryModel_1 = require("./repositoryModel");
class ProjectMongo {
}
ProjectMongo.ProjectSchema = new mongoose.Schema({
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
    repositories: [repositoryModel_1.RepositoryMongo.RepositoryMongoModel.schema],
    kanbanIds: {
        type: [String],
        default: []
    }
});
ProjectMongo.ProjectMongoModel = mongoose.model("projects", ProjectMongo.ProjectSchema);
exports.ProjectMongo = ProjectMongo;
const repositoryModel_2 = require("./repositoryModel");
const userModel_1 = require("./userModel");
class Project {
    constructor(id, name, ownerId, description, repositories, kanbanIds, collaborators) {
        if (id)
            this.id = id;
        if (name)
            this.name = name;
        if (ownerId)
            this.ownerId = ownerId;
        if (description)
            this.description = description;
        if (repositories)
            this.repositories = repositories.slice(0);
        if (kanbanIds)
            this.kanbanIds = kanbanIds.slice(0);
        if (collaborators)
            this.collaborators = collaborators.slice(0);
    }
    //----------------------------------------------------------------------------
    // getter and setter function
    //----------------------------------------------------------------------------
    getId() {
        return this.id;
    }
    getName() {
        return this.name;
    }
    setName(name) {
        this.name = name;
    }
    getOwnerId() {
        return this.ownerId;
    }
    getDescription() {
        return this.description;
    }
    setDescription(description) {
        this.description = description;
    }
    getRepositories() {
        return this.repositories.slice(0);
    }
    setRepositories(repositories) {
        this.repositories = repositories.slice(0);
    }
    getKanbanIds() {
        return this.kanbanIds.slice(0);
    }
    setKanbanIds(kanbanIds) {
        this.kanbanIds = kanbanIds.slice(0);
    }
    getCollaborators() {
        return this.collaborators.slice(0);
    }
    setCollaborators(collaborator) {
        this.collaborators = collaborator.slice(0);
    }
    //------------------------------------------------------------------------
    // All Functions
    //------------------------------------------------------------------------
    /**
     * save the project object to the MongoDB
     * @param req - the http request which contains the access token in its header
     */
    saveToMongo(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield userModel_1.User.getUserFromGithb(token);
            this.ownerId = user.getId(); // get the owner ID from the access token
            const theId = this.id
                ? mongoose.Types.ObjectId(this.id)
                : mongoose.Types.ObjectId(); // set the id if the this.id is undefined
            let project = {
                // saved data format
                _id: theId,
                name: this.name,
                owner_id: this.ownerId,
                description: this.description,
                repositories: this.repositories
            };
            /** save it to the project document */
            try {
                // throw new Error("DEBUG");
                const projectMongo = new ProjectMongo.ProjectMongoModel(project);
                yield projectMongo.save();
                this.id = theId;
            }
            catch (error) {
                console.error("<Error> Fail to save the project to mongoDB.", error);
            }
            /** saved it as a sub-document under the user document */
            // get user from mongo db
            let theUser;
            try {
                theUser = yield userModel_1.UserMongo.UserMongoModel.findOne({
                    node_id: this.ownerId
                });
            }
            catch (error) {
                console.error("<Error> Fail to get the user from the mongoDB whose the node_id is " +
                    this.ownerId, error);
            }
            // the the user not exist in the mongodb create a new user in the mongoDB
            try {
                if (!theUser) {
                    const userMongo = new userModel_1.UserMongo.UserMongoModel({
                        node_id: this.ownerId,
                        name: user.getName()
                    });
                    theUser = yield userMongo.save();
                }
            }
            catch (error) {
                console.error("<Error> Fail to create a new user in the mongoDB whose GitHub node_id is " +
                    this.ownerId, error);
            }
            // add the project to user
            if (!theUser.projects) {
                theUser.projects = [project]; // if there is no projects key in the user, create an empty array
            }
            else {
                theUser.projects.push(project);
            }
            let result;
            try {
                result = yield theUser.save();
            }
            catch (error) {
                console.error("<Error> Fail to save the user in the document when push a new project in the user.", error);
            }
            return result;
        });
    }
    //------------------------------------------------------------------------------
    // Static function
    //------------------------------------------------------------------------------
    /**not good: more oop, get project first and then getRepos() */
    /**
     * Given a project ID, get all the names of repositories of that project.
     * @param projectId
     * @returns {string[]} - the list of the names of the repositories
     */
    static getReposNamesOfProject(projectId) {
        return __awaiter(this, void 0, void 0, function* () {
            let theProject;
            try {
                theProject = yield ProjectMongo.ProjectMongoModel.findById(projectId);
            }
            catch (error) {
                console.error("<Error> Fail to find the project in the mongoDB whose _id is " +
                    projectId, error);
            }
            if (!theProject)
                return [];
            if (!theProject.repositories)
                return []; // special case return empty array
            let result = [];
            for (const repos of theProject.repositories) {
                result.push(repos.name);
            }
            return result;
        });
    }
    /**
     * Get the projects of the user
     * @param token the access token
     * @param userId the node_id of the user
     */
    static getProjectsOfUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            let userMongoData;
            try {
                userMongoData = yield userModel_1.UserMongo.UserMongoModel.findOne({
                    node_id: userId
                });
            }
            catch (error) {
                console.error(error);
            }
            if (!userMongoData)
                return [];
            if (!userMongoData.projects)
                return [];
            let result = [];
            for (const project of userMongoData.projects) {
                const projectObj = new Project(project._id, project.name, project.owner_id);
                result.push(projectObj);
            }
            return result;
        });
    }
    static getFromMongo(projectId) {
        return __awaiter(this, void 0, void 0, function* () {
            let theProject; // the data get from the mongoDB
            try {
                theProject = yield ProjectMongo.ProjectMongoModel.findById(projectId);
            }
            catch (error) {
                console.error("<Error> Fail to find project in the 'projects' document whose _id is " +
                    projectId, error);
            }
            // transfer mongo object data to Repository data
            const repositories = theProject.repositories.slice(0);
            const repositoryObjs = [];
            for (const repository of repositories) {
                const { repository_id, name, owner_id, description, _url } = repository;
                const repositoryObj = new repositoryModel_2.Repository(repository_id, name, owner_id, description, _url);
                repositoryObjs.push(repositoryObj);
            }
            const { id, name, owner_id, description } = theProject;
            const kanbanIds = theProject.kanbanIds.slice(0);
            const project = new Project(id, name, owner_id, description, repositoryObjs, kanbanIds);
            return project;
        });
    }
}
exports.Project = Project;
//# sourceMappingURL=projectModel.js.map