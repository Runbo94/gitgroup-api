import { Router, Request, Response, Application } from "express";
import * as url from "url";
import * as config from "config";
import { Authorization } from "./../models/authorization";

export class AuthorizationRoutes {
  private router: Router;

  constructor() {
    this.router = Router();
    this.router.use((req, res, next) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Headers",
        "Authorization, Content-Type, If-Match, If-Modified-Since, If-None-Match, If-Unmodified-Since, X-GitHub-OTP, X-Requested-With"
      );
      res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
      next();
    });

    //[method: get, url: /user/auth] - used to get the github authorization request page
    this.router.get("/", async (req: Request, res: Response) => {
      const auth: Authorization = new Authorization();
      return res.status(200).send(
        url.format({
          pathname: auth.getGithubAuthUrl(),
          query: {
            client_id: auth.getClientId(),
            scope: auth.getScope()
          }
        })
      );
    });

    this.router.get("/callback", async (req: Request, res: Response) => {
      const code: string = req.param("code");
      const auth: Authorization = new Authorization();
      const accessToken = await auth.getToken(code);
      return res.redirect(config.get("home_page_url") + "?" + accessToken.data);
    });
  }

  public routes(app: Application): void {
    app.use("/user/auth", this.router);
  }
}
