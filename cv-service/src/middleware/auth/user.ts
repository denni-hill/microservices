export class User {
  token: string;
  sub: string;
  isAdmin: boolean;
  availableResources: string[];

  constructor(data?: unknown) {
    if (data !== undefined) Object.assign(this, data);
    if (typeof this.isAdmin !== "boolean") this.isAdmin = false;
  }
}

export interface IUserAppContext {
  user: User;
}
