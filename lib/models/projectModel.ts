//----------------------------------------------------------------------------
// Project(Mongo)
//----------------------------------------------------------------------------
import * as mongoose from "mongoose";
import { RepositoryMongo } from "./repositoryModel";

export class ProjectMongo {
  public static ProjectSchema = new mongoose.Schema({
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
    repositories: [RepositoryMongo.RepositoryMongoModel.schema],
    kanbanIds: {
      type: [String],
      default: []
    }
  });

  public static ProjectMongoModel = mongoose.model(
    "projects",
    ProjectMongo.ProjectSchema
  );
}

//--------------------------------------------------------------------------
// Project(Class)
//--------------------------------------------------------------------------

import { Request } from "express";
import { Repository } from "./repositoryModel";
import { Collaborator } from "./collaboratorModel";
import { User, UserMongo } from "./userModel";

export class Project {
  private id: string; // the id project id stored in the mongo db
  private name: string; // the name of the project
  private ownerId: string; // the owner ID of the project
  private description: string; // the description of the project
  private repositories: Repository[]; // all the repositories the project has
  private kanbanIds: string[]; // all the kanban ID the project has
  private collaborators: Collaborator[]; // all the collaborator of the project

  constructor(
    id?: string,
    name?: string,
    ownerId?: string,
    description?: string,
    repositories?: Repository[],
    kanbanIds?: string[],
    collaborators?: Collaborator[]
  ) {
    if (id) this.id = id;
    if (name) this.name = name;
    if (ownerId) this.ownerId = ownerId;
    if (description) this.description = description;
    if (repositories) this.repositories = repositories.slice(0);
    if (kanbanIds) this.kanbanIds = kanbanIds.slice(0);
    if (collaborators) this.collaborators = collaborators.slice(0);
  }

  //----------------------------------------------------------------
  // getter and setter function
  //----------------------------------------------------------------

  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public setName(name: string): void {
    this.name = name;
  }

  public getOwnerId(): string {
    return this.ownerId;
  }

  public getDescription(): string {
    return this.description;
  }

  public setDescription(description: string): void {
    this.description = description;
  }

  public getRepositories(): Repository[] {
    return this.repositories.slice(0);
  }

  public setRepositories(repositories: Repository[]): void {
    this.repositories = repositories.slice(0);
  }

  public getKanbanIds(): string[] {
    return this.kanbanIds.slice(0);
  }

  public setKanbanIds(kanbanIds: string[]): void {
    this.kanbanIds = kanbanIds.slice(0);
  }

  public getCollaborators(): Collaborator[] {
    return this.collaborators.slice(0);
  }

  public setCollaborators(collaborator: Collaborator[]) {
    this.collaborators = collaborator.slice(0);
  }

  //------------------------------------------------------------------------
  // All Functions
  //------------------------------------------------------------------------

  /**
   * save the project object to the MongoDB
   * @param req - the http request which contains the access token in its header
   */
  public async saveToMongo(token: string): Promise<Object> {
    const user: User = await User.getUserFromGithb(token);
    this.ownerId = user.getId(); // get the owner ID from the access token
    const theId = this.id
      ? mongoose.Types.ObjectId(this.id)
      : mongoose.Types.ObjectId(); // set the id if the this.id is undefined

    let project: Object = {
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
      await projectMongo.save();
      this.id = theId;
    } catch (error) {
      console.error("<Error> Fail to save the project to mongoDB.", error);
    }

    /** saved it as a sub-document under the user document */
    // get user from mongo db
    let theUser;
    try {
      theUser = await UserMongo.UserMongoModel.findOne({
        node_id: this.ownerId
      });
    } catch (error) {
      console.error(
        "<Error> Fail to get the user from the mongoDB whose the node_id is " +
          this.ownerId,
        error
      );
    }

    // the the user not exist in the mongodb create a new user in the mongoDB
    try {
      if (!theUser) {
        const userMongo = new UserMongo.UserMongoModel({
          node_id: this.ownerId,
          name: user.getName()
        });
        theUser = await userMongo.save();
      }
    } catch (error) {
      console.error(
        "<Error> Fail to create a new user in the mongoDB whose GitHub node_id is " +
          this.ownerId,
        error
      );
    }

    // add the project to user
    if (!theUser.projects) {
      theUser.projects = [project]; // if there is no projects key in the user, create an empty array
    } else {
      theUser.projects.push(project);
    }

    let result;
    try {
      result = await theUser.save();
    } catch (error) {
      console.error(
        "<Error> Fail to save the user in the document when push a new project in the user.",
        error
      );
    }

    return result;
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

  public static async getReposNamesOfProject(
    projectId: string
  ): Promise<Object[]> {
    let theProject;
    try {
      theProject = await ProjectMongo.ProjectMongoModel.findById(projectId);
    } catch (error) {
      console.error(
        "<Error> Fail to find the project in the mongoDB whose _id is " +
          projectId,
        error
      );
    }
    if (!theProject) return [];
    if (!theProject.repositories) return []; // special case return empty array

    let result: string[] = [];
    for (const repos of theProject.repositories) {
      result.push(repos.name);
    }
    return result;
  }

  /**
   * Get the projects of the user
   * @param token the access token
   * @param userId the node_id of the user
   */
  public static async getProjectsOfUser(userId: string): Promise<Project[]> {
    let userMongoData;
    try {
      userMongoData = await UserMongo.UserMongoModel.findOne({
        node_id: userId
      });
    } catch (error) {
      console.error(error);
    }
    if (!userMongoData) return [];
    if (!userMongoData.projects) return [];
    let result: Project[] = [];
    for (const project of userMongoData.projects) {
      const projectObj: Project = new Project(
        project._id,
        project.name,
        project.owner_id
      );
      result.push(projectObj);
    }
    return result;
  }

  public static async getFromMongo(projectId: string): Promise<Project> {
    let theProject: {
      id;
      name: string;
      owner_id: string;
      description: string;
      repositories: {
        id;
        repository_id: string;
        name: string;
        owner_id: string;
        description: string;
        _url: string;
      }[];
      kanbanIds: string[];
    }; // the data get from the mongoDB
    try {
      theProject = await ProjectMongo.ProjectMongoModel.findById(projectId);
    } catch (error) {
      console.error(
        "<Error> Fail to find project in the 'projects' document whose _id is " +
          projectId,
        error
      );
    }
    // transfer mongo object data to Repository data
    const repositories: {
      id;
      repository_id: string;
      name: string;
      owner_id: string;
      description: string;
      _url: string;
    }[] = theProject.repositories.slice(0);
    const repositoryObjs: Repository[] = [];
    for (const repository of repositories) {
      const { repository_id, name, owner_id, description, _url } = repository;
      const repositoryObj: Repository = new Repository(
        repository_id,
        name,
        owner_id,
        description,
        _url
      );
      repositoryObjs.push(repositoryObj);
    }

    const { id, name, owner_id, description } = theProject;
    const kanbanIds: string[] = theProject.kanbanIds.slice(0);
    const project: Project = new Project(
      id,
      name,
      owner_id,
      description,
      repositoryObjs,
      kanbanIds
    );
    return project;
  }
}
