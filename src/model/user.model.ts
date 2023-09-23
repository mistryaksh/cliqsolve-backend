import { UserProps } from "interface";
import mongoose from "mongoose";

type UserTypes = UserProps & mongoose.Document;

const UserSchema = new mongoose.Schema<UserTypes>(
     {
          email: { type: mongoose.Schema.Types.String, required: true },
          mobile: { type: mongoose.Schema.Types.String, required: true },
          name: { type: mongoose.Schema.Types.String, required: true },
          accountPin: { type: mongoose.Schema.Types.String, required: true },
          role: {
               type: mongoose.Schema.Types.String,
               enum: ["admin", "subAdmin", "user"],
               default: "user",
               require: true,
          },
          verification: { type: mongoose.Schema.Types.Boolean, default: false },
     },
     { timestamps: true }
);

export const Users = mongoose.model<UserTypes>("User", UserSchema);
