import { Application, Request, Response, Router } from "express";
import { Kanban } from "../models/kanbanModel";
import { KanbanColumn } from "../models/kanbanColumnModel";
export class KanbanRoutes {
  private router: Router;

  constructor() {
    this.router = Router();

    /**
     * POST /kanban/new - create a new kanban
     * receive:
     * {
     *  name*: kanbanName,
     *  state: default close,
     *  due*: kanban due day
     *  projectId*: the project id which the kanban belongs to
     *  columns:
     *  cards:
     * }
     */
    this.router.post("/new", async (req: Request, res: Response) => {
      let { name, due, projectId, columns } = req.body;

      // create column
      if (!columns) {
        const toDoCol = new KanbanColumn(undefined, "To Do");
        const inCol = new KanbanColumn(undefined, "In Progress");
        const reviewCol = new KanbanColumn(undefined, "In Review");
        const doneCol = new KanbanColumn(undefined, "Done");
        columns = [toDoCol, inCol, reviewCol, doneCol];
      }
      // create new Kanban object
      const theKanban = new Kanban(
        undefined,
        name,
        "open",
        due,
        projectId,
        columns,
        [],
        [],
        []
      );
      const savedKanban = await theKanban.saveToMongo();
      res.status(200).send(savedKanban);
    });

    /**
     * get all kanbans for a project
     */
    this.router.get("/:projectId", async (req: Request, res: Response) => {
      const kanbans = await Kanban.getAllKanbansOfProject(req.params.projectId);
      res.status(200).send(kanbans);
    });

    /** according to the kanban id, get the kanban */
    this.router.get(
      "/kanban_id/:kanbanId",
      async (req: Request, res: Response) => {
        const theKanban = await Kanban.getKanbanById(req.params.kanbanId);
        res.status(200).send(theKanban);
      }
    );

    /** get a kanban column */
    this.router.get(
      "/column/:kanbanId/:columnId",
      async (req: Request, res: Response) => {
        const { kanbanId, columnId } = req.params;
        const theColumn = await KanbanColumn.getColumn(kanbanId, columnId);
        res.status(200).send(theColumn);
      }
    );
  }

  /**
   * Bound all the routes
   * @param app express application
   */
  public routes(app: Application) {
    app.use("/kanban", this.router);
  }
}
