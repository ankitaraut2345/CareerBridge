const asyncHandler = require('express-async-handler');
const {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} = require('../utils/error');
const {
  findOpportunities,
  findOpportunityById,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  getOpportunityStats,
} = require('../services/opportunityStore.service');
const { createNotification } = require('../services/notificationStore.service');

// Helper to normalize array fields from JSON arrays or comma-delimited strings
const normalizeArray = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val.map((s) => String(s).trim()).filter(Boolean);
  if (typeof val === 'string') {
    return val
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
};

/**
 * GET /api/opportunities
 * Student / Public opportunity browsing list (students only see PUBLISHED)
 */
const getOpportunities = asyncHandler(async (req, res) => {
  const {
    search,
    type,
    workMode,
    location,
    department,
    graduationYear,
    sort,
    page,
    limit,
  } = req.query;

  const userRole = req.user ? req.user.role : 'STUDENT';

  const result = await findOpportunities({
    search,
    type,
    workMode,
    location,
    department,
    graduationYear,
    sort,
    page,
    limit,
    userRole,
  });

  res.status(200).json({
    success: true,
    data: result.opportunities,
    pagination: result.pagination,
  });
});

/**
 * GET /api/opportunities/manage
 * TPO / Admin opportunity management feed
 */
const getManageOpportunities = asyncHandler(async (req, res) => {
  const {
    search,
    type,
    workMode,
    location,
    department,
    status,
    sort,
    page,
    limit,
  } = req.query;

  const userRole = req.user.role;
  const createdBy = userRole === 'TPO' ? req.user.id : undefined;

  const result = await findOpportunities({
    search,
    type,
    workMode,
    location,
    department,
    status,
    sort,
    page,
    limit,
    createdBy,
    userRole,
  });

  res.status(200).json({
    success: true,
    data: result.opportunities,
    pagination: result.pagination,
  });
});

/**
 * GET /api/opportunities/stats
 * Aggregate counts for TPO Dashboard summary cards
 */
const getStats = asyncHandler(async (req, res) => {
  const stats = await getOpportunityStats(req.user.id, req.user.role);
  res.status(200).json({
    success: true,
    data: stats,
  });
});

/**
 * GET /api/opportunities/:id
 * Retrieve single opportunity detail
 */
const getOpportunityByIdHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const opp = await findOpportunityById(id);

  if (!opp) {
    throw new NotFoundError('Opportunity not found');
  }

  // Check visibility for non-management users
  const isManagement =
    req.user &&
    (req.user.role === 'ADMIN' ||
      (req.user.role === 'TPO' && String(opp.createdBy) === String(req.user.id)));

  if (!isManagement && opp.status !== 'PUBLISHED') {
    throw new NotFoundError('Opportunity not found or not currently available');
  }

  res.status(200).json({
    success: true,
    data: opp,
  });
});

/**
 * POST /api/opportunities
 * Create a new opportunity (TPO or ADMIN)
 */
const createOpportunityHandler = asyncHandler(async (req, res) => {
  const {
    title,
    type,
    companyName,
    companyLogo,
    companyWebsite,
    description,
    responsibilities,
    requiredSkills,
    preferredSkills,
    role,
    department,
    workMode,
    location,
    employmentType,
    experienceRequired,
    salary,
    salaryPeriod,
    stipend,
    otherBenefits,
    eligibleDepartments,
    eligibleGraduationYears,
    minimumCGPA,
    maximumBacklogs,
    additionalEligibilityCriteria,
    applicationDeadline,
    applicationStartDate,
    externalApplicationUrl,
    applicationInstructions,
    status,
  } = req.body;

  // Strict validation
  if (!title || !title.trim()) {
    throw new BadRequestError('Opportunity title is required');
  }
  if (!type || !['PLACEMENT', 'INTERNSHIP'].includes(type.toUpperCase())) {
    throw new BadRequestError('Opportunity type must be either PLACEMENT or INTERNSHIP');
  }
  if (!companyName || !companyName.trim()) {
    throw new BadRequestError('Company name is required');
  }
  if (!role || !role.trim()) {
    throw new BadRequestError('Role is required');
  }
  if (!description || !description.trim()) {
    throw new BadRequestError('Job description is required');
  }
  if (!location || !location.trim()) {
    throw new BadRequestError('Location is required');
  }
  if (!applicationDeadline) {
    throw new BadRequestError('Application deadline is required');
  }

  const deadlineDate = new Date(applicationDeadline);
  if (isNaN(deadlineDate.getTime())) {
    throw new BadRequestError('Invalid application deadline date format');
  }

  const initialStatus = status ? status.toUpperCase() : 'DRAFT';
  if (!['DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED'].includes(initialStatus)) {
    throw new BadRequestError('Invalid opportunity status value');
  }

  const parsedCGPA = minimumCGPA !== undefined ? Number(minimumCGPA) : 0;
  if (isNaN(parsedCGPA) || parsedCGPA < 0 || parsedCGPA > 10) {
    throw new BadRequestError('Minimum CGPA must be a number between 0.0 and 10.0');
  }

  const parsedBacklogs = maximumBacklogs !== undefined ? Number(maximumBacklogs) : 0;
  if (isNaN(parsedBacklogs) || parsedBacklogs < 0) {
    throw new BadRequestError('Maximum backlogs must be a non-negative number');
  }

  const opportunityData = {
    title: title.trim(),
    type: type.toUpperCase(),
    companyName: companyName.trim(),
    companyLogo: companyLogo ? companyLogo.trim() : '',
    companyWebsite: companyWebsite ? companyWebsite.trim() : '',
    description: description.trim(),
    responsibilities: responsibilities ? responsibilities.trim() : '',
    requiredSkills: normalizeArray(requiredSkills),
    preferredSkills: normalizeArray(preferredSkills),
    role: role.trim(),
    department: department ? department.trim() : '',
    workMode: workMode ? workMode.toUpperCase() : 'ONSITE',
    location: location.trim(),
    employmentType: employmentType || (type.toUpperCase() === 'INTERNSHIP' ? 'Internship' : 'Full-time'),
    experienceRequired: experienceRequired || 'Fresher',
    salary: salary ? salary.trim() : '',
    salaryPeriod: salaryPeriod || 'Per Annum',
    stipend: stipend ? stipend.trim() : '',
    otherBenefits: otherBenefits ? otherBenefits.trim() : '',
    eligibleDepartments: normalizeArray(eligibleDepartments),
    eligibleGraduationYears: normalizeArray(eligibleGraduationYears).map(Number).filter(Boolean),
    minimumCGPA: parsedCGPA,
    maximumBacklogs: parsedBacklogs,
    additionalEligibilityCriteria: additionalEligibilityCriteria ? additionalEligibilityCriteria.trim() : '',
    applicationDeadline: deadlineDate,
    applicationStartDate: applicationStartDate ? new Date(applicationStartDate) : new Date(),
    externalApplicationUrl: externalApplicationUrl ? externalApplicationUrl.trim() : '',
    applicationInstructions: applicationInstructions ? applicationInstructions.trim() : '',
    status: initialStatus,
    createdBy: req.user.id,
    publishedAt: initialStatus === 'PUBLISHED' ? new Date() : undefined,
  };

  const created = await createOpportunity(opportunityData);

  if (initialStatus === 'PUBLISHED') {
    try {
      const oppId = created.id || created._id;
      createNotification({
        recipientId: 'demo_student',
        type: 'OPPORTUNITY_PUBLISHED',
        title: 'New Opportunity Available',
        message: `A new ${created.type === 'INTERNSHIP' ? 'Internship' : 'Placement'} opportunity for ${created.role || created.title} at ${created.companyName} is now open for applications.`,
        relatedEntityType: 'Opportunity',
        relatedEntityId: oppId,
        actionUrl: `/opportunities/${oppId}`,
      }).catch((err) => console.error('[Notification] Opportunity notif error:', err.message));
    } catch (notifErr) {
      console.error('[Notification] Opportunity publish trigger error:', notifErr.message);
    }
  }

  res.status(201).json({
    success: true,
    message: initialStatus === 'PUBLISHED' ? 'Opportunity created and published successfully' : 'Opportunity saved as draft',
    data: created,
  });
});

/**
 * PUT /api/opportunities/:id
 * Update existing opportunity (Owner TPO or Admin)
 */
const updateOpportunityHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const existing = await findOpportunityById(id);

  if (!existing) {
    throw new NotFoundError('Opportunity not found');
  }

  // Authorization check
  if (req.user.role !== 'ADMIN' && String(existing.createdBy) !== String(req.user.id)) {
    throw new ForbiddenError('You are not authorized to update this opportunity');
  }

  const updates = { ...req.body };

  // Never allow modifying immutable properties
  delete updates._id;
  delete updates.id;
  delete updates.createdBy;
  delete updates.createdAt;

  updates.updatedBy = req.user.id;

  if (updates.type) updates.type = updates.type.toUpperCase();
  if (updates.workMode) updates.workMode = updates.workMode.toUpperCase();
  if (updates.status) {
    updates.status = updates.status.toUpperCase();
    if (!['DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED'].includes(updates.status)) {
      throw new BadRequestError('Invalid status value');
    }
    if (updates.status === 'PUBLISHED' && !existing.publishedAt) {
      updates.publishedAt = new Date();
    }
    if (updates.status === 'CLOSED' && !existing.closedAt) {
      updates.closedAt = new Date();
    }
  }

  if (updates.requiredSkills) updates.requiredSkills = normalizeArray(updates.requiredSkills);
  if (updates.preferredSkills) updates.preferredSkills = normalizeArray(updates.preferredSkills);
  if (updates.eligibleDepartments) updates.eligibleDepartments = normalizeArray(updates.eligibleDepartments);
  if (updates.eligibleGraduationYears) {
    updates.eligibleGraduationYears = normalizeArray(updates.eligibleGraduationYears).map(Number).filter(Boolean);
  }
  if (updates.minimumCGPA !== undefined) updates.minimumCGPA = Number(updates.minimumCGPA);
  if (updates.maximumBacklogs !== undefined) updates.maximumBacklogs = Number(updates.maximumBacklogs);
  if (updates.applicationDeadline) updates.applicationDeadline = new Date(updates.applicationDeadline);

  const updated = await updateOpportunity(id, updates);

  res.status(200).json({
    success: true,
    message: 'Opportunity updated successfully',
    data: updated,
  });
});

/**
 * PATCH /api/opportunities/:id/status
 * Transition status (DRAFT -> PUBLISHED -> CLOSED -> ARCHIVED)
 */
const updateOpportunityStatusHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    throw new BadRequestError('Status value is required');
  }

  const normalizedStatus = status.toUpperCase();
  if (!['DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED'].includes(normalizedStatus)) {
    throw new BadRequestError(`Invalid status '${status}'. Must be DRAFT, PUBLISHED, CLOSED, or ARCHIVED.`);
  }

  const existing = await findOpportunityById(id);
  if (!existing) {
    throw new NotFoundError('Opportunity not found');
  }

  if (req.user.role !== 'ADMIN' && String(existing.createdBy) !== String(req.user.id)) {
    throw new ForbiddenError('You are not authorized to update this opportunity');
  }

  const updates = {
    status: normalizedStatus,
    updatedBy: req.user.id,
  };

  if (normalizedStatus === 'PUBLISHED' && !existing.publishedAt) {
    updates.publishedAt = new Date();
  }
  if (normalizedStatus === 'CLOSED' && !existing.closedAt) {
    updates.closedAt = new Date();
  }

  const updated = await updateOpportunity(id, updates);

  if (normalizedStatus === 'PUBLISHED') {
    try {
      createNotification({
        recipientId: 'demo_student',
        type: 'OPPORTUNITY_PUBLISHED',
        title: 'New Opportunity Available',
        message: `A new ${updated.type === 'INTERNSHIP' ? 'Internship' : 'Placement'} opportunity for ${updated.role || updated.title} at ${updated.companyName} is now open for applications.`,
        relatedEntityType: 'Opportunity',
        relatedEntityId: id,
        actionUrl: `/opportunities/${id}`,
      }).catch((err) => console.error('[Notification] Opportunity notif error:', err.message));
    } catch (notifErr) {
      console.error('[Notification] Opportunity publish trigger error:', notifErr.message);
    }
  }

  res.status(200).json({
    success: true,
    message: `Opportunity status transitioned to ${normalizedStatus}`,
    data: updated,
  });
});

/**
 * DELETE /api/opportunities/:id
 * Delete opportunity (Owner TPO or Admin)
 */
const deleteOpportunityHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const existing = await findOpportunityById(id);

  if (!existing) {
    throw new NotFoundError('Opportunity not found');
  }

  if (req.user.role !== 'ADMIN' && String(existing.createdBy) !== String(req.user.id)) {
    throw new ForbiddenError('You are not authorized to delete this opportunity');
  }

  await deleteOpportunity(id);

  res.status(200).json({
    success: true,
    message: 'Opportunity deleted successfully',
  });
});

module.exports = {
  getOpportunities,
  getManageOpportunities,
  getStats,
  getOpportunityById: getOpportunityByIdHandler,
  createOpportunity: createOpportunityHandler,
  updateOpportunity: updateOpportunityHandler,
  updateOpportunityStatus: updateOpportunityStatusHandler,
  deleteOpportunity: deleteOpportunityHandler,
};
