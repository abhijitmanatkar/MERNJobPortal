const jwt = require("jsonwebtoken");
const jwtSecret = require("../config/keys").jwtSecret;

function auth(userType) {
  // Return default function if invalid option specified
  if (userType != "Applicant" && userType != "Recruiter") {
    return function (req, res, next) {
      next();
    };
  }

  // Return appropriate auth middleware
  return function (req, res, next) {
    const token = req.header("x-auth-token");

    // Check for token
    if (!token) return res.status(401).json({ msg: "No token" });

    try {
      // Verify token
      const decoded = jwt.verify(token, jwtSecret);
      // Add user from payload
      req.user = decoded;
      //console.log(req.user);
      if (req.user.type != userType)
        return res.status(400).json({ msg: "Invalid token" });
      next();
    } catch (e) {
      return res.status(400).json({ msg: "Invalid token" });
    }
  };
}

module.exports = auth;
