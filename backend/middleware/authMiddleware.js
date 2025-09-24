const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  const authHeader = req.headers["authorization"] || "";

  // Debug incoming Authorization header
  console.log("[authMiddleware] Authorization header:", authHeader ? "<present>" : "<missing>");

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  // Support both "Bearer <token>" and raw token
  let token = authHeader;
  if (typeof authHeader === "string") {
    const parts = authHeader.split(" ");
    if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
      token = parts[1];
    }
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("[authMiddleware] Decoded JWT:", decoded);

    const userId = decoded.userId || decoded.id || decoded._id; // be tolerant to different token payloads
    console.log("[authMiddleware] userId from token:", userId);

    if (!userId) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Fetch user with required fields, include settings
    const user = await User.findById(userId).select("_id email settings");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Attach to request
    req.user = user; // {_id, email, settings?}
    req.userId = user._id; // backward compatibility for routes using req.userId

    next();
  } catch (err) {
    console.error("[authMiddleware] JWT verify error:", err && err.message ? err.message : err);
    return res.status(401).json({ message: "Invalid token" });
  }
};
