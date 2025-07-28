import React, { Fragment, Suspense, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { lazy } from "react";
import Loader from "../Components/Loader";
import ProRecruitor from "../Pages/ProRecruitor";
import ScrollToTop from "../Shared/ScrollToTop";// Importing ScrollToTop
import PublicLayout from "../Layout/PublicLayout";


import "../App.css";
import { AuthProvider } from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";
import ResumeParser from "../components/ResumeParser";

import Recruiter from "../pages/Recruiter";
import ResumeRecruiterDetails from "../pages/ResumeRecruiterDetails";
import RecruiterAuthentication from "../pages/RecruiterAuthentication";
import RecruiterSignup from "../components/RecruiterSignupByManager.jsx";
import Register from "../pages/Manager/Register";
import Company from "../pages/Manager/Company";
import Jobs from "../pages/jobs/[companyid].jsx";
import AssignJobs from "../pages/jobs/[jobid].jsx";
import ForgotPassword from "../pages/Manager/ForgotPassword.jsx";
import ResetPassword from "../pages/Manager/ResetPassword.jsx";
import ChangeEmail from "../pages/Manager/ChangeEmail.jsx";
import ChangeEmailRequest from "../pages/Manager/ChangeEmailRequest.jsx";
import Manager from "../pages/Manager/Manager.jsx";
import Myteam from "../pages/Manager/Navigation/Myteam.jsx";
import RecruiterDetails from "../components/RecruiterDetails.jsx";
import ListOfJobs from "../pages/Manager/Navigation/ListOfJobs.jsx";
import ScorecardReviews from "../pages/Manager/Navigation/ScorecardReviews.jsx";
import Settings from "../pages/Manager/Navigation/Settings.jsx";
import AdminRegister from "../pages/Admin/Register.jsx";
import Admin from "../pages/Admin/Admin.jsx";
import MyTeam from "../pages/Admin/Navigation/MyTeam.jsx";
import Dashboard from "../pages/Admin/Navigation/Dashboard.jsx";
import CompanyManagement from "../pages/Admin/Navigation/CompanyManagement.jsx";
import AdminJobs from "../pages/Admin/Navigation/Jobs.jsx";
import AdminSettings from "../pages/Admin/Navigation/Settings.jsx";
import AdminForgotPassword from "../pages/Admin/AdminForgotPassword.jsx";
import AdminResetPassword from "../pages/Admin/AdminResetPassword.jsx";
import ApplyJob from "../pages/Admin/Navigation/ApplyJob.jsx";
import ResumeDetail from "../components/ResumeDetail.jsx";
import AccountManagerRegister from "../pages/AccountManager/Register.jsx";
import AccountManager from "../pages/AccountManager/AccountManager.jsx";
import AccountManagerForgotPassword from "../pages/AccountManager/AccountManagerForgotPassword.jsx";
import AccountManagerResetPassword from "../pages/AccountManager/AccountManagerResetPassword.jsx";
import AccountManagerSettings from "../pages/AccountManager/Navigation/Settings.jsx";
import AccountManagerCompanyManagement from "../pages/AccountManager/Navigation/CompanyManagement.jsx";
import AccountManagerCompanyDetails from "../pages/AccountManager/Navigation/AccountManagerCompanyDetails.jsx";
import AccountManagerJobs from "../pages/AccountManager/Navigation/Jobs.jsx";
import AccountManagerDashboard from "../pages/AccountManager/Dashboard.jsx";
import CandidateDetails from "../components/CandidateDetails.jsx";
import Candidate from "../pages/Admin/Navigation/Candidate.jsx";
import AdminCandidateDetails from "../pages/Admin/AdminCandidateDetails.jsx";
import RecruiterPassSet from "../components/RecruiterPassSet.jsx";
import RecruiterForgotPassword from "../pages/RecruiterForgotPassword.jsx";
import RecruiterDashboard from "../pages/RecruiterDashboard.jsx";
import { Toaster } from "react-hot-toast";
import SetPassword from "../pages/Manager/SetPassword.jsx";
import AccountManagerSetPassword from "../pages/AccountManager/SetPassword.jsx";
import RecruiterJobDetailPage from '../pages/RecruiterJobDetailPage';
import ManagerJobDetailPage from '../pages/Manager/jobs/[jobid]';
import ManagerDashboard from '../pages/Manager/ManagerDashboard';
import AdminJobDetailPage from '../pages/Admin/jobs/[jobid]';
import AccountManagerJobDetailPage from '../pages/AccountManager/jobs/[jobid]';
import UnifiedLogin from "../pages/UnifiedLogin";
import AdminLogin from "../pages/Admin/Login.jsx";



const Home = lazy(() => import("../Pages/Home"));
const Companies = lazy(() => import("../Pages/Companies"));
const Recruitement = lazy(() => import("../Pages/Recruitement"));
const JobsSeeker = lazy(() => import("../Pages/JobsSeeker"));
const Privacy = lazy(() => import("../Pages/Policy/Privacy"));
const Terms = lazy(() => import("../Pages/Policy/Terms"));
const Support = lazy(() => import("../Pages/Policy/Support"));
const TalentHub = lazy(() => import("../Pages/TalentHub"));
const ZepRecruit = lazy(() => import("../Pages/ZepRecruit"));

const Router = () => {
  return (
    <Fragment>
      <ScrollToTop />
      <Suspense fallback={<Loader />}>
        <AuthProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                theme: {
                  primary: '#4aed88',
                },
              },
              error: {
                duration: 4000,
                theme: {
                  primary: '#ff4b4b',
                },
              },
            }}
          />
          <Routes>
            {/* Public routes with Header and Footer */}
            <Route path="/" element={<PublicLayout />}>
              <Route index element={<Home />} />
              <Route path="zepTalentHub" element={<TalentHub />} />
              <Route path="ZepRecruit" element={<ZepRecruit />} />
              <Route path="companies" element={<Companies />} />
              <Route path="recruitment" element={<Recruitement />} />
              <Route path="jobseeker" element={<JobsSeeker />} />
              <Route path="privacy" element={<Privacy />} />
              <Route path="terms" element={<Terms />} />
              <Route path="support" element={<Support />} />
              <Route path="prorecruitor" element={<ProRecruitor />} />
            </Route>

            {/* Fallback route with Header and Footer */}
            <Route path="*" element={<PublicLayout />}>
              <Route path="*" element={<Home />} />
            </Route>

            {/* Unified Login Route - No Header/Footer */}
            <Route path="/login" element={<UnifiedLogin />} />
            {/* Admin Login Route - No Header/Footer */}
            <Route path="/admin/login" element={<AdminLogin />} />
            
            {/* Recruiter Routes - Public Routes - No Header/Footer */}
            <Route path="/signup/recruiter" element={<RecruiterSignup />} />
            <Route path="/recruiter/forgot-password" element={<RecruiterForgotPassword />}></Route>
            <Route path="/recruiter/reset_password/:id/:token" element={<RecruiterPassSet title="Forgot Password?" description="Please enter your new password" />}></Route>
            <Route path="/recruiter/set_password/:id/:token" element={<RecruiterPassSet title="Set Your Password" description="Please enter your new password" />}></Route>

            {/* Recruiter Routes - Protected Routes (Recruiter Only) - No Header/Footer */}
            <Route path="/recruiter" element={
              <ProtectedRoute allowedRoles={['recruiter']}>
                <Recruiter />
              </ProtectedRoute>
            } />
            <Route path="/recruiter/dashboard" element={
              <ProtectedRoute allowedRoles={['recruiter']}>
                <RecruiterDashboard />
              </ProtectedRoute>
            } />
            <Route path="/recruiter/set-password" element={
              <ProtectedRoute allowedRoles={['recruiter']}>
                <RecruiterPassSet title="Set Your Password" description="Please create a new password to activate your account" />
              </ProtectedRoute>
            } />
            <Route path="/recruiter/:resumeId" element={
              <ProtectedRoute allowedRoles={['recruiter']}>
                <ResumeRecruiterDetails />
              </ProtectedRoute>
            } />
            <Route path="/recruiter/jobs/:jobId" element={
              <ProtectedRoute allowedRoles={['recruiter']}>
                <RecruiterJobDetailPage />
              </ProtectedRoute>
            } />

            {/* Manager Routes - Public Routes - No Header/Footer */}
            <Route path="/manager/register" element={<Register />} />
            <Route path="/manager/forgot-password" element={<ForgotPassword />} />
            <Route path="/manager/reset_password/:id/:token" element={<ResetPassword />} />
            <Route path="/manager/set_password/:id/:token" element={<SetPassword />} />
            <Route path="/manager/change-email-request" element={<ChangeEmailRequest />} />
            <Route path="/manager/change-email/:id/:token" element={<ChangeEmail />} />

            {/* Manager Routes - Protected Routes (Manager Only) - No Header/Footer */}
            <Route path="/manager" element={
              <ProtectedRoute allowedRoles={['manager']}>
                <Manager />
              </ProtectedRoute>
            } />
            <Route path="/manager/myteam" element={
              <ProtectedRoute allowedRoles={['manager']}>
                <Myteam />
              </ProtectedRoute>
            } />
            <Route path="/manager/listofjobs" element={
              <ProtectedRoute allowedRoles={['manager']}>
                <ListOfJobs />
              </ProtectedRoute>
            } />
            <Route path="/manager/scorecardreviews" element={
              <ProtectedRoute allowedRoles={['manager']}>
                <ScorecardReviews />
              </ProtectedRoute>
            } />
            <Route path="/manager/settings" element={
              <ProtectedRoute allowedRoles={['manager']}>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/manager/company" element={
              <ProtectedRoute allowedRoles={['manager']}>
                <Company />
              </ProtectedRoute>
            } />
            <Route path="/manager/company/jobs/:id/:jobid" element={
              <ProtectedRoute allowedRoles={['manager']}>
                <AssignJobs />
              </ProtectedRoute>
            } />
            <Route path="/manager/company/jobs/:id" element={
              <ProtectedRoute allowedRoles={['manager']}>
                <Jobs />
              </ProtectedRoute>
            } />
            <Route path="/manager/recruiters/:id" element={
              <ProtectedRoute allowedRoles={['manager']}>
                <RecruiterDetails />
              </ProtectedRoute>
            } />
            <Route path="/manager/jobs/:jobid" element={
              <ProtectedRoute allowedRoles={['manager']}>
                <ManagerJobDetailPage />
              </ProtectedRoute>
            } />
            <Route path="/manager/jobs/:jobid/candidates" element={
              <ProtectedRoute allowedRoles={['manager']}>
                <ManagerJobDetailPage />
              </ProtectedRoute>
            } />
            <Route path="/manager/dashboard" element={
              <ProtectedRoute allowedRoles={['manager']}>
                <ManagerDashboard />
              </ProtectedRoute>
            } />

            {/* Admin Routes - Public Routes - No Header/Footer */}
            <Route path="/admin/register" element={<AdminRegister />} />
            {/* <Route path="/admin/forgot-password" element={<AdminForgotPassword />}></Route> */}
            {/* <Route path="/admin/reset_password/:id/:token" element={<AdminResetPassword />}></Route> */}

            {/* Admin Routes - Protected Routes (Admin Only) - No Header/Footer */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Admin />
              </ProtectedRoute>
            } />
            <Route path="/admin/myteam" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <MyTeam />
              </ProtectedRoute>
            } />
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/jobs" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminJobs />
              </ProtectedRoute>
            } />
            <Route path="/admin/candidate" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Candidate />
              </ProtectedRoute>
            } />
            <Route path="/admin/candidates/:resumeId" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminCandidateDetails />
              </ProtectedRoute>
            } />
            <Route path="/admin/companymanagement" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <CompanyManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminSettings />
              </ProtectedRoute>
            } />
            <Route path="/admin/jobs/:jobid" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminJobDetailPage />
              </ProtectedRoute>
            } />

            {/* Jobs - No Header/Footer */}
            <Route path="/job/:jobid" element={<ApplyJob />}></Route>
            <Route path="/job/:jobid/:resumeid" element={<ResumeDetail />}></Route>

            {/* Account Manager Routes - Public Routes - No Header/Footer */}
            <Route path="/accountmanager/register" element={<AccountManagerRegister />} />
            <Route path="/accountmanager/forgot-password" element={<AccountManagerForgotPassword />}></Route>
            <Route path="/accountmanager/reset_password/:id/:token" element={<AccountManagerResetPassword />}></Route>
            <Route path="/accountmanager/set_password/:id/:token" element={<AccountManagerSetPassword />}></Route>

            {/* Account Manager Routes - Protected Routes (Account Manager Only) - No Header/Footer */}
            <Route path="/accountmanager" element={
              <ProtectedRoute allowedRoles={['accountmanager']}>
                <AccountManager />
              </ProtectedRoute>
            } />
            <Route path="/accountmanager/companymanagement" element={
              <ProtectedRoute allowedRoles={['accountmanager']}>
                <AccountManagerCompanyManagement />
              </ProtectedRoute>
            } />
            <Route path="/accountmanager/companymanagement/:companyId" element={
              <ProtectedRoute allowedRoles={['accountmanager']}>
                <AccountManagerCompanyDetails />
              </ProtectedRoute>
            } />
            <Route path="/accountmanager/jobs" element={
              <ProtectedRoute allowedRoles={['accountmanager']}>
                <AccountManagerJobs />
              </ProtectedRoute>
            } />
            <Route path="/accountmanager/candidates/:resumeId" element={
              <ProtectedRoute allowedRoles={['accountmanager']}>
                <CandidateDetails />
              </ProtectedRoute>
            } />
            <Route path="/accountmanager/dashboard" element={
              <ProtectedRoute allowedRoles={['accountmanager']}>
                <AccountManagerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/accountmanager/settings" element={
              <ProtectedRoute allowedRoles={['accountmanager']}>
                <AccountManagerSettings />
              </ProtectedRoute>
            } />
            <Route path="/accountmanager/jobs/:jobid" element={
              <ProtectedRoute allowedRoles={['accountmanager']}>
                <AccountManagerJobDetailPage />
              </ProtectedRoute>
            } />

          </Routes>
        </AuthProvider>
      </Suspense>
    </Fragment>
  );
};

export default Router;
