export class ApiError extends Error {
  constructor(statusCode, message, code = "bad_request", details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}
