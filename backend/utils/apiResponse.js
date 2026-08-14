/** Standardized API response helpers */

function success(res, data = {}, statusOrMessage = 200, maybeStatus = 200) {
  let status = 200;
  let responseData = typeof data === 'object' && data !== null ? { ...data } : { data };

  if (typeof statusOrMessage === 'number') {
    status = statusOrMessage;
  } else if (typeof statusOrMessage === 'string') {
    responseData.message = statusOrMessage;
    if (typeof maybeStatus === 'number') {
      status = maybeStatus;
    }
  }

  return res.status(status).json({ success: true, ...responseData });
}

function error(res, message, status = 500, details = undefined) {
  const body = { success: false, message: message || 'An error occurred' };
  if (details !== undefined && details !== null) {
    body.error = typeof details === 'object' ? (details.message || JSON.stringify(details)) : details;
  }
  return res.status(typeof status === 'number' ? status : 500).json(body);
}

module.exports = { success, error };

