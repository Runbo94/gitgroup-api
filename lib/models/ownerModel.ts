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

  public static async getOwnerFromGithub(token: string): Promise<Owner> {
    let theUser;

    try {
      theUser = (await github(token).get("/user")).data;
    } catch (error) {
      console.error("<Error> Fail to get the user from the GitHub API.", error);
    }

    const projects = await Project.getProjectsOfUser(theUser.node_id);

    const repositories = await Repository.getRepositoriesFromGithub(token);

    const owner = new Owner(
      theUser.node_id,
      theUser.login,
      projects,
      repositories
    );
    return owner;
  }
}
