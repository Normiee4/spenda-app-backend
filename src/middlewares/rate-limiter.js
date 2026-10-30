const apiRateLimiter = ({
  windowMS = 15 * 60 * 1000,
  max = 50,
  message = 'Slow Down, Too Many Requests.',
} = {}) => {
  // windowMS = 15 minutes (900000 ms)
  // max = maximum requests allowed per window
  // message = body sent when the limit is exceeded

  // one record per IP: { count, resetTime }
  const client = new Map();

  // remove expired records so the map does not grow forever
  const sweep = setInterval(() => {
    const now = Date.now();
    for (const [key, data] of client.entries()) {
      if (now > data.resetTime) {
        client.delete(key);
      }
    }
  }, windowMS);

  sweep.unref();

  return (req, res, next) => {
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    let data = client.get(key);

    // no record yet, or the previous window expired: start a fresh one
    if (!data || now > data.resetTime) {
      data = { count: 0, resetTime: now + windowMS };
      client.set(key, data);
    }

    data.count += 1;

    if (data.count > max) {
      res.setHeader('Retry-After', Math.ceil((data.resetTime - now) / 1000));
      return res.status(429).json({ success: false, message });
    }

    return next();
  };
};

export default apiRateLimiter;
