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
//-----------------------------------------------------------------------
// All of the Kanban related mongo data
//------------------------------------------------------------------------------
const mongoose = require("mongoose");
const kanbanColumnModel_1 = require("./kanbanColumnModel");
const cardModel_1 = require("./cardModel");
class KanbanMongo {
}
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
KanbanMongo.KanbanSchema = new mongoose.Schema({
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
        type: [kanbanColumnModel_1.KanbanColumnMongo.KanbanColumnMongoModel.schema],
        default: []
    },
    cards: {
        type: [cardModel_1.CardMongo.CardMongoModel.schema],
        default: []
    },
    includeIssueIds: [String],
    finishedIssueIds: [String]
});
KanbanMongo.KanbanMongoModel = mongoose.model("kanbans", KanbanMongo.KanbanSchema);
exports.KanbanMongo = KanbanMongo;
const projectModel_1 = require("./projectModel");
class Kanban {
    constructor(id, name, state, due, projectId, columns, includeIssueIds, finishedIssueIds, cards, ownerName, created) {
        if (id)
            this.id = id;
        if (name)
            this.name = name;
        if (state && state !== "open" && state !== "close")
            throw new RangeError("The state is neither 'close' nor 'open'");
        this.state = state;
        if (due)
            this.due = due;
        if (projectId)
            this.projectId = projectId;
        if (includeIssueIds)
            this.includeIssueIds = includeIssueIds.slice(0);
        if (finishedIssueIds)
            this.finishedIssueIds = finishedIssueIds.slice(0);
        if (ownerName)
            this.ownerName = ownerName;
        if (created)
            this.created = created;
        if (columns)
            this.columns = columns.slice(0);
        if (cards)
            this.cards = cards.slice(0);
    }
    //--------------------------------------------------------------------------
    // Getter ana Setter Functions
    //--------------------------------------------------------------------------
    getId() {
        return this.id;
    }
    getName() {
        return this.name;
    }
    setName(name) {
        this.name = name;
    }
    getState() {
        return this.state;
    }
    open() {
        this.state = "open";
    }
    close() {
        this.state = "close";
    }
    getDue() {
        return this.due;
    }
    setDue(due) {
        this.due = due;
    }
    getProjectId() {
        return this.projectId;
    }
    getColumns() {
        return this.columns.slice(0);
    }
    getIncludeIssueIds() {
        return this.includeIssueIds.slice(0);
    }
    getFinishedIssueIds() {
        return this.finishedIssueIds.slice(0);
    }
    getCards() {
        return this.cards.slice(0);
    }
    getOwner() {
        return this.ownerName;
    }
    getCreatedDate() {
        return this.created;
    }
    //------------------------------------------------------------------------------
    // Some Functions
    //------------------------------------------------------------------------------
    /**
     * Saved kanban to the MongoDB
     */
    saveToMongo() {
        return __awaiter(this, void 0, void 0, function* () {
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
                theKanban = yield new KanbanMongo.KanbanMongoModel(theKanban).save(); // the kanban is the data stored in the db
            }
            catch (error) {
                console.error("<Error> Fail to save the kanban whose name is " + this.name, error);
            }
            for (let col of this.columns) {
                col.setKanbanId(theKanban["id"]);
                yield col.saveToMongo();
            }
            // change the 'project' document, add the kanban id to the project
            let theProject;
            try {
                theProject = yield projectModel_1.ProjectMongo.ProjectMongoModel.findById(this.projectId);
            }
            catch (error) {
                console.error("<Error> Fail to find the project in the MongoDB whose ID is " +
                    this.projectId, error);
            }
            if (!theProject.kanbanIds)
                theProject.kanbanIds = [];
            theProject.kanbanIds.push(theKanban["id"]); // push the kanban id to project document
            let kanbanObj;
            try {
                kanbanObj = yield new projectModel_1.ProjectMongo.ProjectMongoModel(theProject).save();
            }
            catch (error) {
                console.error("<Error> Fail to saved the kanban whose id is ", error);
            }
            return [theKanban, kanbanObj];
        });
    }
    //------------------------------------------------------------------------------------
    // Some Static Functions
    //------------------------------------------------------------------------------------
    /**
     * get the kanbans of the project with given project ID
     * @param projectId
     */
    static getAllKanbansOfProject(projectId) {
        return __awaiter(this, void 0, void 0, function* () {
            const theProject = yield projectModel_1.ProjectMongo.ProjectMongoModel.findById(projectId);
            const kanbanIds = theProject.kanbanIds;
            const kanbans = [];
            for (const kanbanId of kanbanIds) {
                const theKanban = yield KanbanMongo.KanbanMongoModel.findById(kanbanId);
                kanbans.push(theKanban);
            }
            return kanbans;
        });
    }
    static getKanbanById(kanbanId) {
        return __awaiter(this, void 0, void 0, function* () {
            const theKanban = yield KanbanMongo.KanbanMongoModel.findById(kanbanId);
            return theKanban;
        });
    }
    static newGetKanbanById(kanbanId) {
        return __awaiter(this, void 0, void 0, function* () {
            let theKanban;
            try {
                theKanban = yield KanbanMongo.KanbanMongoModel.findById(kanbanId);
            }
            catch (error) {
                console.error("<Error> Fail to get Kanban from MongoDB whose id is " + kanbanId, error);
            }
            const { id, name, state, created, due, projectId } = theKanban;
            const includeIssueIds = theKanban.includeIssueIds.slice(0);
            const finishedIssueIds = theKanban.finishedIssueIds.slice(0);
            const kanban = new Kanban(id, name, state, due, projectId, undefined, includeIssueIds, finishedIssueIds);
            return kanban;
        });
    }
}
exports.Kanban = Kanban;
//# sourceMappingURL=kanbanModel.js.map