export default (req, res, next) => {
  if (!req.user.freelancer) return res.status(403).send("Access denied.");
  next();
};
