abstract class BaseError extends Error {
  abstract getResponseBody: { (): unknown };
  abstract getStatusCode: { (): number };
}

export default BaseError;
