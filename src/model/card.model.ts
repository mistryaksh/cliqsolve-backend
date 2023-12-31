import { CreditCardProps } from "interface";
import mongoose from "mongoose";

const CardSchema = new mongoose.Schema(
     {
          details: {
               number: { type: mongoose.Schema.Types.String, required: true },
               cvv: { type: mongoose.Schema.Types.String, required: true },
               exp: { type: mongoose.Schema.Types.String, required: true },
               ownerName: { type: mongoose.Schema.Types.String, required: true },
               encrypted: { type: mongoose.Schema.Types.String, required: false, default: true },
               cardType: { type: mongoose.Schema.Types.String, required: true, default: "master" },
          },
          appearance: {
               background1: { type: mongoose.Schema.Types.String },
               background2: { type: mongoose.Schema.Types.String },
               textColor: { type: mongoose.Schema.Types.String },
          },
          status: { type: mongoose.Schema.Types.String, enum: ["active" || "disabled"] },
          user: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
     },
     {
          timestamps: true,
     }
);

export const Card = mongoose.model("Card", CardSchema);
