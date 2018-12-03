"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const cardModel_1 = require("./cardModel");
class KanbanColumnMongo {
}
/**
 * mongo related data
 */
KanbanColumnMongo.KanbanColumnSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    kanbanId: {
        type: String,
        required: true
    },
    cards: [cardModel_1.CardMongo.CardMongoModel.schema]
});
KanbanColumnMongo.KanbanColumnMongoModel = mongoose.model("columns", KanbanColumnMongo.KanbanColumnSchema);
exports.KanbanColumnMongo = KanbanColumnMongo;
const githubAPI_1 = require("../remoteConnection/github/githubAPI");
const kanbanModel_1 = require("./kanbanModel");
class KanbanColumn {
    constructor(kanbanId, name, cards, id) {
        if (id)
            this.id = id;
        this.kanbanId = kanbanId;
        this.name = name;
        if (cards)
            this.cards = cards;
    }
    getId() {
        return this.id;
    }
    setKanbanId(kanbanId) {
        this.kanbanId = kanbanId;
    }
    getKanbanId() {
        return this.kanbanId;
    }
    getName() {
        return this.name;
    }
    setName(colName) {
        this.name = colName;
    }
    getCards() {
        let cards = [];
        for (let card of this.cards) {
            cards.push(card);
        }
        return cards;
    }
    saveToMongo() {
        return __awaiter(this, void 0, void 0, function* () {
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
                const theKanban = yield kanbanModel_1.KanbanMongo.KanbanMongoModel.findById(this.kanbanId);
                theKanban.columns.push({
                    name: this.name,
                    kanbanId: this.kanbanId,
                    cards: theCards
                });
                this.id = theKanban.id;
                theKanban.save();
                if (this.cards) {
                    for (const card of this.cards) {
                        yield card.saveToMongo();
                    }
                }
            }
            //if it has id, update the related data
            // KanbanColumnMongo.KanbanColumnMongoModel.find({kanbanId: this.kanbanId});
        });
    }
    save() {
        return __awaiter(this, void 0, void 0, function* () {
            const post = {
                name: this.name
            };
            let result;
            try {
                result = yield githubAPI_1.githubApiPreview.post(`/projects/${this.kanbanId}/columns`, post);
                this.id = result.data.node_id;
            }
            catch (error) {
                throw error;
            }
            return result;
        });
    }
    static getColumn(kanbanId, columnId) {
        return __awaiter(this, void 0, void 0, function* () {
            const theKanban = yield kanbanModel_1.KanbanMongo.KanbanMongoModel.findById(kanbanId);
            return theKanban.columns.id(columnId);
        });
    }
}
exports.KanbanColumn = KanbanColumn;
//# sourceMappingURL=kanbanColumnModel.js.map