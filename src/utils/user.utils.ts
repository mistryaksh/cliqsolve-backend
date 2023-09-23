import jwt from "jsonwebtoken";
import { Request } from "express";

export const GetTokenFromCookie = (req: Request) => {
     return req.headers.authorization;
};

export const DecodedToken = (req: Request, token: string) => {
     return jwt.decode(token, { json: true });
};
