import { githubApiPreview, github } from "../remoteConnection/github/githubAPI";

export class Issue {
  private issueId: string;
  private owner: string;
  private repos: string;
  private title: string;
  private body: string;
  private state: string;
  private number: number; // used for access github api

  /**
   * The Issue Constructor
   * @param id the issue ID
   * @param title the title of the issue
   * @param body the text body of the issue
   * @param state the state of the issue: open or close
   * @param repos the repository name which the issue belongs to
   * @param state the state of the repository
   * @param number the number of the repository
   */
  public constructor(
    id?: string, // the issue ID
    title?: string,
    body?: string,
    owner?: string,
    repos?: string,
    state?: string,
    number?: number
  ) {
    this.issueId = id;
    this.title = title;
    this.body = body;
    this.owner = owner;
    this.repos = repos;
    if (state && state !== "close" && state !== "open")
      throw new RangeError("State must be 'close' or 'open'.");
    this.state = state;
    this.number = number;
  }

  //----------------------------------------------------------------------------
  // Getter and Setter Functions
  //----------------------------------------------------------------------------
  public getIssueId(): string {
    return this.issueId;
  }

  public getTitle(): string {
    return this.title;
  }

  public setTitle(title: string): void {
    this.title = title;
    //TODO: Set title in the github
  }

  public getBody(): string {
    return this.body;
  }

  public setBody(body: string): void {
    this.body = body;
    //TODO: Set body in the github
  }

  public getOwner(): string {
    return this.owner;
  }

  public getRepos(): string {
    return this.repos;
  }

  public getState(): string {
    return this.state;
  }

  public getNumber(): number {
    return this.number;
  }

  /**
   * Close the issue
   *  *must have owner, repos, number fields
   */
  public async close(token): Promise<any> {
    this.state = "close";
    return (await github(token).patch(
      `/repos/${this.owner}/${this.repos}/issues/${this.number}`,
      {
        state: "closed"
      }
    )).data;
  }

  /**
   * Open the issue
   */
  public async open(token): Promise<any> {
    this.state = "open";
    return (await github(token).patch(
      `/repos/${this.owner}/${this.repos}/issues/${this.number}`,
      {
        state: "open"
      }
    )).data;
  }

  // /*
  //  * save the issue to the GitHub.
  //  */
  // public async save(): Promise<any> {
  //   const post = {
  //     title: this.title,
  //     body: this.body
  //   };
  //   let result: any;
  //   try {
  //     result = await githubApiPreview.post(
  //       `/repos/${this.owner}/${this.repos}/issues`,
  //       post
  //     );
  //     this.issueId = result.data.node_id;
  //   } catch (error) {
  //     throw error;
  //   }
  //   return result;
  // }

  //-------------------------------------------------------------------------
  // Static methods
  //-------------------------------------------------------------------------

  /*
   * Get all issues for specific user and his repository
   * @param username
   * @param reposName
   */
  public static async getAllIssues(
    username: string,
    reposName: string
  ): Promise<any[]> {
    const theIssues: any = (await githubApiPreview.get(
      `/repos/${username}/${reposName}/issues`
    )).data;
    if (!theIssues) return theIssues;
    let issues: Issue[] = [];
    for (let data of theIssues) {
      const reposUrl: string = data.repository_url;
      const repos: string = reposUrl.split("/").pop();
      const issueObj = new Issue(
        data.node_id,
        data.title,
        data.body,
        data.user.login,
        repos,
        data.state,
        data.number
      );
      issues.push(issueObj);
    }
    return issues;
  }

  /**
   * get the Issue Object from github api
   * @param username the name of user
   * @param reposName the name of repos
   * @param issueId the id of issue
   */
  public static async getIssue(
    username: string,
    reposName: string,
    issueId: string
  ): Promise<any> {
    const theIssues: any = (await githubApiPreview.get(
      `/repos/${username}/${reposName}/issues`
    )).data;
    if (!theIssues) return theIssues;

    let theIssue = theIssues.find(issue => issue.node_id === issueId);
    const reposUrl: string = theIssue.repository_url;
    const repos: string = reposUrl.split("/").pop();
    const issueObj = new Issue(
      theIssue.node_id,
      theIssue.title,
      theIssue.body,
      theIssue.user.login,
      repos,
      theIssue.state,
      theIssue.number
    );
    return issueObj;
  }
}
