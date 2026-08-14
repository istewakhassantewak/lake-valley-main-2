/** Standardized API response helpers */

function sanitizeStatusCode(code, defaultCode = 200) {
  const num = typeof code === 'number' ? code : parseInt(code, 10);
  if (!isNaN(num) && num >= 100 && num <= 599) {
    return num;
  }
  return defaultCode;
}

function success(res, data = {}, statusOrMessage = 200, maybeStatus = 200) {
  let status = 200;
  let responseData = typeof data === 'object' && data !== null ? { ...data } : { data };

  if (typeof statusOrMessage === 'number') {
    status = sanitizeStatusCode(statusOrMessage, 200);
  } else if (typeof statusOrMessage === 'string') {
    responseData.message = statusOrMessage;
    status = sanitizeStatusCode(maybeStatus, 200);
  }

  return res.status(status).json({ success: true, ...responseData });
}

function error(res, message, status = 500, details = undefined) {
  const statusCode = sanitizeStatusCode(status, 500);
  const body = { success: false, message: typeof message === 'string' ? message : 'An error occurred' };
  if (details !== undefined && details !== null) {
    body.error = typeof details === 'object' ? (details.message || JSON.stringify(details)) : details;
  }
  return res.status(statusCode).json(body);
}

module.exports = { success, error, sanitizeStatusCode };


