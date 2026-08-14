/**
 * Global Express Error Handling Middleware
 * Securely logs errors on the server without leaking stack traces or database internals to the client.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  // 1. Secure server-side logging
  console.error(`[SERVER ERROR] ${req.method} ${req.originalUrl}:`, {
    name: err.name,
    message: err.message,
    code: err.code,
    stack: err.stack,
    ip: req.ip,
    timestamp: new Date().toISOString(),
  });

  // 2. CORS Policy Violation
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'Access denied by CORS policy',
    });
  }

  // 3. Determine status code and sanitize response message
  let statusCode = err.status || err.statusCode || 500;
  let clientMessage = 'An unexpected error occurred. Please try again later.';

  // Mongoose / MongoDB specific error sanitization
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const details = Object.values(err.errors || {}).map((e) => e.message);
    clientMessage = details.length > 0 ? details.join(', ') : 'Validation failed for submitted data.';
  } else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    clientMessage = `A record with this ${field} already exists.`;
  } else if (err.name === 'CastError') {
    statusCode = 400;
    clientMessage = 'Invalid ID or parameter format provided.';
  } else if (statusCode < 500 && err.message) {
    // Known client operational error (400, 401, 403, 404, etc.)
    clientMessage = err.message;
  }

  // 4. Return clean, secure JSON response
  return res.status(statusCode).json({
    success: false,
    message: clientMessage,
  });
}

module.exports = errorHandler;
