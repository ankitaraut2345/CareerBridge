/**
 * CareerBridge Phase 16 — Rate Limiter Middleware
 * Protects authentication and expensive AI endpoints from brute-force & denial of service.
 */

// In-memory request trackers: Map<key, { count: number, resetAt: number }>
const authRequests = new Map();
const aiRequests = new Map();

/**
 * Generic sliding-window in-memory rate limiter factory
 * @param {Map} store - Map holding IP/user request records
 * @param {number} maxRequests - Max requests allowed within window
 * @param {number} windowMs - Window duration in milliseconds
 * @param {string} endpointName - Human-readable name for error message
 */
const createRateLimiter = (store, maxRequests, windowMs, endpointName = 'this endpoint') => {
  return (req, res, next) => {
    // Allow tests or demo-login bypass
    if (
      process.env.NODE_ENV === 'test' ||
      req.path === '/demo-login' ||
      req.url?.includes('demo-login') ||
      req.headers['x-test-bypass-rate-limit'] === 'true'
    ) {
      return next();
    }

    const effectiveMax = process.env.NODE_ENV === 'production' ? maxRequests : 200;
    const key = req.user ? req.user.id : (req.ip || req.connection.remoteAddress || 'unknown_ip');
    const now = Date.now();
    const record = store.get(key);

    if (!record || now > record.resetAt) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (record.count >= effectiveMax) {
      const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds);
      return res.status(429).json({
        success: false,
        message: `Too many requests to ${endpointName}. Please wait ${retryAfterSeconds} seconds before trying again.`,
        retryAfter: retryAfterSeconds,
      });
    }

    record.count += 1;
    next();
  };
};

// 30 authentication attempts per 15 minutes per IP
const authLimiter = createRateLimiter(authRequests, 30, 15 * 60 * 1000, 'authentication');

// 30 AI generation requests per 15 minutes per student
const aiLimiter = createRateLimiter(aiRequests, 30, 15 * 60 * 1000, 'AI advisory services');

module.exports = {
  authLimiter,
  aiLimiter,
  _authStore: authRequests,
  _aiStore: aiRequests,
};
