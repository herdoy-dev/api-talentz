export default (req, res, next) => {
  if (!req.user.client) return res.status(403).send("Access denied.");
  next();
};
