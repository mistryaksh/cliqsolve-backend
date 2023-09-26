import { Request } from "express";
import jwt from "jsonwebtoken";
import { Users } from "model";
import config from "config";

export const VerifyToken = (token: string) => {
     return jwt.verify(token, process.env.JWT_SECRET || config.get("JWT_SECRET"));
};

export const GetUserFromToken = async (verifyToken: any) => {
     const user = await Users.findById({ _id: verifyToken.id });
     return user;
};
