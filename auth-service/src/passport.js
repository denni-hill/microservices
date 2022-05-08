const passport = require("passport");
const LocalStrategy = require("passport-local");

passport.use(new LocalStrategy((login, password, cb) => {}));
