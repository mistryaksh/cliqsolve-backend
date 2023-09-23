import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Users } from "model";
import { GetTokenFromCookie, GetUserFromToken, UnAuthorized, VerifyToken } from "utils";

export const AuthToUser = async (req: Request, res: Response, next: NextFunction) => {
     try {
          const token = GetTokenFromCookie(req);

          if (!token) {
               return UnAuthorized(res, "token not found! please login to get access");
          }

          const verifyToken: any = VerifyToken(token);
          const user = await GetUserFromToken(verifyToken);

          if (user.role !== "user") {
               return UnAuthorized(res, "access_denied");
          }

          next();
     } catch (err) {
          console.log("ERROR", err);
          return UnAuthorized(res, err);
     }
};

export const CheckEmailVerified = async (req: Request, res: Response, next: NextFunction) => {
     try {
          const token = GetTokenFromCookie(req);

          const verifyToken: any = VerifyToken(token);
          const user = await GetUserFromToken(verifyToken);

          if (!user.verification) {
               return UnAuthorized(res, "please verify your email");
          }

          next();
     } catch (err) {
          return UnAuthorized(res, err);
     }
};
