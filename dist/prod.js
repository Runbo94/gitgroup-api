"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helmet = require("helmet");
const compression = require("compression");
module.exports = function (app) {
    app.use(helmet());
    app.use(compression());
};
//# sourceMappingURL=prod.js.map