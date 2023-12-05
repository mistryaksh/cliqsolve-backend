import { Request, Response } from "express";
import { BillGenerateProps, IController, IControllerRoutes } from "interface";
import { AuthToUser, CheckEmailVerified } from "middleware";
import { Bill } from "model";
import { Ok, UnAuthorized } from "utils";

export class BillGenerateController implements IController {
     public routes: IControllerRoutes[] = [];
     constructor() {
          this.routes.push({
               handler: this.PayCreditCardBill,
               method: "POST",
               path: "/pay-bill",
               middleware: [AuthToUser, CheckEmailVerified],
          });
          this.routes.push({
               handler: this.GetMyBills,
               method: "GET",
               path: "/get-bill/:id",
               middleware: [AuthToUser, CheckEmailVerified],
          });
     }

     public async PayCreditCardBill(req: Request, res: Response) {
          try {
               const { billId, billerName, cardDigit, details, platformFees, transferID, user }: BillGenerateProps =
                    req.body;

               if (!billId || !billerName || !cardDigit || !details || !platformFees || !transferID || !user) {
                    return UnAuthorized(res, "missing fields");
               }

               const bill = await new Bill({
                    billId,
                    billerName,
                    cardDigit,
                    details,
                    platformFees,
                    transferID,
                    user,
               }).save();

               return Ok(res, "successful");
          } catch (err) {
               return UnAuthorized(res, err);
          }
     }

     public async GetMyBills(req: Request, res: Response) {
          try {
               const id = req.params.id;

               const data = await Bill.find({ user: id })
                    .sort({
                         createdAt: -1,
                    })
                    .populate("user", "email name mobile");

               return Ok(res, data);
          } catch (err) {
               return UnAuthorized(res, err);
          }
     }
}
