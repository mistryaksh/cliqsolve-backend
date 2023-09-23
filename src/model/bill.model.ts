import mongoose from "mongoose";

const BillSchema = new mongoose.Schema({
     billId: { type: mongoose.Schema.Types.String, required: true },
     details: {
          name: { type: mongoose.Schema.Types.String, required: true },
          amount: { type: mongoose.Schema.Types.String, required: true },
          billStatus: { type: mongoose.Schema.Types.String, required: true },
     },
     billerName: { type: mongoose.Schema.Types.String, required: true },
     platformFees: { type: mongoose.Schema.Types.Number, required: true },
     transferID: { type: mongoose.Schema.Types.String, required: true },
     user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
     cardDigit: { type: mongoose.Schema.Types.String, required: true },
});

export const Bill = mongoose.model("Bill", BillSchema);
