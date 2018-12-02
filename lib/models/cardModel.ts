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
import { Issue } from "./issueModel";
import { githubApiPreview } from "../remoteConnection/github/githubAPI";
import { KanbanMongo, Kanban } from "./kanbanModel";
import { ProjectMongo } from "./projectModel";
import { KanbanColumn } from "./kanbanColumnModel";

export class Card extends Issue {
  private note: string;
  private kanbanId: string;
  private columnId: string;
  private id: string;

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

  /**
   * get the note
   * @returns the note of the card
   */
  public getNote(): string {
    return this.note;
  }

  /**
   * change the note of the card
   * @param note set the note of the card
   */
  public setNote(note: string): void {
    this.note = note;
  }

  /**
   * @returns get the column id the card belongs to
   */
  public getColId(): string {
    return this.columnId;
  }

  public toCardOject(): any {
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

  /**
   * save the card
   * @param token used to save issue when the card save to done column
   */
  public async saveToMongo(token?: string) {
    const theId = this.id
      ? mongoose.Types.ObjectId(this.id)
      : mongoose.Types.ObjectId();
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

    let theKanban = await KanbanMongo.KanbanMongoModel.findById(this.kanbanId);

    // get the column
    const theColumn = await KanbanColumn.getColumn(
      this.kanbanId,
      this.columnId
    );
    // if add the new card to the 'Done' column
    if (theColumn.name === "Done") {
      // TODO: close the issue
      const theIssue = await Issue.getIssue(
        this.getOwner(),
        this.getRepos(),
        this.getIssueId()
      );
      try {
        const closeReturn = await theIssue.close(token);
      } catch (error) {
        console.log(error);
      }
      // TODO: delete it(issueId) from includeIssueIds in the Kanban
      if (theKanban.includeIssueIds.includes(this.getIssueId()))
        theKanban.includeIssueIds = theKanban.includeIssueIds.filter(
          id => id !== this.getIssueId()
        );
      // TODO: add it(issueId) to finishedIssueIds in the Kanban
      if (!theKanban.finishedIssueIds) theKanban.finishedIssueIds = [];
      if (!theKanban.finishedIssueIds.includes(theCard.issue_id))
        theKanban.finishedIssueIds.push(theCard.issue_id);
    } else {
      if (!theKanban.includeIssueIds) theKanban.includeIssueIds = [];
      if (!theKanban.includeIssueIds.includes(theCard.issue_id))
        theKanban.includeIssueIds.push(theCard.issue_id);
    }

    if (
      !theKanban.columns
        .id(this.columnId)
        .cards.find(card => card._id === theCard._id)
    ) {
      theKanban.columns.id(this.columnId).cards.push(theCard);
    }
    await theKanban.save();
    return theCard;
  }

  // /***********************************************************************************
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

  public static async deleteACard(
    kanbanId: string,
    columnId: string,
    cardId: string,
    token: string
  ) {
    let theKanban = await KanbanMongo.KanbanMongoModel.findById(kanbanId);
    const deletedCard = theKanban.columns.id(columnId).cards.id(cardId);
    deletedCard.remove();

    // get the column
    const column = await KanbanColumn.getColumn(kanbanId, columnId);
    // if remove the card from "Done" column
    const theCard = await Card.getCardById(kanbanId, columnId, cardId);
    if (column.name === "Done") {
      // open the issue
      await theCard.open(token);
      // TODO: remove it(issueId) from finishedIssueIds in the Kanban
      if (theKanban.finishedIssueIds.includes(theCard.getIssueId()))
        theKanban.finishedIssueIds = theKanban.finishedIssueIds.filter(
          id => id !== theCard.getIssueId()
        );
    }
    if (theKanban.includeIssueIds.includes(theCard.getIssueId()))
      theKanban.includeIssueIds = theKanban.includeIssueIds.filter(
        id => id !== deletedCard.issue_id
      );

    theKanban.save();
    return deletedCard;
  }

  public static async getCardById(
    kanbanId: string,
    columnId: string,
    cardId: string
  ): Promise<Card> {
    const theKanban = await KanbanMongo.KanbanMongoModel.findById(kanbanId);
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
