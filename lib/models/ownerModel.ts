import { Request } from "express";
import { User } from "./userModel";
import { Project } from "./projectModel";
import { github } from "../remoteConnection/github/githubAPI";
import { Repository } from "./repositoryModel";

export class Owner extends User {
  private projects: Project[];

  public constructor(
    id?: string,
    name?: string,
    projects?: Project[],
    repositories?: Repository[]
  ) {
    super(
      id ? id : undefined,
      name ? name : undefined,
      repositories ? repositories : undefined
    );
    if (projects) this.projects = projects.slice(0);
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

  public static async getOwner(req: Request): Promise<Owner> {
    const token = req.headers.authorization;
    const githubRes = await github(token).get("/user");
    const data = githubRes.data;

    const projects = await Project.getProjectsOfUser(data.node_id);

    const repositories = await Repository.getRepositoriesFromGithub(token);

    const owner = new Owner(data.node_id, data.login, projects, repositories);
    return owner;
  }
}
