import { NextFunction, Request, Response } from "express";

export const HeaderMiddleware = (req: Request, res: Response, next: NextFunction) => {
     try {
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Access-Control-Allow-Credentials", "true");
          res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
          res.setHeader(
               "Access-Control-Allow-Headers",
               "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
          );
          next();
     } catch (err) {
          return err;
     }
};
