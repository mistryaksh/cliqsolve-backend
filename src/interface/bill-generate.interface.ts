export interface BillGenerateProps {
     billId: string;
     details: {
          name: string;
          amount: string;
     };
     billerName: string;
     platformFees: number;
     transferID: string;
     user: string;
     cardDigit: string;
}

type BillStatus = "processing" | "completed" | "pending" | "rejected";
