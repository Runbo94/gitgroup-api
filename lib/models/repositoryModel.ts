//-------------------------------------------------------------------
// Mongoose related data
//-------------------------------------------------------------------
import * as mongoose from "mongoose";
export class RepositoryMongo {
  public static RepositorySchema = new mongoose.Schema({
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

  public static RepositoryMongoModel = mongoose.model(
    "repositories",
    RepositoryMongo.RepositorySchema
  );
}

//-------------------------------------------------------------------------
// Repository(class)
//-------------------------------------------------------------------------
import { Request } from "express";
import { Issue } from "./issueModel";
import { Kanban } from "./kanbanModel";
import { Collaborator } from "./collaboratorModel";
import { github } from "../remoteConnection/github/githubAPI";

export class Repository {
  private repository_id: string; // the GitHub node_id of the repository
  private name: string; // the name of the repository
  private owner_id: string; // owner id
  private description: string; // the description of the repository
  private _url: string; // the github url of the repository

  private issues: Issue[]; // can get it using 'owner' and 'name' /repos/{owner}/{name}/issues
  private kanbans: Kanban[];
  private collaborators: Collaborator[];
  constructor(
    repository_id?: string,
    name?: string,
    owner?: string,
    description?: string,
    url?: string,
    issues?: Issue[],
    collaborators?: Collaborator[]
  ) {
    this.repository_id = repository_id;
    this.name = name;
    this.owner_id = owner;
    this.description = description;
    this._url = url;
    if (issues) this.issues = issues.slice(0);
    if (collaborators) this.collaborators = collaborators.slice(0);
  }

  //------------------------------------------------------------------------------
  // Getter and Setter Function
  //-------------------------------------------------------------------------------

  public getId(): string {
    return this.repository_id;
  }

  public getName(): string {
    return this.name;
  }

  public setName(name: string): void {
    this.name = name;
    //TODO: Set the name of repository in the GitHub
  }

  public getOwner(): string {
    return this.owner_id;
  }

  public getDescription(): string {
    return this.description;
  }

  public setDescription(description: string): void {
    this.description = description;
    //TODO: Set the description of repository in the GitHub
  }

  public get url(): string {
    return this._url;
  }

  public set url(value: string) {
    this._url = value;
  }

  public getIssues(): Issue[] {
    const issues: Issue[] = this.issues.slice(0);
    return issues;
  }

  public getCollaborators(): Collaborator[] {
    const collaborators: Collaborator[] = this.collaborators.slice(0);
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
  public static async getRepositoriesFromGithub(
    token: string
  ): Promise<Repository[]> {
    let theRepositories: {
      owner: { login: string };
      name: string;
      node_id: string;
      description: string;
      html_url: string;
    }[];

    // get the repository data from the github
    try {
      theRepositories = (await github(token).get("/user/repos", {
        params: {
          type: "owner"
        }
      })).data;
    } catch (error) {
      console.error(
        "<Error> Fail to get the user repository data from the GitHub API.",
        error
      );
    }

    let repositoryObjs: Repository[] = [];
    for (let theRepository of theRepositories) {
      const issues: Issue[] = await Issue.getAllIssues(
        theRepository.owner.login,
        theRepository.name
      );

      repositoryObjs.push(
        new Repository(
          theRepository.node_id,
          theRepository.name,
          theRepository.owner.login,
          theRepository.description,
          theRepository.html_url,
          issues
        )
      );
    }
    return repositoryObjs;
  }

  // /**
  //  * Get all the repositories of owener from Github
  //  * @param {Request} req - the user request including the auth header
  //  * @returns {Promise<any>} if success, return Promise<Repository> , else, return Promise<any>
  //  */
  // public static async getReposOfOwner(req: Request): Promise<Repository[]> {
  //   let reposDatas: any;
  //   let reposes: Repository[] = [];
  //   const token = req.headers.authorization;
  //   reposDatas = await github(token).get("/user/repos", {
  //     params: {
  //       type: "owner"
  //     }
  //   });
  //   for (let data of reposDatas.data) {
  //     const issues = await Issue.getAllIssues(data.owner.login, data.name);
  //     reposes.push(
  //       new Repository(
  //         data.node_id,
  //         data.name,
  //         data.owner.login,
  //         data.description,
  //         data.html_url,
  //         issues
  //       )
  //     );
  //   }
  //   return reposes;
  // }
}
