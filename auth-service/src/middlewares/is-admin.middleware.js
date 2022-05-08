async function isAdmin(req, res, next) {
  if (req.user === undefined) res.status(401).send();
  else if (req.user.is_admin !== true) res.status(403).send();
  else next();
}

module.exports = isAdmin;
