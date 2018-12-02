//-------------------------------------------------------------------------
// Mongoose Related Data
//-------------------------------------------------------------------------
import * as mongoose from "mongoose";
import { RepositoryMongo } from "./repositoryModel";
import { ProjectMongo } from "./projectModel";

export class UserMongo {
  public static userSchema = new mongoose.Schema({
    node_id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    projects: [ProjectMongo.ProjectMongoModel.schema],
    repository: [RepositoryMongo.RepositoryMongoModel.schema]
  });

  public static UserMongoModel = mongoose.model("users", UserMongo.userSchema);
}

//-------------------------------------------------------------------------------
// User(class)
//-------------------------------------------------------------------------------
import { Request } from "express";
import { github } from "../remoteConnection/github/githubAPI";
import { Repository } from "./repositoryModel";

/**
 * User Class
 * @author Runbo Zhao
 */
export class User {
  private id: string; // the github node_id of the user
  private name: string; // the name of the user
  private repositories: Repository[]; // the repositories the user has

  constructor(id?: string, name?: string, repositories?: Repository[]) {
    if (id) this.id = id;
    if (name) this.name = name;
    if (repositories) this.repositories = repositories.slice(0);
  }

  //------------------------------------------------------------
  // Getter and Setter Functions
  //------------------------------------------------------------
  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getRepositories(): Repository[] {
    return this.repositories;
  }

  //------------------------------------------------------------------
  // Some Functions
  //------------------------------------------------------------------

  //------------------------------------------------------------------
  // Some Static Functions
  //------------------------------------------------------------------

  public static async getUserFromGithb(token: string): Promise<User> {
    let theUser: { node_id: string; login: string };
    try {
      theUser = (await github(token).get("/user")).data;
    } catch (error) {
      console.error("<Error> Fail to get the user from GitHub.", error);
    }
    const user = new User(theUser.node_id, theUser.login);
    return user;
  }

  // public static async saveUserToMongo(req: Request): Promise<any> {
  //   const token = req.headers.authorization;
  //   const githubRes = await github(token).get("/user");
  //   const data = githubRes.data;
  //   const userMongo = new User.UserMongoModel({
  //     node_id: data.node_id,
  //     name: data.login
  //   });
  //   const result = await userMongo.save();
  //   return result;
  // }
}
