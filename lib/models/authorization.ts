import { Response, Request } from "express";
import * as config from "config";
import {
  githubAuthUrl,
  github,
  githubGetTokenApi
} from "../remoteConnection/github/githubAPI";

export class Authorization {
  private client_id: string;
  private client_secret: string;
  private githubAuthUrl: string;
  private scope: string;

  constructor() {
    this.client_id = config.get("github.client_id");
    this.client_secret = config.get("github.client_secret");
    this.scope = config.get("github.scope");
    this.githubAuthUrl = githubAuthUrl;
  }

  public getClientId(): string {
    return this.client_id;
  }

  public getScope(): string {
    return this.scope;
  }

  public getGithubAuthUrl(): string {
    return this.githubAuthUrl;
  }

  public async getToken(code: string): Promise<any> {
    const res = await githubGetTokenApi.post("/", {
      client_id: this.client_id,
      client_secret: this.client_secret,
      code: code
    });
    return res;
  }

  /**
   * Check the user provided access_token whether is valid or not
   * @param {string} token the user provided token
   */
  public static async isValidToken(token): Promise<boolean> {
    let result: boolean = false;
    let res;
    if (!token) return result; // if no token, return false immediately
    try {
      res = await github(token).get("/user");
    } catch (error) {
      return result; // if the request fails, return false
    }
    if (res.data.login && typeof res.data.login === "string") {
      result = true;
    }
    return result;
  }

  public static async authenticate(req: Request, res: Response, next) {
    const auth_token = req.headers.authorization;
    const isValid = await Authorization.isValidToken(auth_token);
    if (!isValid) {
      return res.status(403).json({ error: "Invalid credentials!" });
    }
    next();
  }
}
