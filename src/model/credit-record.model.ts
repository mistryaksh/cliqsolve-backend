import { CheckScoreProps } from "interface";
import mongoose from "mongoose";

const CreditRecodeSchema = new mongoose.Schema(
     {
          panNo: { type: mongoose.Schema.Types.String, required: true },
          nameAsPan: { type: mongoose.Schema.Types.String, required: true },
          dob: { type: mongoose.Schema.Types.String, required: true },
          gender: { type: mongoose.Schema.Types.String, required: true },
          user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
     },
     {
          timestamps: true,
     }
);

export const CreditRecord = mongoose.model("Credit-Record", CreditRecodeSchema);
