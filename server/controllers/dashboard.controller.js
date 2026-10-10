const asyncHandler = require('express-async-handler');
const {
  getStudentDashboardData,
  getAlumniDashboardData,
  getTpoDashboardData,
  getAdminDashboardData,
} = require('../services/dashboardStore.service');

/**
 * GET /api/dashboard/student
 * Protected for STUDENT role only
 */
const getStudentDashboard = asyncHandler(async (req, res) => {
  const data = await getStudentDashboardData(req.user.id);
  res.status(200).json({
    success: true,
    data,
  });
});

/**
 * GET /api/dashboard/alumni
 * Protected for ALUMNI role only
 */
const getAlumniDashboard = asyncHandler(async (req, res) => {
  const data = await getAlumniDashboardData(req.user.id);
  res.status(200).json({
    success: true,
    data,
  });
});

/**
 * GET /api/dashboard/tpo
 * Protected for TPO and ADMIN roles
 */
const getTpoDashboard = asyncHandler(async (req, res) => {
  const data = await getTpoDashboardData(req.user);
  res.status(200).json({
    success: true,
    data,
  });
});

/**
 * GET /api/dashboard/admin
 * Protected for ADMIN role only
 */
const getAdminDashboard = asyncHandler(async (req, res) => {
  const data = await getAdminDashboardData(req.user);
  res.status(200).json({
    success: true,
    data,
  });
});

module.exports = {
  getStudentDashboard,
  getAlumniDashboard,
  getTpoDashboard,
  getAdminDashboard,
};
