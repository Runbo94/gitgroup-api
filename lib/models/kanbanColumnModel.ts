import * as mongoose from "mongoose";
import { CardMongo } from "./cardModel";

export class KanbanColumnMongo {
  /**
   * mongo related data
   */
  public static KanbanColumnSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
    kanbanId: {
      type: String,
      required: true
    },
    cards: [CardMongo.CardMongoModel.schema]
  });

  public static KanbanColumnMongoModel = mongoose.model(
    "columns",
    KanbanColumnMongo.KanbanColumnSchema
  );
}

import { Card } from "./cardModel";
import { githubApiPreview } from "../remoteConnection/github/githubAPI";
import { KanbanMongo } from "./kanbanModel";

export class KanbanColumn {
  private id: string;
  private kanbanId: string;
  private name: string;
  private cards: Card[];

  constructor(kanbanId: string, name: string, cards?: Card[], id?: string) {
    if (id) this.id = id;
    this.kanbanId = kanbanId;
    this.name = name;
    if (cards) this.cards = cards;
  }

  public getId(): string {
    return this.id;
  }

  public setKanbanId(kanbanId: string): void {
    this.kanbanId = kanbanId;
  }

  public getKanbanId(): string {
    return this.kanbanId;
  }

  public getName(): string {
    return this.name;
  }

  public setName(colName: string): void {
    this.name = colName;
  }

  public getCards(): Card[] {
    let cards: Card[] = [];
    for (let card of this.cards) {
      cards.push(card);
    }
    return cards;
  }

  public async saveToMongo(token: string) {
    let theCards = [];
    if (this.cards) {
      for (const card of this.cards) {
        const cardObj = card.toCardObject();
        cardObj.kanbanId = this.kanbanId;
        theCards.push(cardObj);
      }
    }

    //if it has not id, add directly
    if (!this.id) {
      const theKanban = await KanbanMongo.KanbanMongoModel.findById(
        this.kanbanId
      );
      theKanban.columns.push({
        name: this.name,
        kanbanId: this.kanbanId,
        cards: theCards
      });
      this.id = theKanban.id;
      theKanban.save();
      if (this.cards) {
        for (const card of this.cards) {
          await card.saveToMongo(token);
        }
      }
    }

    //if it has id, update the related data
    // KanbanColumnMongo.KanbanColumnMongoModel.find({kanbanId: this.kanbanId});
  }

  public async save(): Promise<any> {
    const post = {
      name: this.name
    };
    let result: any;
    try {
      result = await githubApiPreview.post(
        `/projects/${this.kanbanId}/columns`,
        post
      );
      this.id = result.data.node_id;
    } catch (error) {
      console.error("<Error> Fail to post the column to the github.", error);
    }
    return result;
  }

  public static async getColumn(kanbanId: string, columnId: string) {
    const theKanban = await KanbanMongo.KanbanMongoModel.findById(kanbanId);
    return theKanban.columns.id(columnId);
  }
}
