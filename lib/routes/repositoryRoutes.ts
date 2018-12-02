import { Application, Request, Response, Router } from "express";
import { Repository } from "./../models/repositoryModel";
import { Authorization } from "./../models/authorization";

export class RepositoryRoutes {
  private router: Router;
  constructor() {
    this.router = Router();

    /**
     * GET /repos - get all repository
     */
    this.router.get(
      "/",
      Authorization.authenticate,
      async (req: Request, res: Response) => {
        const token: string = req.headers.authorization;
        const reposes: Repository[] = await Repository.getRepositoriesFromGithub(
          token
        );
        res.status(200).send(reposes);
      }
    );
  }
  public routes(app: Application): void {
    app.use("/repos", this.router);
  }
}
