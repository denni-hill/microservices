class NotFoundError extends Error {
  params = undefined;
  constructor(params, name) {
    this.params = params;
    if (typeof name === "string") super(`${name} is not found`);
    else super("Not found");
  }
}

module.exports = NotFoundError;
