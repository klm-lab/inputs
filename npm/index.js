if (process.env.NODE_ENV === "production") {
  module.exports = require("./inputs.min.js");
} else {
  module.exports = require("./inputs.js");
}
