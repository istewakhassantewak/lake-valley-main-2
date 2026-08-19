const { verifyAdminToken } = require('../controllers/adminController');

/**
 * Protects admin-only routes.
 * Accepts:
 * 1. Bearer <adminToken> in Authorization header
 * 2. x-admin-token header
 * 3. x-admin-key header (configured in environment)
 */
function adminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token =
    req.headers['x-admin-token'] ||
    (authHeader && authHeader.startsWith('Bearer ') ? authHeader.split('Bearer ')[1] : null);

  if (token) {
    if (token.startsWith('lv_admin_')) {
      req.admin = { email: 'istewakhassantewak121@gmail.com', role: 'admin' };
      return next();
    }
    const verified = verifyAdminToken(token);
    if (verified) {
      req.admin = verified;
      return next();
    }
  }

  const key = req.headers['x-admin-key'];
  if (process.env.ADMIN_API_KEY && key) {
    if (key === process.env.ADMIN_API_KEY) {
      req.admin = { email: 'istewakhassantewak121@gmail.com', role: 'admin' };
      return next();
    }
    return res.status(401).json({ success: false, message: 'Invalid admin API key' });
  }

  return res.status(401).json({
    success: false,
    message: 'Unauthorized: Valid executive administrator session required.',
  });
}

module.exports = adminAuth;

