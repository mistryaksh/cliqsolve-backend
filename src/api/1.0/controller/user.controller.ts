import { Request, Response } from "express";
import { IController, IControllerRoutes, SignInProps, SignUpProps } from "interface";
import { Users } from "model";
import { BadRequest, DecodedToken, GetTokenFromCookie, Ok, UnAuthorized } from "utils";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AuthToUser } from "middleware";
import nodemailer from "nodemailer";
import config from "config";

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
          this.routes.push({
               handler: this.SendingVerificationMail,
               method: "POST",
               path: "/verify",
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
               const user = await Users.findOne({ mobile: mobile });

               if (user) {
                    return UnAuthorized(res, "Oops you have the registered account with this number please login");
               }

               const sendMail = nodemailer.createTransport({
                    service: "gmail",
                    auth: {
                         user: "mistryaksh1998@gmail.com",
                         pass: "rwumpcnbycrmmwno",
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

               return Ok(res, `${saveUser.name} your account is registered with us, please login!`);
          } catch (err) {
               console.log(err);
               return UnAuthorized(res, err);
          }
     }

     public async LoginUser(req: Request, res: Response) {
          try {
               const { mobile, accountPin }: SignInProps = req.body;

               console.log(mobile, accountPin);
               const userExist = await Users.findOne({ mobile });

               if (!userExist) {
                    return UnAuthorized(res, "no user registered with this mobile number");
               }

               if (userExist.role !== "user") {
                    return BadRequest(res, "access_denied");
               }

               if (!bcrypt.compareSync(accountPin, userExist.accountPin)) {
                    return UnAuthorized(res, "You have entered wrong PIN!");
               }

               const token = jwt.sign(
                    {
                         id: userExist._id,
                         mobile: mobile,
                    },
                    process.env.JWT_SECRET || config.get("JWT_SECRET") || "JSONWEBTOKENSECRET" || "3d",
                    { expiresIn: process.env.JWT_EXPIRE || config.get("JWT_EXPIRE") }
               );

               res.cookie("token", token, { httpOnly: true });

               return Ok(res, {
                    token,
                    credentials: {
                         mobile: userExist.mobile,
                         pin: userExist.accountPin,
                    },
               });
          } catch (err) {
               console.log(err);
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
               console.log(err);
               return UnAuthorized(res, err);
          }
     }

     public async SendingVerificationMail(req: Request, res: Response) {
          try {
               const { email } = req.body;

               const user = await Users.findOne({ email });

               if (!email) {
                    return UnAuthorized(res, "email address not found");
               }

               const transporter = await nodemailer.createTransport({
                    service: "gmail",
                    auth: {
                         user: process.env.APP_EMAIL,
                         pass: process.env.APP_PASSWORD,
                    },
               });

               console.log(transporter);
               const token = jwt.sign(
                    {
                         email: email,
                    },
                    process.env.JWT_SECRET,
                    { expiresIn: process.env.JWT_EXPIRE }
               );

               const data = await transporter.sendMail({
                    from: process.env.APP_EMAIL,
                    to: email,
                    subject: "CliqSolve Fintech Needs to verify your email.",
                    html: `<script src="https://cdn.tailwindcss.com"></script>

                    <script>
                         tailwind.config = {
                              theme: {
                                   extend: {
                                        colors: {
                                             primary: {
                                                  50: "#F9F5FF",
                                                  100: "#C6D4F1",
                                                  200: "#A0B6EA",
                                                  300: "#7896E4",
                                                  400: "#4F73DF",
                                                  500: "#254EDB",
                                                  600: "#2145BF",
                                                  700: "#2349CC",
                                                  800: "#2044BE",
                                                  900: "#13286D",
                                             },
                                        },
                                        fontFamily: {
                                             sans: ["'Manrope', sans-serif"],
                                        },
                                   },
                              },
                         };
                    </script>
                    <style>
                         @import url("https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600;700;800&display=swap");
                    </style>
                    <body class="w-screen relative flex justify-center items-center h-screen">
                         <div class="absolute top-0 w-full bg-primary-500 h-[50%] -z-10"></div>
                         <div class="bg-white w-[70%] px-5 py-8 flex flex-col justify-center items-center shadow-xl">
                              <h1 class="text-6xl font-semibold font-sans capitalize text-primary-500">Hey! ${
                                   user.name
                              } welcome!</h1>
                              <h6 class="text-gray-500 my-10 font-semibold">
                                   We're excited to have you get started! First you need to confirm your account. Just click the button
                                   below.
                              </h6>
                              <a  href=${`http://192.168.0.105:3001/auth/verification-service/${token}`} class="bg-gray-900 px-10 mb-10 py-3 rounded-md">
                                   <span class="text-white uppercase font-semibold">Confirm my account</span>
                              </a>
                              <p class="text-gray-500">
                                   Lorem ipsum dolor sit amet consectetur adipisicing elit. Praesentium necessitatibus corrupti recusandae
                                   voluptatem error dolorum ipsum modi ducimus earum. Sed.
                                   <a href="#" class="text-primary-500 underline"
                                        >Lorem ipsum, dolor sit amet consectetur adipisicing elit. Non, hic.</a
                                   >
                              </p>
                              <p class="mt-10 w-full text-left">
                                   If you have any questions. Please feel free to inform - We're always ready to help out.
                              </p>
                              <div class="text-left w-full">
                                   <h6>Cheers,</h6>
                                   <p class="text-primary-500 font-semibold text-xl">Cliqsolve Fintech Team</p>
                              </div>
                         </div>
                    </body>
                    `,
               });
               return Ok(res, data.response);
          } catch (err) {
               return UnAuthorized(res, err);
          }
     }

     public async VerifyEmail(req: Request, res: Response) {
          try {
               const token = req.params.token;
               const verifyToken = jwt.verify(token, process.env.JWT_SECRET) as any;
               const user = await Users.findOneAndUpdate(
                    { email: verifyToken.email },
                    { $set: { verification: true } }
               );

               return Ok(res, `${user.email} is now verified!`);
          } catch (err) {
               return err;
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
