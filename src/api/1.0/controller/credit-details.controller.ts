import { Request, Response } from "express";
import { CheckScoreProps, CreditCardProps, IController, IControllerRoutes } from "interface";
import { Card, CreditRecord, Users } from "model";
import { DecodedToken, GetTokenFromCookie, Ok, UnAuthorized, decrypt, encryptData } from "utils";
import { AuthToUser, CheckEmailVerified } from "middleware";
import moment from "moment";

export class CreditDetailsController implements IController {
     public routes: IControllerRoutes[] = [];

     constructor() {
          // Credit records
          this.routes.push({
               handler: this.CheckCreditScore,
               method: "POST",
               path: "/check-credit-score",
               middleware: [AuthToUser, CheckEmailVerified],
          });
          this.routes.push({
               handler: this.MyCreditHistory,
               path: "/my-credit-history/:id",
               method: "GET",
               middleware: [AuthToUser, CheckEmailVerified],
          });

          // Credit Card
          this.routes.push({
               handler: this.SaveCreditCard,
               method: "POST",
               path: "/card",
               middleware: [AuthToUser, CheckEmailVerified],
          });
          this.routes.push({
               handler: this.GetCardById,
               method: "GET",
               path: "/card/:cardId",
               middleware: [AuthToUser, CheckEmailVerified],
          });
          this.routes.push({
               handler: this.GetMyCreditCards,
               method: "GET",
               path: "/card",
               middleware: [AuthToUser, CheckEmailVerified],
          });
          this.routes.push({
               handler: this.DecryptCreditCardNumber,
               method: "POST",
               path: "/decrypt/card",
               middleware: [AuthToUser, CheckEmailVerified],
          });
          this.routes.push({
               handler: this.DeleteCreditCard,
               method: "DELETE",
               path: "/card/:id",
               middleware: [AuthToUser, CheckEmailVerified],
          });
     }

     public async CheckCreditScore(req: Request, res: Response) {
          try {
               const { nameAsPan, panNo, dob, gender, user }: CheckScoreProps = req.body;

               if (!nameAsPan || !panNo || !dob || !gender || !user) {
                    return UnAuthorized(res, "missing fields");
               }

               const record = await CreditRecord.findOne({ panNo: panNo });

               if (record) {
                    return UnAuthorized(
                         res,
                         "you have recently checked your credit score! please check your credit history or try again in 90 days"
                    );
               }

               const newRecord = await new CreditRecord({
                    nameAsPan,
                    panNo,
                    dob,
                    gender,
                    user,
               }).save();

               return Ok(res, {
                    record: newRecord,
                    score: "820",
               });
          } catch (err) {
               console.log(err);
               return UnAuthorized(res, err);
          }
     }

     public async MyCreditHistory(req: Request, res: Response) {
          try {
               const id = req.params.id;

               if (!id) {
                    return UnAuthorized(res, "user id not found");
               }

               const history = await CreditRecord.find({ user: id })
                    .populate("user", "email mobile name createdAt")
                    .select("panNo nameAsPan dob gender user createdAt");
               return Ok(res, history);
          } catch (err) {
               console.log(err);
               return UnAuthorized(res, err);
          }
     }

     public async SaveCreditCard(req: Request, res: Response) {
          try {
               const { appearance, details, status }: CreditCardProps = req.body;
               const cookie = GetTokenFromCookie(req);
               const tokenExtracted = DecodedToken(req, cookie);

               if (!details) {
                    return UnAuthorized(res, "missing fields");
               }

               const data = encryptData(details.number);

               const saved = await new Card({
                    details: {
                         number: data,
                         ownerName: details.ownerName,
                         cvv: details.cvv,
                         exp: details.exp,
                         cardType: details.cardType,
                    },
                    appearance,
                    user: tokenExtracted.id,
                    status: "active",
               }).save();

               return Ok(res, {
                    message: "card_saved",
                    id: saved._id,
               });
          } catch (err) {
               console.log("ERROR", err);
               return UnAuthorized(res, err);
          }
     }

     public async GetCardById(req: Request, res: Response) {
          try {
               const { cardId } = req.params;
               const card = await Card.findById({ _id: cardId });
               return Ok(res, card);
          } catch (err) {
               return UnAuthorized(res, err);
          }
     }

     public async GetMyCreditCards(req: Request, res: Response) {
          try {
               const cookie = GetTokenFromCookie(req);
               const tokenExtracted = DecodedToken(req, cookie);
               const user = await Users.findById({ _id: tokenExtracted.id });
               const cards = await Card.find({ user: user._id }).sort({ createdAt: -1 });

               return Ok(res, cards);
          } catch (err) {
               return UnAuthorized(res, err);
          }
     }

     public async DecryptCreditCardNumber(req: Request, res: Response) {
          try {
               const { encryptedCard } = req.body;

               if (!encryptedCard) {
                    return UnAuthorized(res, "invalid card number");
               }
               const data = decrypt(encryptedCard);
               return Ok(res, data);
          } catch (err) {
               console.log(err);
               return UnAuthorized(res, err);
          }
     }

     // User need to verify their card number while deleting card from app
     public async DeleteCreditCard(req: Request, res: Response) {
          try {
               const cardid = req.params.id;
               const { encryptedCardNumber } = req.body;
               const card = await Card.findOne({ _id: cardid });

               if (!encryptedCardNumber) {
                    return UnAuthorized(res, "missing fields");
               }

               const data = decrypt(card.details.number);

               if (data !== encryptedCardNumber) {
                    return UnAuthorized(res, "card number not matched");
               }

               const deleted = await Card.findByIdAndDelete({ _id: card._id });
               if (!deleted) {
                    return UnAuthorized(res, "something went wrong");
               }

               return Ok(res, `card is deleted`);
          } catch (err) {
               return UnAuthorized(res, err);
          }
     }

     public async ChangeCreditCardStatus(req: Request, res: Response) {
          try {
               const id = req.body.id;
               const card = await Card.findById({ _id: id });

               if (!card) {
                    return UnAuthorized(res, "card not found");
               }

               const updateCard = await Card.findByIdAndUpdate(
                    { _id: card._id },
                    { $set: { status: card.status === "active" ? "disabled" : "active" } }
               );

               return Ok(res, `${updateCard.name} status is now ${updateCard.status}`);
          } catch (err) {
               return UnAuthorized(res, err);
          }
     }
}
