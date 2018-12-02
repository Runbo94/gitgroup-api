import { Request, Response, Application, Router } from "express";
import { Authorization } from "./../models/authorization";
import { Issue } from "../models/issueModel";
import { Project } from "../models/projectModel";

export class IssueRoutes {
  private router: Router;

  constructor() {
    this.router = Router();

    /**
     * get all issue of the repository
     */
    this.router.get("/:name/:repos", async (req: Request, res: Response) => {
      const issues = await Issue.getAllIssues(
        req.params.name,
        req.params.repos
      );
      res.status(200).send(issues);
    });

    /**
     * get all issues of the given project
     */
    this.router.get(
      "/project_issues/:username/:projectId",
      async (req: Request, res: Response) => {
        const reposNames: string[] = await Project.getReposNamesOfProject(
          req.params.projectId
        );
        const result: Issue[] = [];
        for (let reposName of reposNames) {
          const issues: Issue[] = await Issue.getAllIssues(
            req.params.username,
            reposName
          );
          result.push(...issues);
        }
        res.status(200).send(result);
      }
    );

    /** close the issue */
    this.router.get(
      "/close/:userName/:reposName/:issueId",
      async (req: Request, res: Response) => {
        const { userName, reposName, issueId } = req.params;
        const token = req.headers.authorization;
        const theIssue = await Issue.getIssue(userName, reposName, issueId);
        const result = await theIssue.close(token);
        res.status(200).send(result);
      }
    );
  }

  public routes(app: Application): void {
    app.use("/issues", this.router);
  }
}
