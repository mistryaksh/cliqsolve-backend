import crypto from "crypto";

const ENC = "bf3c199c2470cb477d907b1e0917c17b";
const IV = "5183666c72eec9e4";
const ALGO = "aes-256-cbc";

// Encrypt data
export function encryptData(data: string) {
     let cipher = crypto.createCipheriv(ALGO, ENC, IV);
     let encrypted = cipher.update(data, "utf8", "base64");
     encrypted += cipher.final("base64");
     return encrypted;
}

// Decrypt data
export const decrypt = (text: any) => {
     let decipher = crypto.createDecipheriv(ALGO, ENC, IV);
     let decrypted = decipher.update(text, "base64", "utf8");
     return decrypted + decipher.final("utf8");
};
