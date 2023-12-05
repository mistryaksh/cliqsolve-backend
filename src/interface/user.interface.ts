export interface UserProps {
     name: string;
     email: string;
     mobile: string;
     accountPin: string;
     role: string;
     verification: boolean;
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
}

export interface SignInAdminProps {
     mobile: string;
     accountPin: string;
}
