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
import { githubApiPreview } from "../remoteConnection/github/githubAPI";
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
    ownerName?: string
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

    this.columns = [];
    if (columns) {
      for (let column of columns) {
        this.columns.push(column);
      }
    }

    this.cards = [];
    if (cards) {
      for (let card of cards) {
        this.cards.push(card);
      }
    }
  }

  /**
   *
   */
  public getId(): string {
    return this.id;
  }

  /**
   *
   */
  public getName(): string {
    return this.name;
  }

  /**
   *
   * @param name
   */
  public setName(name: string): void {
    this.name = name;
  }

  /**
   *
   */
  public getState(): string {
    return this.state;
  }

  /**
   *
   */
  public open(): void {
    this.state = "open";
  }

  /**
   *
   */
  public close(): void {
    this.state = "close";
  }

  /**
   *
   */
  public getColumns(): KanbanColumn[] {
    let result: KanbanColumn[] = [];
    for (let column of this.columns) {
      result.push(column);
    }
    return result;
  }

  /**
   * Some static function
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

  /**
   * Function
   */
  public async saveToMongo() {
    // save to 'kanbans' document

    let theKanban = {
      name: this.name,
      state: this.state,
      due: this.due,
      projectId: this.projectId,
      includeIssueIds: this.includeIssueIds,
      finishedIssueIds: this.finishedIssueIds
      // need fixed later...
      // columns: [...this.columns],
      // cards: [...this.cards]
    };

    theKanban = await new KanbanMongo.KanbanMongoModel(theKanban).save(); // the kanban is the data stored in the db

    for (let col of this.columns) {
      col.setKanbanId(theKanban["id"]);
      await col.saveToMongo();
    }

    // change the 'project' document, add the kanban id to the project
    let theProject = await ProjectMongo.ProjectMongoModel.findById(
      this.projectId
    );
    if (!theProject.kanbanIds) theProject.kanbanIds = [];
    theProject.kanbanIds.push(theKanban["id"]); // push the kanban id to project document
    const saveInfoProDoc = await new ProjectMongo.ProjectMongoModel(
      theProject
    ).save();
    return [theKanban, saveInfoProDoc];
  }
}
