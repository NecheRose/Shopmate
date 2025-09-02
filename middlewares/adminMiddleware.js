


// Role hierarchy: higher number = more permissions
const roleHierarchy = {
  user: 1,
  admin: 2,
  superadmin: 3,
};

// Admin or higher
export const adminOrSuperadminOnly = (req, res, next) => {
  // Check if authorized user
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userRole = req.user.role;

  // Check user role
  const userLevel = roleHierarchy[userRole];
  if (!userLevel) {
    return res.status(403).json({ message: "Role not recognized" });
  }

  if (userLevel < roleHierarchy.admin) {
    return res.status(403).json({ message: "Access denied. Admin only" });
  }

  next();
};

// Superadmin only
export const superadminOnly = (req, res, next) => {
  // Check if authorized user
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userRole = req.user.role;

  // Check user role
  const userLevel = roleHierarchy[userRole];
  if (!userLevel) {
    return res.status(403).json({ message: "Role not recognized" });
  }

  if (userLevel < roleHierarchy.superadmin) {
    return res.status(403).json({ message: "Access denied. Superadmin only" });
  }

  next();
};
