const Knex = require("knex");
const knexfile = require("./knexfile");

let config;
if (process.env.NODE_ENV === "docker") config = knexfile.docker;
else config = knexfile.default;

/**
 * @type { import("knex").Knex }
 */
const knex = Knex(config);

module.exports = knex;
