import { Request, Response, Application, Router } from "express";
import { Authorization } from "./../models/authorization";
import { Issue } from "../models/issueModel";
import { Project } from "../models/projectModel";
import { Card } from "../models/cardModel";

export class CardRoutes {
  private router: Router;

  constructor() {
    this.router = Router();

    this.router.get("/:name/:repos", async (req: Request, res: Response) => {
      const issues = await Issue.getAllIssues(
        req.params.name,
        req.params.repos
      );
      res.status(200).send(issues);
    });

    this.router.get(
      "/project_cards/:username/:projectId",
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

    /**
     * POST /cards/add_new_card/:kanban_id/:column_id
     *  create a new card.
     *  the request body format:
     *    {issueId, title, body, owner, repos, state, note, id?}
     */
    this.router.post(
      "/add_new_card/:kanban_id/:column_id",
      async (req: Request, res: Response) => {
        const token = req.headers.authorization;
        const {
          id,
          issueId,
          title,
          body,
          owner,
          repos,
          state,
          note,
          number
        } = req.body;
        const kanbanId = req.params.kanban_id;
        const columnId = req.params.column_id;
        let theIssue = new Issue(
          issueId,
          title,
          body,
          owner,
          repos,
          state,
          number
        );
        let theCard = new Card(theIssue, note, kanbanId, columnId, id);
        const result = await theCard.saveToMongo(token);
        res.status(200).send(result);
      }
    );

    this.router.delete(
      "/:kanban_id/:column_id/:card_id",
      async (req: Request, res: Response) => {
        const token = req.headers.authorization;
        const { kanban_id, column_id, card_id } = req.params;
        const result = await Card.deleteACard(
          kanban_id,
          column_id,
          card_id,
          token
        );
        res.status(200).send(result);
      }
    );
  }

  public routes(app: Application): void {
    app.use("/cards", this.router);
  }
}
