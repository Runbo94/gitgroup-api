//-----------------------------------------------------------------
// Mongoose Related Data
//-----------------------------------------------------------------
import * as mongoose from "mongoose";
export class CardMongo {
  public static CardSchema = new mongoose.Schema({
    issue_id: String,
    title: {
      type: String,
      required: true
    },
    body: String,
    owner: {
      type: String,
      required: true
    },
    repos: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    note: String,
    kanbanId: {
      type: String,
      required: true
    },
    columnId: {
      type: String,
      required: true
    },
    number: {
      type: Number,
      required: true
    }
  });

  public static CardMongoModel = mongoose.model("cards", CardMongo.CardSchema);
}

//-----------------------------------------------------------------------------------
// Card(class)
//-----------------------------------------------------------------------------------
import { Issue } from "./issueModel";
import { KanbanMongo } from "./kanbanModel";

export class Card extends Issue {
  private note: string;
  private kanbanId: string;
  private columnId: string;
  private id: string;

  /**
   * Constructor function
   * @param issue the issue which the card represents
   * @param note the note of the card
   * @param kanbanId the kanban ID which the card belongs to
   * @param columnId the column ID which the card belongs to
   * @param id the mongo id of the card
   */
  constructor(
    issue: Issue,
    note: string,
    kanbanId: string,
    columnId: string,
    id?: string
  ) {
    super(
      issue.getIssueId(),
      issue.getTitle(),
      issue.getBody(),
      issue.getOwner(),
      issue.getRepos(),
      issue.getState(),
      issue.getNumber()
    );
    this.note = note;
    if (kanbanId) this.kanbanId = kanbanId;
    if (columnId) this.columnId = columnId;
    else this.columnId = "0"; // the default value of the column name is 'To Do'
    if (id) this.id = id;
  }

  //--------------------------------------------------------------------------
  // Getter and Setter Functions
  //--------------------------------------------------------------------------
  public getNote(): string {
    return this.note;
  }

  public setNote(note: string): void {
    this.note = note;
  }

  public getColumnId(): string {
    return this.columnId;
  }

  public setColumnId(columnId: string): void {
    this.columnId = columnId;
  }

  public getId(): string {
    return this.id;
  }

  //---------------------------------------------------------------------------
  // Some Functions
  //---------------------------------------------------------------------------

  public toCardObject(): any {
    return {
      issue_id: this.getIssueId(),
      title: this.getTitle(),
      body: this.getBody(),
      number: this.getNumber(),
      owner: this.getOwner(),
      repos: this.getRepos(),
      state: this.getState(),
      note: this.note,
      kanbanId: this.kanbanId,
      columnId: this.columnId
    };
  }

  public async logFinish() {}

  public async logCreate() {}

  /**
   * save the card
   * @param token used to save issue when the card save to done column
   */
  public async saveToMongo(token?: string) {
    // create a new mongo ID
    const theId = this.id
      ? mongoose.Types.ObjectId(this.id)
      : mongoose.Types.ObjectId();
    // the object saved to mongoDB
    const theCard = {
      _id: theId,
      issue_id: this.getIssueId(),
      number: this.getNumber(),
      title: this.getTitle(),
      body: this.getBody(),
      owner: this.getOwner(),
      repos: this.getRepos(),
      state: this.getState(),
      note: this.note,
      kanbanId: this.kanbanId,
      columnId: this.columnId
    };

    let theKanban;
    try {
      theKanban = await KanbanMongo.KanbanMongoModel.findById(this.kanbanId);
    } catch (error) {
      console.error(
        "<Error> Fail to get the kanban from the MongoDB whose ID is" +
          this.kanbanId,
        error
      );
    }

    // get the column
    const theColumn = theKanban.columns.id(this.columnId);
    // if add the new card to the 'Done' column
    if (theColumn.name === "Done") {
      // close the issue
      const theIssue = await Issue.getIssue(
        this.getOwner(),
        this.getRepos(),
        this.getIssueId()
      );

      await theIssue.close(token);
      // delete it(issueId) from includeIssueIds in the Kanban
      if (theKanban.includeIssueIds.includes(this.getIssueId()))
        theKanban.includeIssueIds = theKanban.includeIssueIds.filter(
          id => id !== this.getIssueId()
        );
      // add it(issueId) to finishedIssueIds in the Kanban
      if (!theKanban.finishedIssueIds) theKanban.finishedIssueIds = [];
      if (!theKanban.finishedIssueIds.includes(theCard.issue_id))
        theKanban.finishedIssueIds.push(theCard.issue_id);
    } else {
      // if save to the column except the 'DONE' column, add the card to the "includeIssueIds"
      if (!theKanban.includeIssueIds) theKanban.includeIssueIds = [];
      if (!theKanban.includeIssueIds.includes(theCard.issue_id))
        theKanban.includeIssueIds.push(theCard.issue_id);
    }

    // add it to the column
    if (
      !theKanban.columns
        .id(this.columnId)
        .cards.find(card => card._id === theCard._id)
    ) {
      theKanban.columns.id(this.columnId).cards.push(theCard);
    }

    try {
      await theKanban.save();
    } catch (error) {
      console.error(
        "<Error> Fail to save the kanban to the MongoDB whose id is " + theId,
        error
      );
    }
    return theCard;
  }

  // /**
  //  * save the card
  //  * @returns the result of the save
  //  */
  // public async save(): Promise<any> {
  //   const post: any = {
  //     note: this.note,
  //     content_id: this.getIssueId(),
  //     content_type: "Issue" // future change: there may be another choice - PullRequest
  //   };
  //   const result = await githubApiPreview.post(
  //     `/projects/columns/cards/${this.columnId}`,
  //     post
  //   );
  //   return result;
  // }

  //--------------------------------------------------------------------------------------
  // Some Static Functions
  //--------------------------------------------------------------------------------------

  public static async deleteACard(
    kanbanId: string,
    columnId: string,
    cardId: string,
    token: string
  ) {
    let theKanban;
    try {
      theKanban = await KanbanMongo.KanbanMongoModel.findById(kanbanId);
    } catch (error) {
      console.error(
        "<Error> Fail to get the kanban from the MongoDB whose id is " +
          kanbanId,
        error
      );
    }

    // delete the card from the column
    const deletedCard = theKanban.columns.id(columnId).cards.id(cardId);
    deletedCard.remove();

    // get the column
    const column = await theKanban.columns.id(columnId);
    // if remove the card from "Done" column
    const { issue_id, number, owner, repos } = deletedCard;
    const theIssue = new Issue(
      issue_id,
      undefined,
      undefined,
      owner,
      repos,
      undefined,
      number
    );

    if (column.name === "Done") {
      // open the issue
      await theIssue.open(token);
      // remove it(issueId) from finishedIssueIds in the Kanban
      if (theKanban.finishedIssueIds.includes(issue_id))
        theKanban.finishedIssueIds = theKanban.finishedIssueIds.filter(
          id => id !== issue_id
        );
    } else {
      if (theKanban.includeIssueIds.includes(issue_id))
        theKanban.includeIssueIds = theKanban.includeIssueIds.filter(
          id => id !== issue_id
        );
    }

    theKanban.save();
    return deletedCard;
  }

  public static async getCardById(
    kanbanId: string,
    columnId: string,
    cardId: string
  ): Promise<Card> {
    let theKanban;
    try {
      theKanban = await KanbanMongo.KanbanMongoModel.findById(kanbanId);
    } catch (error) {
      console.error(
        "<Error> Fail to find the kanban in the MongoDB whose id is " +
          kanbanId,
        error
      );
    }
    const theCard = theKanban.columns.id(columnId).cards.id(cardId);
    const {
      issue_id,
      title,
      body,
      owner,
      repos,
      state,
      note,
      number
    } = theCard;
    const issue = new Issue(issue_id, title, body, owner, repos, state, number);
    const card = new Card(issue, note, kanbanId, columnId, cardId);
    return card;
  }

  // public static async getAllIssueCardsAndSaveToBackLog(kanbanId: string) {
  //   // according to the kanban id, get the project id
  //   const theKanban = await KanbanMongo.KanbanMongoModel.findById(kanbanId);
  //   const projectId = theKanban.projectId;

  //   // according to the project id, get the repositories[{_id, repository_id, name, owner_id, description, _url}]
  //   const theProject = await ProjectMongo.ProjectMongoModel.findById(projectId);
  //   const allRepositories = theProject.repositories;

  //   // get all the issues
  //   let issues: Issue[] = [];
  //   for (const repository of allRepositories) {
  //     const issuesOfRepos = await Issue.getAllIssues(
  //       repository.owner_id,
  //       repository.name
  //     );
  //     issues.push(...issuesOfRepos);
  //   }

  //   // transfer issues to cards
  //   let cards: Card[] = [];
  //   for (const issue of issues) {
  //     const card = new Card(issue, "", kanbanId, "");
  //     cards.push(card);
  //   }

  //   // create a new back log column to the kanban
  //   const theKanbanColumn = new KanbanColumn(kanbanId, "BackLog", cards);
  //   const result = await theKanbanColumn.saveToMongo();
  //   return result;
  // }
}
