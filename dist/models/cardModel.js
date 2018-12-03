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
//-----------------------------------------------------------------
// Mongoose Related Data
//-----------------------------------------------------------------
const mongoose = require("mongoose");
class CardMongo {
}
CardMongo.CardSchema = new mongoose.Schema({
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
CardMongo.CardMongoModel = mongoose.model("cards", CardMongo.CardSchema);
exports.CardMongo = CardMongo;
//-----------------------------------------------------------------------------------
// Card(class)
//-----------------------------------------------------------------------------------
const issueModel_1 = require("./issueModel");
const kanbanModel_1 = require("./kanbanModel");
class Card extends issueModel_1.Issue {
    /**
     * Constructor function
     * @param issue the issue which the card represents
     * @param note the note of the card
     * @param kanbanId the kanban ID which the card belongs to
     * @param columnId the column ID which the card belongs to
     * @param id the mongo id of the card
     */
    constructor(issue, note, kanbanId, columnId, id) {
        super(issue.getIssueId(), issue.getTitle(), issue.getBody(), issue.getOwner(), issue.getRepos(), issue.getState(), issue.getNumber());
        this.note = note;
        if (kanbanId)
            this.kanbanId = kanbanId;
        if (columnId)
            this.columnId = columnId;
        else
            this.columnId = "0"; // the default value of the column name is 'To Do'
        if (id)
            this.id = id;
    }
    //--------------------------------------------------------------------------
    // Getter and Setter Functions
    //--------------------------------------------------------------------------
    getNote() {
        return this.note;
    }
    setNote(note) {
        this.note = note;
    }
    getColumnId() {
        return this.columnId;
    }
    setColumnId(columnId) {
        this.columnId = columnId;
    }
    getId() {
        return this.id;
    }
    //---------------------------------------------------------------------------
    // Some Functions
    //---------------------------------------------------------------------------
    toCardObject() {
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
    logFinish() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    logCreate() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    /**
     * save the card
     * @param token used to save issue when the card save to done column
     */
    saveToMongo(token) {
        return __awaiter(this, void 0, void 0, function* () {
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
                theKanban = yield kanbanModel_1.KanbanMongo.KanbanMongoModel.findById(this.kanbanId);
            }
            catch (error) {
                console.error("<Error> Fail to get the kanban from the MongoDB whose ID is" +
                    this.kanbanId, error);
            }
            // get the column
            const theColumn = theKanban.columns.id(this.columnId);
            // if add the new card to the 'Done' column
            if (theColumn.name === "Done") {
                // close the issue
                const theIssue = yield issueModel_1.Issue.getIssue(this.getOwner(), this.getRepos(), this.getIssueId());
                yield theIssue.close(token);
                // delete it(issueId) from includeIssueIds in the Kanban
                if (theKanban.includeIssueIds.includes(this.getIssueId()))
                    theKanban.includeIssueIds = theKanban.includeIssueIds.filter(id => id !== this.getIssueId());
                // add it(issueId) to finishedIssueIds in the Kanban
                if (!theKanban.finishedIssueIds)
                    theKanban.finishedIssueIds = [];
                if (!theKanban.finishedIssueIds.includes(theCard.issue_id))
                    theKanban.finishedIssueIds.push(theCard.issue_id);
            }
            else {
                // if save to the column except the 'DONE' column, add the card to the "includeIssueIds"
                if (!theKanban.includeIssueIds)
                    theKanban.includeIssueIds = [];
                if (!theKanban.includeIssueIds.includes(theCard.issue_id))
                    theKanban.includeIssueIds.push(theCard.issue_id);
            }
            // add it to the column
            if (!theKanban.columns
                .id(this.columnId)
                .cards.find(card => card._id === theCard._id)) {
                theKanban.columns.id(this.columnId).cards.push(theCard);
            }
            try {
                yield theKanban.save();
            }
            catch (error) {
                console.error("<Error> Fail to save the kanban to the MongoDB whose id is " + theId, error);
            }
            return theCard;
        });
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
    static deleteACard(kanbanId, columnId, cardId, token) {
        return __awaiter(this, void 0, void 0, function* () {
            let theKanban;
            try {
                theKanban = yield kanbanModel_1.KanbanMongo.KanbanMongoModel.findById(kanbanId);
            }
            catch (error) {
                console.error("<Error> Fail to get the kanban from the MongoDB whose id is " +
                    kanbanId, error);
            }
            // delete the card from the column
            const deletedCard = theKanban.columns.id(columnId).cards.id(cardId);
            deletedCard.remove();
            // get the column
            const column = yield theKanban.columns.id(columnId);
            // if remove the card from "Done" column
            const { issue_id, number, owner, repos } = deletedCard;
            const theIssue = new issueModel_1.Issue(issue_id, undefined, undefined, owner, repos, undefined, number);
            if (column.name === "Done") {
                // open the issue
                yield theIssue.open(token);
                // remove it(issueId) from finishedIssueIds in the Kanban
                if (theKanban.finishedIssueIds.includes(issue_id))
                    theKanban.finishedIssueIds = theKanban.finishedIssueIds.filter(id => id !== issue_id);
            }
            else {
                if (theKanban.includeIssueIds.includes(issue_id))
                    theKanban.includeIssueIds = theKanban.includeIssueIds.filter(id => id !== issue_id);
            }
            theKanban.save();
            return deletedCard;
        });
    }
    static getCardById(kanbanId, columnId, cardId) {
        return __awaiter(this, void 0, void 0, function* () {
            let theKanban;
            try {
                theKanban = yield kanbanModel_1.KanbanMongo.KanbanMongoModel.findById(kanbanId);
            }
            catch (error) {
                console.error("<Error> Fail to find the kanban in the MongoDB whose id is " +
                    kanbanId, error);
            }
            const theCard = theKanban.columns.id(columnId).cards.id(cardId);
            const { issue_id, title, body, owner, repos, state, note, number } = theCard;
            const issue = new issueModel_1.Issue(issue_id, title, body, owner, repos, state, number);
            const card = new Card(issue, note, kanbanId, columnId, cardId);
            return card;
        });
    }
}
exports.Card = Card;
//# sourceMappingURL=cardModel.js.map