// lib/server.ts
import app from "./app";
const PORT = process.env.PORT || 8000;

require("./prod")(app);

app.listen(PORT, () => {
  console.log("Express server listening on port " + PORT);
});
