export interface UserProps {
     name: string;
     email: string;
     mobile: string;
     accountPin: string;
     role: UserRoleType;
     verification: boolean;
}

export enum UserRoleType {
     "admin",
     "subAdmin",
     "user",
}

export interface ILoginResponse {
     token: string;
}

export interface ResetTokenInfo {
     email: string;
}

export interface SignUpProps {
     name: string;
     email: string;
     mobile: string;
     accountPin: string;
}

export interface SignInProps {
     mobile: string;
     accountPin: string;
}
