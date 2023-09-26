export interface CreditCardProps {
     details: {
          number: string;
          cvv: string;
          exp: string;
          ownerName: string;
          cardType: "master" | "visa" | "express";
     };
     appearance?: {
          background1: string;
          background2: string;
          textColor: string;
     };
     status: "active" | "disabled";
     user: string;
}
