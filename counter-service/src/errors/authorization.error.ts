import BaseError from "./base.error";

class AuthorizationError extends BaseError {
  getResponseBody = () => this.message;
  getStatusCode = () => 401;
}

export default AuthorizationError;
