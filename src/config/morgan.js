const fs = require("fs");
const path = require("path");

const morganLog = fs.createWriteStream(
  path.join(__dirname, "../logs", "morgan.log"),
  { flag: "a" }
);

module.exports = morganLog;
