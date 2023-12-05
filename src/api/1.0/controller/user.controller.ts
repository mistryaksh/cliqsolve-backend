import { Request, Response } from "express";
import { IController, IControllerRoutes, SignInProps, SignUpProps } from "interface";
import { AccountSettings, Users } from "model";
import { BadRequest, DecodedToken, GetTokenFromCookie, Ok, UnAuthorized } from "utils";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AuthToUser } from "middleware";
import nodemailer from "nodemailer";
import config from "config";
import { Twilio } from "twilio";

const twilio = new Twilio("AC1d0e8e20e77f5885c013a9ddb15aaa68", "910c94f488f61ff97fc01867dcb0585f");

export class UserController implements IController {
     public routes: IControllerRoutes[] = [];
     constructor() {
          this.routes.push({
               handler: this.Register,
               method: "POST",
               path: "/register",
          });
          this.routes.push({
               handler: this.LoginUser,
               method: "POST",
               path: "/login",
          });
          this.routes.push({
               handler: this.GenerateTokenForLogin,
               method: "POST",
               path: "/generate-login",
          });
          this.routes.push({
               handler: this.UserProfile,
               method: "GET",
               path: "/profile",
               middleware: [AuthToUser],
          });
          this.routes.push({
               handler: this.Logout,
               method: "POST",
               path: "/logout",
               middleware: [AuthToUser],
          });
     }

     public async Register(req: Request, res: Response) {
          try {
               const { accountPin, email, mobile, name }: SignUpProps = req.body;
               const hashSalt: number = 10;

               if (!accountPin || !email || !mobile || !name) {
                    return UnAuthorized(res, "missing fields");
               }
               const user = await Users.findOne({ email: email });

               if (user) {
                    return UnAuthorized(
                         res,
                         "Oops you have the registered account with this email address please login"
                    );
               }

               const sendMail = nodemailer.createTransport({
                    service: "gmail",
                    auth: {
                         user: process.env.APP_EMAIL,
                         pass: process.env.APP_PASSWORD,
                    },
               });

               const hashPin = bcrypt.hashSync(accountPin, hashSalt);

               const saveUser = await new Users({
                    accountPin: hashPin,
                    email,
                    mobile,
                    name,
                    role: "user",
               }).save();

               sendMail.sendMail({
                    subject: "Your account is successfully registered with Cliqsolve Fintech",

                    from: "mistryaksh1998@gmail.com",
                    to: email,
                    text: `Hey
                    your email address ${email} is successfully registered with us. kindly be safe  & healthy
                         you can login to your account by going back to Cliqsolve App.

                         -Thank you
                    `,
               });

               await new AccountSettings({
                    TwoFA: false,
                    pushNotification: false,
                    storeCardPermission: false,
               }).save();

               return Ok(res, `${saveUser.name} your account is registered with us, please login!`);
          } catch (err: any) {
               return UnAuthorized(res, err);
          }
     }

     public async LoginUser(req: Request, res: Response) {
          try {
               const { mobile }: SignInProps = req.body;

               const user = await Users.findOne({ mobile });

               if (!user) {
                    return UnAuthorized(res, `No user found please register`);
               }

               // if (user.role !== "user") {
               //      return UnAuthorized(res, `access denied for login`);
               // }

               const twilioMsg = await twilio.verify.v2
                    .services("VA43d83abaae5301aaf1d81570fce1ce9a")
                    .verifications.create({ to: `+91${mobile}`, channel: "sms" });

               if (twilioMsg.status === "pending") {
                    return Ok(res, `OTP has been sent to +91-${mobile}`);
               } else {
                    return UnAuthorized(res, `failed to get verification message try again in 30 sec.`);
               }
          } catch (err: any) {
               return UnAuthorized(res, err);
          }
     }

     public async GenerateTokenForLogin(req: Request, res: Response) {
          try {
               const { mobile, otp } = req.body;
               const user = await Users.findOne({ mobile });

               const twilioVerify = await twilio.verify.v2
                    .services("VA43d83abaae5301aaf1d81570fce1ce9a")
                    .verificationChecks.create({ to: `+91${mobile}`, code: otp });

               if (twilioVerify.status === "approved") {
                    const token = jwt.sign(
                         {
                              id: user?._id,
                              role: user?.role,
                         },
                         process.env?.JWT_SECRET,
                         { expiresIn: "3d" }
                    );
                    return Ok(res, {
                         token,
                         mobile,
                    });
               } else {
                    return UnAuthorized(res, twilioVerify.to);
               }
          } catch (err) {
               return UnAuthorized(res, err);
          }
     }

     public async UserProfile(req: Request, res: Response) {
          try {
               const token = GetTokenFromCookie(req);
               const extracted = DecodedToken(req, token);
               const user = await Users.findById({ _id: extracted.id }).select(
                    "email mobile name createdAt updatedAt accountPin"
               );
               return Ok(res, user);
          } catch (err) {
               return UnAuthorized(res, err);
          }
     }

     public async Logout(req: Request, res: Response) {
          try {
               res.removeHeader("token");
               return Ok(res, "logout successfully");
          } catch (err) {
               return UnAuthorized(res, err);
          }
     }
}
