import { Request, Response } from "express";
import { IControllerRoutes, IController } from "interface";
import { AuthToUser } from "middleware";
import { GetTokenFromCookie, GetUserFromToken, Ok, UnAuthorized, VerifyToken } from "utils";

export class AccountSettings implements IController {
     public routes: IControllerRoutes[] = [];

     constructor() {
          this.routes.push({
               path: "/account/settings",
               handler: this.AccountSettingUpdate,
               method: "PUT",
               middleware: [AuthToUser],
          });
          this.routes.push({
               path: "/account/my-settings",
               handler: this.GetMySettings,
               method: "GET",
               middleware: [AuthToUser],
          });
     }
     public async AccountSettingUpdate(req: Request, res: Response) {
          try {
               return Ok(res, "Hello from api");
          } catch (err) {
               return UnAuthorized(res, err);
          }
     }

     public async GetMySettings(req: Request, res: Response) {
          try {
               const token = GetTokenFromCookie(req);
               const verify = VerifyToken(token);
               if (verify) {
                    const user = GetUserFromToken(token);
                    return Ok(res, user);
               } else {
                    return UnAuthorized(res, "something went wrong");
               }
          } catch (err) {
               return UnAuthorized(res, err);
          }
     }
}
