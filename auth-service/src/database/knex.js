const Knex = require("knex");
const knexfile = require("./knexfile");

let config;
if (knexfile[process.env.NODE_ENV] !== undefined)
  config = knexfile[process.env.NODE_ENV];
else config = knexfile.default;

/**
 * @type { import("knex").Knex }
 */
const knex = Knex(config);

module.exports = knex;
