import { Request, Response } from "express";
import { IControllerRoutes, IController } from "interface";
import { AdminRoute } from "middleware/admin.middleware";
import { Bill, Users } from "model";
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
          this.routes.push({
               path: "/get-all-users",
               handler: this.GetAllUsers,
               method: "GET",
               middleware: [AdminRoute],
          });
          this.routes.push({
               handler: this.GetAllBills,
               method: "GET",
               path: "/get-all-bills",
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

     public async GetAllUsers(req: Request, res: Response) {
          try {
               const users = await Users.find().sort({ createdAt: -1 });
               return Ok(res, users);
          } catch (err) {
               return UnAuthorized(res, err);
          }
     }

     public async GetAllBills(req: Request, res: Response) {
          try {
               const bills = await Bill.find().sort({ createdAt: -1 });
               return Ok(res, bills);
          } catch (err) {
               return UnAuthorized(res, err);
          }
     }
}
