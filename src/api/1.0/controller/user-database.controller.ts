import { Request, Response } from "express";
import { IControllerRoutes, IController } from "interface";
import { AdminRoute } from "middleware/admin.middleware";
import { Ok, UnAuthorized } from "utils";

export class UserDatabaseController implements IController {
     public routes: IControllerRoutes[] = [];

     constructor() {
          this.routes.push({
               path: "/dashboard-data",
               handler: this.GetDashboardLength,
               method: "GET",
               middleware: [AdminRoute],
          });
     }
     public async GetDashboardLength(req: Request, res: Response) {
          try {
               const details = {
                    gainedProfit: 2000000,
                    gainedLoss: 300,
                    distanceLoss: 1999700,
                    userRegistered: 30000,
                    verifiedUser: 26000,
                    paidBills: 300,
                    failedBills: 60,
               };
               return Ok(res, details);
          } catch (err) {
               return UnAuthorized(res, err);
          }
     }
}
