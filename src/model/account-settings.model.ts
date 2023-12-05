import { AccountSettingProps } from "interface";
import mongoose from "mongoose";

const AccountSettingsSchema = new mongoose.Schema(
     {
          TwoFA: { type: mongoose.Schema.Types.Boolean, required: true },
          pushNotification: { type: mongoose.Schema.Types.Boolean, required: true },
          storeCardPermission: { type: mongoose.Schema.Types.Boolean, required: true },
     },
     {
          timestamps: true,
     }
);

export const AccountSettings = mongoose.model("account-settings", AccountSettingsSchema);
