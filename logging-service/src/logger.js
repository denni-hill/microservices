const path = require("path");
const fs = require("fs").promises;
const { createWriteStream } = require("fs");

let stream = undefined;

function getFilePath() {
  const filePath = path
    .join(
      process.cwd(),
      "..",
      "services.logs",
      new Date().toISOString() + ".txt"
    )
    .replaceAll(":", "-");

  if (stream !== undefined) stream.end();

  fs.open(filePath, "w").then((f) => {
    f.close();
    stream = createWriteStream(filePath);
  });

  return filePath;
}

let filePath = getFilePath();

const logger = new (class {
  content = [];

  log(toLog) {
    if (toLog !== undefined && toLog !== null) this.content.push(toLog);
    this.persistLog([...this.content]);
    this.content = [];
    console.log(toLog);
  }

  async persistLog(contentToPersist) {
    try {
      if ((await fs.stat(filePath)).size >= 5 * 1024) filePath = getFilePath();

      stream.write(
        contentToPersist
          .map((content) => {
            const toLog = {
              url: content.url,
              errors: content.errors,
              warnings: content.warnings,
              body: content.body,
              status: content.status,
              responseTime: content.responseTime
            };
            return `${new Date(content.timestamp).toISOString()} [${
              content.sender
            }]: ${JSON.stringify(toLog)}`;
          })
          .join("\n") + "\n"
      );
    } catch (e) {
      if (e.code === "ENOENT") {
        filePath = getFilePath();
        this.persistLog(contentToPersist);
      }
    }
  }
})();

module.exports = logger;
