const express = require('express');
const router = express.Router();
const {
  getOpportunities,
  getManageOpportunities,
  getStats,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  updateOpportunityStatus,
  deleteOpportunity,
} = require('../controllers/opportunity.controller');
const {
  checkEligibilityHandler,
  applyToOpportunityHandler,
  getOpportunityApplicantsHandler,
} = require('../controllers/application.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { verifyToken } = require('../utils/jwt');
const { findUserById } = require('../services/userStore.service');

/**
 * Optional authentication middleware:
 * Attaches req.user if a valid token is provided, but does not block requests if omitted.
 */
const optionalAuthenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = verifyToken(token);
      const user = await findUserById(decoded.userId);
      if (user && user.isActive !== false) {
        req.user = {
          id: user._id ? user._id.toString() : user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          verificationStatus: user.verificationStatus,
        };
      }
    } catch {
      // Ignore token failure for public/optional endpoints
    }
  }
  next();
};

// ── Public / Student browsing ──────────────────────────────────────────
router.get('/', optionalAuthenticate, getOpportunities);

// ── TPO / Admin Management & Analytics ──────────────────────────────────
router.get('/manage', authenticate, authorize('TPO', 'ADMIN'), getManageOpportunities);
router.get('/stats', authenticate, authorize('TPO', 'ADMIN'), getStats);

// ── Opportunity Detail (by ID) ──────────────────────────────────────────
router.get('/:id', optionalAuthenticate, getOpportunityById);

// ── Student Eligibility & Application ───────────────────────────────────
router.get('/:id/eligibility', authenticate, authorize('STUDENT', 'ADMIN'), checkEligibilityHandler);
router.post('/:id/apply', authenticate, authorize('STUDENT'), applyToOpportunityHandler);

// ── TPO Applicants View for Opportunity ─────────────────────────────────
router.get('/:id/applications', authenticate, authorize('TPO', 'ADMIN'), getOpportunityApplicantsHandler);

// ── TPO / Admin Opportunity Lifecycle Mutations ─────────────────────────
router.post('/', authenticate, authorize('TPO', 'ADMIN'), createOpportunity);
router.put('/:id', authenticate, authorize('TPO', 'ADMIN'), updateOpportunity);
router.patch('/:id/status', authenticate, authorize('TPO', 'ADMIN'), updateOpportunityStatus);
router.delete('/:id', authenticate, authorize('TPO', 'ADMIN'), deleteOpportunity);

module.exports = router;
