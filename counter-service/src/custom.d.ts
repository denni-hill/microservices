type User = import("./database/entities/user.entity").User;

interface AuthUserData {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_admin: boolean;
}

interface RequestUser extends User {
  auth: AuthUserData;
}

declare namespace Express {
  export interface Application {
    start(): Promise<void>;
    stop(): Promise<void>;
    server: import("http").Server;
  }

  export interface Request {
    user?: RequestUser;
  }
}
