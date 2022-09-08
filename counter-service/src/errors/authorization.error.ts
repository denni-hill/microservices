import BaseError from "./base.error";

class AuthorizationError extends BaseError {
  constructor(
    message = "Unauthorized",
    public params?: Record<string, unknown>
  ) {
    super(message);
  }
  getResponseBody = () => this.message;
  getStatusCode = () => 401;
}

export default AuthorizationError;
