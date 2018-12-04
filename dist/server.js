"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// lib/server.ts
const app_1 = require("./app");
const PORT = process.env.PORT || 8000;
require("./prod")(app_1.default);
app_1.default.listen(PORT, () => {
    console.log("Express server listening on port " + PORT);
});
//# sourceMappingURL=server.js.map