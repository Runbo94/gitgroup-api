//-----------------------------------------------------------------------
// All of the Kanban related mongo data
//------------------------------------------------------------------------------
import * as mongoose from "mongoose";
import { KanbanColumnMongo } from "./kanbanColumnModel";
import { CardMongo } from "./cardModel";

export class KanbanMongo {
  /**
   * mongo related data: Schema and Model
   * _id: string (auto created by mongoose)
   * name: string
   * state: string
   * due: Date
   * projectId: string
   * columns: KanbanColumn[]
   * cards: Card[]
   */
  public static KanbanSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    due: {
      type: Date,
      required: true
    },
    created: {
      type: Date,
      required: true
    },
    projectId: {
      type: String,
      required: true
    },
    columns: {
      type: [KanbanColumnMongo.KanbanColumnMongoModel.schema],
      default: []
    },
    cards: {
      type: [CardMongo.CardMongoModel.schema],
      default: []
    },
    includeIssueIds: [String],
    finishedIssueIds: [String]
  });

  public static KanbanMongoModel = mongoose.model(
    "kanbans",
    KanbanMongo.KanbanSchema
  );
}

//----------------------------------------------------------------------------
// Kanban Class
//----------------------------------------------------------------------------
import { KanbanColumn } from "./kanbanColumnModel";
import { Card } from "./cardModel";
import { ProjectMongo } from "./projectModel";

export class Kanban {
  private id: string;
  private name: string;
  private state: string;
  private due: Date;
  private projectId: string;
  private columns: KanbanColumn[];
  private includeIssueIds: string[];
  private finishedIssueIds: string[];
  private cards: Card[];
  private ownerName: string;
  private created: Date;

  constructor(
    id?: string,
    name?: string,
    state?: string,
    due?: Date,
    projectId?: string,
    columns?: KanbanColumn[],
    includeIssueIds?: string[],
    finishedIssueIds?: string[],
    cards?: Card[],
    ownerName?: string,
    created?: Date
  ) {
    if (id) this.id = id;
    if (name) this.name = name;
    if (state && state !== "open" && state !== "close")
      throw new RangeError("The state is neither 'close' nor 'open'");
    this.state = state;
    if (due) this.due = due;
    if (projectId) this.projectId = projectId;
    if (includeIssueIds) this.includeIssueIds = includeIssueIds.slice(0);
    if (finishedIssueIds) this.finishedIssueIds = finishedIssueIds.slice(0);
    if (ownerName) this.ownerName = ownerName;
    if (created) this.created = created;

    if (columns) this.columns = columns.slice(0);
    if (cards) this.cards = cards.slice(0);
  }
  //--------------------------------------------------------------------------
  // Getter ana Setter Functions
  //--------------------------------------------------------------------------
  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public setName(name: string): void {
    this.name = name;
  }

  public getState(): string {
    return this.state;
  }

  public open(): void {
    this.state = "open";
  }

  public close(): void {
    this.state = "close";
  }

  public getDue(): Date {
    return this.due;
  }

  public setDue(due: Date) {
    this.due = due;
  }

  public getProjectId(): string {
    return this.projectId;
  }

  public getColumns(): KanbanColumn[] {
    return this.columns.slice(0);
  }

  public getIncludeIssueIds(): string[] {
    return this.includeIssueIds.slice(0);
  }

  public getFinishedIssueIds(): string[] {
    return this.finishedIssueIds.slice(0);
  }

  public getCards(): Card[] {
    return this.cards.slice(0);
  }

  public getOwner(): string {
    return this.ownerName;
  }

  public getCreatedDate(): Date {
    return this.created;
  }

  //------------------------------------------------------------------------------
  // Some Functions
  //------------------------------------------------------------------------------

  /**
   * Saved kanban to the MongoDB
   */
  public async saveToMongo(token: string) {
    // save to 'kanbans' document

    let theKanban = {
      name: this.name,
      state: this.state,
      due: this.due,
      created: new Date(),
      projectId: this.projectId,
      includeIssueIds: this.includeIssueIds,
      finishedIssueIds: this.finishedIssueIds
      // need fixed later...
      // columns: [...this.columns],
      // cards: [...this.cards]
    };
    try {
      theKanban = await new KanbanMongo.KanbanMongoModel(theKanban).save(); // the kanban is the data stored in the db
    } catch (error) {
      console.error(
        "<Error> Fail to save the kanban whose name is " + this.name,
        error
      );
    }

    for (let col of this.columns) {
      col.setKanbanId(theKanban["id"]);
      await col.saveToMongo(token);
    }

    // change the 'project' document, add the kanban id to the project
    let theProject;
    try {
      theProject = await ProjectMongo.ProjectMongoModel.findById(
        this.projectId
      );
    } catch (error) {
      console.error(
        "<Error> Fail to find the project in the MongoDB whose ID is " +
          this.projectId,
        error
      );
    }

    if (!theProject.kanbanIds) theProject.kanbanIds = [];
    theProject.kanbanIds.push(theKanban["id"]); // push the kanban id to project document
    let kanbanObj;
    try {
      kanbanObj = await new ProjectMongo.ProjectMongoModel(theProject).save();
    } catch (error) {
      console.error("<Error> Fail to saved the kanban whose id is ", error);
    }
    return [theKanban, kanbanObj];
  }

  //------------------------------------------------------------------------------------
  // Some Static Functions
  //------------------------------------------------------------------------------------

  /**
   * get the kanbans of the project with given project ID
   * @param projectId
   */
  public static async getAllKanbansOfProject(projectId: string) {
    const theProject = await ProjectMongo.ProjectMongoModel.findById(projectId);
    const kanbanIds = theProject.kanbanIds;
    const kanbans = [];
    for (const kanbanId of kanbanIds) {
      const theKanban = await KanbanMongo.KanbanMongoModel.findById(kanbanId);
      kanbans.push(theKanban);
    }
    return kanbans;
  }

  public static async getKanbanById(kanbanId: string) {
    const theKanban = await KanbanMongo.KanbanMongoModel.findById(kanbanId);
    return theKanban;
  }

  public static async newGetKanbanById(kanbanId: string): Promise<Kanban> {
    let theKanban;
    try {
      theKanban = await KanbanMongo.KanbanMongoModel.findById(kanbanId);
    } catch (error) {
      console.error(
        "<Error> Fail to get Kanban from MongoDB whose id is " + kanbanId,
        error
      );
    }

    const { id, name, state, created, due, projectId } = theKanban;
    const includeIssueIds = theKanban.includeIssueIds.slice(0);
    const finishedIssueIds = theKanban.finishedIssueIds.slice(0);

    const kanban = new Kanban(
      id,
      name,
      state,
      due,
      projectId,
      undefined,
      includeIssueIds,
      finishedIssueIds
    );
    return kanban;
  }
}
