import { Request, Response, NextFunction } from "express";
import { BadRequest, UnAuthorized } from "utils";
import jwt from "jsonwebtoken";
import { Users } from "model";

export const AdminRoute = async (req: Request, res: Response, next: NextFunction) => {
     const token = req.headers.authorization;
     if (!token) {
          return UnAuthorized(res, "please login for access");
     }

     const verifyToken: any = jwt.verify(token, process.env.JWT_SECRET);

     if (verifyToken.id) {
          const user = await Users.findById({ _id: verifyToken.id });

          if (user.role !== "admin") {
               return BadRequest(res, "access_denied");
          }
     }

     next();
};
