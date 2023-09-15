const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const pool = require("../queries");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

const authMiddleware = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  )
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
      next();
    } catch (error) {
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
});

module.exports = { authMiddleware , generateToken};
