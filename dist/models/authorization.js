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
const config = require("config");
const githubAPI_1 = require("../remoteConnection/github/githubAPI");
class Authorization {
    constructor() {
        this.client_id = config.get("github.client_id");
        this.client_secret = config.get("github.client_secret");
        this.scope = config.get("github.scope");
        this.githubAuthUrl = githubAPI_1.githubAuthUrl;
    }
    getClientId() {
        return this.client_id;
    }
    getScope() {
        return this.scope;
    }
    getGithubAuthUrl() {
        return this.githubAuthUrl;
    }
    getToken(code) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield githubAPI_1.githubGetTokenApi.post("/", {
                client_id: this.client_id,
                client_secret: this.client_secret,
                code: code
            });
            return res;
        });
    }
    /**
     * Check the user provided access_token whether is valid or not
     * @param {string} token the user provided token
     */
    static isValidToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = false;
            let res;
            if (!token)
                return result; // if no token, return false immediately
            try {
                res = yield githubAPI_1.github(token).get("/user");
            }
            catch (error) {
                return result; // if the request fails, return false
            }
            if (res.data.login && typeof res.data.login === "string") {
                result = true;
            }
            return result;
        });
    }
    static authenticate(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const auth_token = req.headers.authorization;
            const isValid = yield Authorization.isValidToken(auth_token);
            if (!isValid) {
                return res.status(403).json({ error: "Invalid credentials!" });
            }
            next();
        });
    }
}
exports.Authorization = Authorization;
//# sourceMappingURL=authorization.js.map