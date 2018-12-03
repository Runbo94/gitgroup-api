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
const githubAPI_1 = require("../remoteConnection/github/githubAPI");
class Issue {
    /**
     * The Issue Constructor
     * @param id the issue ID
     * @param title the title of the issue
     * @param body the text body of the issue
     * @param state the state of the issue: open or close
     * @param repos the repository name which the issue belongs to
     * @param state the state of the repository
     * @param number the number of the repository
     */
    constructor(id, // the issue ID
    title, body, owner, repos, state, number) {
        this.issueId = id;
        this.title = title;
        this.body = body;
        this.owner = owner;
        this.repos = repos;
        if (state && state !== "close" && state !== "open")
            throw new RangeError("State must be 'close' or 'open'.");
        this.state = state;
        this.number = number;
    }
    //----------------------------------------------------------------------------
    // Getter and Setter Functions
    //----------------------------------------------------------------------------
    getIssueId() {
        return this.issueId;
    }
    getTitle() {
        return this.title;
    }
    setTitle(title) {
        this.title = title;
        //TODO: Set title in the github
    }
    getBody() {
        return this.body;
    }
    setBody(body) {
        this.body = body;
        //TODO: Set body in the github
    }
    getOwner() {
        return this.owner;
    }
    getRepos() {
        return this.repos;
    }
    getState() {
        return this.state;
    }
    getNumber() {
        return this.number;
    }
    /**
     * Close the issue
     *  *must have owner, repos, number fields
     */
    close(token) {
        return __awaiter(this, void 0, void 0, function* () {
            this.state = "close";
            let result;
            try {
                result = (yield githubAPI_1.github(token).patch(`/repos/${this.owner}/${this.repos}/issues/${this.number}`, {
                    state: "closed"
                })).data;
            }
            catch (error) {
                console.error("<Error> Fail to close the issue whose url is " +
                    `/repos/${this.owner}/${this.repos}/issues/${this.number}`, error);
            }
            return result;
        });
    }
    /**
     * Open the issue
     */
    open(token) {
        return __awaiter(this, void 0, void 0, function* () {
            this.state = "open";
            let result;
            try {
                result = (yield githubAPI_1.github(token).patch(`/repos/${this.owner}/${this.repos}/issues/${this.number}`, {
                    state: "open"
                })).data;
            }
            catch (error) {
                console.error("<Error> Fail to open the issue whose url is " +
                    `/repos/${this.owner}/${this.repos}/issues/${this.number}`, error);
            }
            return result;
        });
    }
    // /*
    //  * save the issue to the GitHub.
    //  */
    // public async save(): Promise<any> {
    //   const post = {
    //     title: this.title,
    //     body: this.body
    //   };
    //   let result: any;
    //   try {
    //     result = await githubApiPreview.post(
    //       `/repos/${this.owner}/${this.repos}/issues`,
    //       post
    //     );
    //     this.issueId = result.data.node_id;
    //   } catch (error) {
    //     throw error;
    //   }
    //   return result;
    // }
    //-------------------------------------------------------------------------
    // Static methods
    //-------------------------------------------------------------------------
    /*
     * Get all issues for specific user and his repository
     * @param username
     * @param reposName
     */
    static getAllIssues(username, reposName) {
        return __awaiter(this, void 0, void 0, function* () {
            const theIssues = (yield githubAPI_1.githubApiPreview.get(`/repos/${username}/${reposName}/issues`)).data;
            if (!theIssues)
                return theIssues;
            let issues = [];
            for (let data of theIssues) {
                const reposUrl = data.repository_url;
                const repos = reposUrl.split("/").pop();
                const issueObj = new Issue(data.node_id, data.title, data.body, data.user.login, repos, data.state, data.number);
                issues.push(issueObj);
            }
            return issues;
        });
    }
    /**
     * get the Issue Object from github api
     * @param username the name of user
     * @param reposName the name of repos
     * @param issueId the id of issue
     */
    static getIssue(username, reposName, issueId) {
        return __awaiter(this, void 0, void 0, function* () {
            const theIssues = (yield githubAPI_1.githubApiPreview.get(`/repos/${username}/${reposName}/issues`)).data;
            if (!theIssues)
                return theIssues;
            let theIssue = theIssues.find(issue => issue.node_id === issueId);
            const reposUrl = theIssue.repository_url;
            const repos = reposUrl.split("/").pop();
            const issueObj = new Issue(theIssue.node_id, theIssue.title, theIssue.body, theIssue.user.login, repos, theIssue.state, theIssue.number);
            return issueObj;
        });
    }
}
exports.Issue = Issue;
//# sourceMappingURL=issueModel.js.map