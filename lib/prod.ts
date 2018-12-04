import * as helmet from "helmet";
import * as compression from "compression";

module.exports = function(app) {
  app.use(helmet());
  app.use(compression());
};
