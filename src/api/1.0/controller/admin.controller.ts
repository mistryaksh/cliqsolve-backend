import { Request, Response } from "express";
import { IController, IControllerRoutes, SignInAdminProps, SignUpProps } from "interface";
import { BadRequest, DecodedToken, GetTokenFromCookie, Ok, UnAuthorized } from "utils";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Users } from "model";
import { AdminRoute } from "middleware/admin.middleware";
import config from "config";

export class AdminController implements IController {
     public routes: IControllerRoutes[] = [];

     constructor() {
          this.routes.push({
               handler: this.LoginAdmin,
               method: "POST",
               path: "/admin/login",
          });
          this.routes.push({
               handler: this.RegisterAdmin,
               method: "POST",
               path: "/admin/register",
          });
          this.routes.push({
               handler: this.GetAllUsers,
               method: "GET",
               path: "/admin/users",
               middleware: [AdminRoute],
          });
          this.routes.push({
               handler: this.LogoutAdmin,
               method: "POST",
               path: "/admin/logout",
               middleware: [AdminRoute],
          });
          this.routes.push({
               handler: this.GetMyAdminProfile,
               method: "GET",
               path: "/admin/my-profile",
               middleware: [AdminRoute],
          });
     }

     public async LoginAdmin(req: Request, res: Response) {
          try {
               const { mobile, accountPin }: SignInAdminProps = req.body;

               if (!mobile || !accountPin) {
                    return UnAuthorized(res, "invalid credentials");
               }

               const user = await Users.findOne({ mobile });

               if (!user) {
                    return UnAuthorized(res, "no user found");
               }

               if (!bcrypt.compareSync(accountPin, user.accountPin)) {
                    return UnAuthorized(res, "invalid password");
               }

               if (user.role !== "admin") {
                    return BadRequest(res, "access_denied");
               }

               const token = jwt.sign(
                    {
                         id: user._id,
                         mobile: mobile,
                    },
                    process.env.JWT_SECRET || config.get("JSONWEBTOKENSECRET") || config.get("3d"),
                    { expiresIn: "3d" }
               );

               res.cookie("token", token, { httpOnly: true });

               return Ok(res, token);
          } catch (err) {
               return UnAuthorized(res, err);
          }
     }

     public async RegisterAdmin(req: Request, res: Response) {
          try {
               const { accountPin, email, mobile, name }: SignUpProps = req.body;

               if (!accountPin || !email || !mobile || !name) {
                    return UnAuthorized(res, "invalid credentials");
               }

               const user = await Users.findOne({ mobile });

               if (user) {
                    return UnAuthorized(res, "one admin account is have with this number");
               }

               const hashPin = bcrypt.hashSync(accountPin, 10);

               const newUser = await new Users({
                    accountPin: hashPin,
                    email,
                    mobile,
                    name,
                    role: "admin",
                    verification: true,
               }).save();

               return Ok(res, `account for admin ${name} is registered`);
          } catch (err) {
               return UnAuthorized(res, err);
          }
     }
     public async GetAllUsers(req: Request, res: Response) {
          try {
               const users = await Users.find({ role: "user" } as any)
                    .sort({
                         createdAt: -1,
                    })
                    .select("verification accountPin email mobile name createdAt");
               return Ok(res, users);
          } catch (err) {
               return UnAuthorized(res, err);
          }
     }

     public async LogoutAdmin(req: Request, res: Response) {
          try {
               res.clearCookie("Authorization");
               return Ok(res, "logged_out");
          } catch (err) {
               return UnAuthorized(res, err);
          }
     }

     public async GetMyAdminProfile(req: Request, res: Response) {
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
}
