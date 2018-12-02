import { Request, Response, Application, Router } from "express";
import { Authorization } from "./../models/authorization";
import { Project } from "../models/projectModel";

export class ProjectRoutes {
  private router: Router;

  constructor() {
    this.router = Router();

    /**
     * POST host/project/new
     *   Create a new project
     *   Request format: {*name, *description, *repositories}
     */
    this.router.post(
      "/new",
      Authorization.authenticate,
      async (req: Request, res: Response) => {
        const token = req.headers.authorization;
        const { name, description, repositories } = req.body;
        const project = new Project(
          undefined, // the id of the project, the mongodb will assign it one ID
          name, // the name of the project
          undefined, // the owner id of the project, it will get from the access token
          description, // the description of the project
          repositories, // the repositories of the project
          [], // the kanban IDs the project has
          [] // the collaborators of the project
        );
        const theProject = await project.saveToMongo(token);
        res.status(200).send(theProject);
      }
    );

    /**
     * GET host/project/name/:projectId
     *   get the name of the project with given projectId
     */
    this.router.get("/name/:projectId", async (req: Request, res: Response) => {
      const projectId: string = req.params.projectId;
      const theProject: Project = await Project.getFromMongo(projectId);
      const projectName: string = theProject.getName();
      res.status(200).send(projectName);
    });
  }

  public routes(app: Application): void {
    app.use("/project", this.router);
  }
}
