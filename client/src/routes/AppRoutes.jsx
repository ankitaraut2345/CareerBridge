import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import PortalLayout from '../layouts/PortalLayout';
import LandingPage from '../pages/LandingPage';
import SmartHomeRouter from '../components/SmartHomeRouter';
import RoleRoute from '../components/RoleRoute';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import StudentPage from '../pages/StudentPage';
import AlumniPage from '../pages/AlumniPage';
import AlumniProfilePage from '../pages/AlumniProfilePage';
import TpoPage from '../pages/TpoPage';
import AdminPage from '../pages/AdminPage';
import AdminAlumniVerificationPage from '../pages/AdminAlumniVerificationPage';
import StudentOpportunitiesPage from '../pages/student/StudentOpportunitiesPage';
import MyApplicationsPage from '../pages/student/MyApplicationsPage';
import ApplicationDetailPage from '../pages/student/ApplicationDetailPage';
import OpportunityDetailPage from '../pages/OpportunityDetailPage';
import MentorDiscoveryPage from '../pages/student/MentorDiscoveryPage';
import MentorDetailPage from '../pages/student/MentorDetailPage';
import StudentMentorshipPage from '../pages/student/StudentMentorshipPage';
import AlumniMentorshipPage from '../pages/alumni/AlumniMentorshipPage';
import StudentReferralsPage from '../pages/student/StudentReferralsPage';
import ReferralDetailPage from '../pages/student/ReferralDetailPage';
import MyReferralRequestsPage from '../pages/student/MyReferralRequestsPage';
import AlumniReferralsPage from '../pages/alumni/AlumniReferralsPage';
import CreateReferralPage from '../pages/alumni/CreateReferralPage';
import AlumniReferralDetailPage from '../pages/alumni/AlumniReferralDetailPage';
import ChatPage from '../pages/chat/ChatPage';
import TpoOpportunitiesPage from '../pages/tpo/TpoOpportunitiesPage';
import OpportunityApplicantsPage from '../pages/tpo/OpportunityApplicantsPage';
import TpoApplicationDetailPage from '../pages/tpo/TpoApplicationDetailPage';
import CreateOpportunityPage from '../pages/tpo/CreateOpportunityPage';
import EditOpportunityPage from '../pages/tpo/EditOpportunityPage';
import NotificationsPage from '../pages/NotificationsPage';
import SavedOpportunitiesPage from '../pages/SavedOpportunitiesPage';
import AiAssistantPage from '../pages/AiAssistantPage';
import CareerRoadmapPage from '../pages/CareerRoadmapPage';
import StudentProfilePage from '../pages/StudentProfilePage';
import SettingsPage from '../pages/SettingsPage';
import HelpSupportPage from '../pages/HelpSupportPage';
import NotFoundPage from '../pages/NotFoundPage';
import UnauthorizedPage from '../pages/UnauthorizedPage';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../context/AuthContext';

/**
 * Canonical Redirect Helpers for Legacy Routes
 */
const LegacyDashboardRedirect = () => {
  const { user } = useAuth();
  const path = user?.role ? `/${user.role.toLowerCase()}` : '/login';
  return <Navigate to={path} replace />;
};

const LegacyOpportunitiesRedirect = () => {
  const { user } = useAuth();
  if (user?.role === 'TPO' || user?.role === 'ADMIN') {
    return <Navigate to="/tpo/opportunities" replace />;
  }
  return <Navigate to="/student/opportunities" replace />;
};

const LegacyMentorshipRedirect = () => {
  const { user } = useAuth();
  if (user?.role === 'ALUMNI') {
    return <Navigate to="/alumni/mentorship" replace />;
  }
  return <Navigate to="/student/mentorship" replace />;
};

const LegacyReferralsRedirect = () => {
  const { user } = useAuth();
  if (user?.role === 'ALUMNI') {
    return <Navigate to="/alumni/referrals" replace />;
  }
  return <Navigate to="/student/referrals" replace />;
};

const LegacyProfileRedirect = () => {
  const { user } = useAuth();
  if (user?.role === 'ALUMNI') {
    return <Navigate to="/alumni/profile" replace />;
  }
  if (user?.role === 'STUDENT') {
    return <Navigate to="/student/profile" replace />;
  }
  return <Navigate to="/settings" replace />;
};

const LegacyApplicationsRedirect = () => {
  const { user } = useAuth();
  if (user?.role === 'STUDENT') {
    return <Navigate to="/student/applications" replace />;
  }
  if (user?.role === 'TPO' || user?.role === 'ADMIN') {
    return <Navigate to="/tpo/opportunities" replace />;
  }
  return <Navigate to={`/${user?.role?.toLowerCase() || 'login'}`} replace />;
};

/**
 * CareerBridge Central Application Routing
 * - Authenticated SaaS portal routes use PortalLayout (Left Sidebar + Header + User Avatar dropdown)
 * - Public routes use MainLayout (Navbar + Footer)
 */
export const AppRoutes = () => {
  return (
    <Routes>
      {/* ─── 1. Authenticated SaaS Portal Routes (Matches All Approved Mockups) ─── */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['STUDENT', 'ALUMNI', 'TPO', 'ADMIN']}>
            <PortalLayout />
          </ProtectedRoute>
        }
      >
        {/* Student Pages */}
        <Route
          path="student"
          element={
            <RoleRoute allowedRoles={['STUDENT']}>
              <StudentPage />
            </RoleRoute>
          }
        />
        <Route path="student/opportunities" element={<StudentOpportunitiesPage />} />
        <Route
          path="student/applications"
          element={
            <RoleRoute allowedRoles={['STUDENT']}>
              <MyApplicationsPage />
            </RoleRoute>
          }
        />
        <Route path="student/applications/:id" element={<ApplicationDetailPage />} />
        <Route path="student/saved-opportunities" element={<SavedOpportunitiesPage />} />
        <Route path="student/ai-assistant" element={<AiAssistantPage />} />
        <Route path="student/roadmap" element={<CareerRoadmapPage />} />
        <Route path="student/mentors" element={<MentorDiscoveryPage />} />
        <Route path="student/mentors/:id" element={<MentorDetailPage />} />
        <Route path="student/mentorship" element={<StudentMentorshipPage />} />
        <Route path="student/referrals" element={<StudentReferralsPage />} />
        <Route path="student/referrals/my" element={<MyReferralRequestsPage />} />
        <Route path="student/referrals/:id" element={<ReferralDetailPage />} />
        <Route path="student/profile" element={<StudentProfilePage />} />
        <Route path="student/chat" element={<ChatPage />} />

        {/* Opportunity Detail in Portal */}
        <Route path="opportunities/:id" element={<OpportunityDetailPage />} />

        {/* Alumni Pages */}
        <Route
          path="alumni"
          element={
            <RoleRoute allowedRoles={['ALUMNI', 'ADMIN']}>
              <AlumniPage />
            </RoleRoute>
          }
        />
        <Route path="alumni/profile" element={<AlumniProfilePage />} />
        <Route path="alumni/mentorship" element={<AlumniMentorshipPage />} />
        <Route path="alumni/referrals" element={<AlumniReferralsPage />} />
        <Route
          path="alumni/referrals/create"
          element={
            <RoleRoute allowedRoles={['ALUMNI', 'ADMIN']}>
              <CreateReferralPage />
            </RoleRoute>
          }
        />
        <Route path="alumni/referrals/:id" element={<AlumniReferralDetailPage />} />
        <Route path="alumni/chat" element={<ChatPage />} />

        {/* TPO Pages */}
        <Route
          path="tpo"
          element={
            <RoleRoute allowedRoles={['TPO', 'ADMIN']}>
              <TpoPage />
            </RoleRoute>
          }
        />
        <Route path="tpo/opportunities" element={<TpoOpportunitiesPage />} />
        <Route
          path="tpo/opportunities/create"
          element={
            <RoleRoute allowedRoles={['TPO', 'ADMIN']}>
              <CreateOpportunityPage />
            </RoleRoute>
          }
        />
        <Route
          path="tpo/opportunities/:id/edit"
          element={
            <RoleRoute allowedRoles={['TPO', 'ADMIN']}>
              <EditOpportunityPage />
            </RoleRoute>
          }
        />
        <Route
          path="tpo/opportunities/:id/applicants"
          element={
            <RoleRoute allowedRoles={['TPO', 'ADMIN']}>
              <OpportunityApplicantsPage />
            </RoleRoute>
          }
        />
        <Route path="tpo/applications/:id" element={<TpoApplicationDetailPage />} />

        {/* Admin Pages */}
        <Route
          path="admin"
          element={
            <RoleRoute allowedRoles={['ADMIN']}>
              <AdminPage />
            </RoleRoute>
          }
        />
        <Route
          path="admin/alumni-verification"
          element={
            <RoleRoute allowedRoles={['ADMIN']}>
              <AdminAlumniVerificationPage />
            </RoleRoute>
          }
        />

        {/* Universal SaaS Pages across all roles */}
        <Route path="chat" element={<ChatPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="help" element={<HelpSupportPage />} />
        <Route path="support" element={<HelpSupportPage />} />

        {/* Canonical Aliases for Legacy Routes within Portal */}
        <Route path="dashboard" element={<LegacyDashboardRedirect />} />
        <Route path="opportunities" element={<LegacyOpportunitiesRedirect />} />
        <Route path="applications" element={<LegacyApplicationsRedirect />} />
        <Route path="mentorship" element={<LegacyMentorshipRedirect />} />
        <Route path="referrals" element={<LegacyReferralsRedirect />} />
        <Route path="profile" element={<LegacyProfileRedirect />} />
      </Route>

      {/* ─── 2. Public / Guest Routes with MainLayout (Navbar + Hero + Footer) ─── */}
      <Route path="/" element={<MainLayout />}>
        {/*
          SmartHomeRouter on index:
          - Visitors landing on http://localhost:5173/ get the public LandingPage.
          - Authenticated users backing into "/" are instantly replaced with their canonical dashboard.
        */}
        <Route index element={<SmartHomeRouter />} />
        <Route path="landing" element={<LandingPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="dashboard" element={<LegacyDashboardRedirect />} />
        <Route path="opportunities" element={<LegacyOpportunitiesRedirect />} />
        <Route path="unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
