import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import LandingPage from '../pages/LandingPage';
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
import NotFoundPage from '../pages/NotFoundPage';
import UnauthorizedPage from '../pages/UnauthorizedPage';
import ProtectedRoute from '../components/ProtectedRoute';

/**
 * CareerBridge Central Application Routing
 * Includes protected routes based on authentication and role.
 */
export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* Landing Page */}
        <Route index element={<LandingPage />} />

        {/* Auth Routes */}
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        {/* Student */}
        <Route
          path="student"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <StudentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="student/opportunities"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <StudentOpportunitiesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="student/applications"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <MyApplicationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="student/applications/:id"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <ApplicationDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="student/mentors"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <MentorDiscoveryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="student/mentors/:id"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <MentorDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="student/mentorship"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <StudentMentorshipPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="student/referrals"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <StudentReferralsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="student/referrals/my"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <MyReferralRequestsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="student/referrals/:id"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <ReferralDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Student Chat */}
        <Route
          path="student/chat"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <ChatPage />
            </ProtectedRoute>
          }
        />

        {/* Opportunity Detail View */}
        <Route path="opportunities/:id" element={<OpportunityDetailPage />} />

        {/* Alumni – dashboard */}
        <Route
          path="alumni"
          element={
            <ProtectedRoute allowedRoles={['ALUMNI']}>
              <AlumniPage />
            </ProtectedRoute>
          }
        />

        {/* Alumni – mentorship management */}
        <Route
          path="alumni/mentorship"
          element={
            <ProtectedRoute allowedRoles={['ALUMNI']}>
              <AlumniMentorshipPage />
            </ProtectedRoute>
          }
        />

        {/* Alumni – referrals hub */}
        <Route
          path="alumni/referrals"
          element={
            <ProtectedRoute allowedRoles={['ALUMNI']}>
              <AlumniReferralsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="alumni/referrals/create"
          element={
            <ProtectedRoute allowedRoles={['ALUMNI']}>
              <CreateReferralPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="alumni/referrals/:id"
          element={
            <ProtectedRoute allowedRoles={['ALUMNI']}>
              <AlumniReferralDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Alumni Chat */}
        <Route
          path="alumni/chat"
          element={
            <ProtectedRoute allowedRoles={['ALUMNI']}>
              <ChatPage />
            </ProtectedRoute>
          }
        />

        {/* Universal Chat */}
        <Route
          path="chat"
          element={
            <ProtectedRoute allowedRoles={['STUDENT', 'ALUMNI']}>
              <ChatPage />
            </ProtectedRoute>
          }
        />

        {/* Universal In-App Notifications */}
        <Route
          path="notifications"
          element={
            <ProtectedRoute allowedRoles={['STUDENT', 'ALUMNI', 'TPO', 'ADMIN']}>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />

        {/* Alumni – profile create / edit */}
        <Route
          path="alumni/profile"
          element={
            <ProtectedRoute allowedRoles={['ALUMNI']}>
              <AlumniProfilePage />
            </ProtectedRoute>
          }
        />

        {/* TPO */}
        <Route
          path="tpo"
          element={
            <ProtectedRoute allowedRoles={['TPO', 'ADMIN']}>
              <TpoPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="tpo/opportunities"
          element={
            <ProtectedRoute allowedRoles={['TPO', 'ADMIN']}>
              <TpoOpportunitiesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="tpo/opportunities/create"
          element={
            <ProtectedRoute allowedRoles={['TPO', 'ADMIN']}>
              <CreateOpportunityPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="tpo/opportunities/:id/edit"
          element={
            <ProtectedRoute allowedRoles={['TPO', 'ADMIN']}>
              <EditOpportunityPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="tpo/opportunities/:id/applicants"
          element={
            <ProtectedRoute allowedRoles={['TPO', 'ADMIN']}>
              <OpportunityApplicantsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="tpo/applications/:id"
          element={
            <ProtectedRoute allowedRoles={['TPO', 'ADMIN']}>
              <TpoApplicationDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Admin – dashboard */}
        <Route
          path="admin"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminPage />
            </ProtectedRoute>
          }
        />

        {/* Admin – Alumni Verification */}
        <Route
          path="admin/alumni-verification"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminAlumniVerificationPage />
            </ProtectedRoute>
          }
        />

        <Route path="unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
