import React, { Fragment, Suspense, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { lazy } from "react";
import Loader from "../Components/Loader";
import ProRecruitor from "../Pages/ProRecruitor";
import ScrollToTop from "../Shared/ScrollToTop";// Importing ScrollToTop
import PublicLayout from "../Layout/PublicLayout";


import "../App.css";
import { AuthProvider } from "../context/AuthContext";
import ProtectedRoute from "../Components/ProtectedRoute";


import Recruiter from "../Pages/Recruiter";
import ResumeRecruiterDetails from "../Pages/ResumeRecruiterDetails";

import RecruiterSignup from "../Components/RecruiterSignupByManager.jsx";
import Register from "../Pages/Manager/Register";
import Company from "../Pages/Manager/Company";
import Jobs from "../Pages/jobs/[companyid].jsx";
import AssignJobs from "../Pages/jobs/[jobid].jsx";
import ForgotPassword from "../Pages/Manager/ForgotPassword.jsx";
import ResetPassword from "../Pages/Manager/ResetPassword.jsx";
import ChangeEmail from "../Pages/Manager/ChangeEmail.jsx";
import ChangeEmailRequest from "../Pages/Manager/ChangeEmailRequest.jsx";
import Manager from "../Pages/Manager/Manager.jsx";
import Myteam from "../Pages/Manager/Navigation/Myteam.jsx";
import RecruiterDetails from "../Components/RecruiterDetails.jsx";
import ListOfJobs from "../Pages/Manager/Navigation/ListOfJobs.jsx";
import ScorecardReviews from "../Pages/Manager/Navigation/ScorecardReviews.jsx";
import Settings from "../Pages/Manager/Navigation/Settings.jsx";
import AdminRegister from "../Pages/Admin/Register.jsx";
import Admin from "../Pages/Admin/Admin.jsx";
import MyTeam from "../Pages/Admin/Navigation/MyTeam.jsx";
import Dashboard from "../Pages/Admin/Navigation/Dashboard.jsx";
import CompanyManagement from "../Pages/Admin/Navigation/CompanyManagement.jsx";
import AdminJobs from "../Pages/Admin/Navigation/Jobs.jsx";
import AdminSettings from "../Pages/Admin/Navigation/Settings.jsx";

import ApplyJob from "../Pages/Admin/Navigation/ApplyJob.jsx";
import ResumeDetail from "../Components/ResumeDetail.jsx";
import AccountManagerRegister from "../Pages/AccountManager/Register.jsx";
import AccountManager from "../Pages/AccountManager/AccountManager.jsx";
import AccountManagerForgotPassword from "../Pages/AccountManager/AccountManagerForgotPassword.jsx";
import AccountManagerResetPassword from "../Pages/AccountManager/AccountManagerResetPassword.jsx";
import AccountManagerSettings from "../Pages/AccountManager/Navigation/Settings.jsx";
import AccountManagerCompanyManagement from "../Pages/AccountManager/Navigation/CompanyManagement.jsx";
import AccountManagerCompanyDetails from "../Pages/AccountManager/Navigation/AccountManagerCompanyDetails.jsx";
import AccountManagerJobs from "../Pages/AccountManager/Navigation/Jobs.jsx";
import AccountManagerDashboard from "../Pages/AccountManager/Dashboard.jsx";
import CandidateDetails from "../Components/CandidateDetails.jsx";
import Candidate from "../Pages/Admin/Navigation/Candidate.jsx";
import AdminCandidateDetails from "../Pages/Admin/AdminCandidateDetails.jsx";
import RecruiterPassSet from "../Components/RecruiterPassSet.jsx";
import RecruiterForgotPassword from "../Pages/RecruiterForgotPassword.jsx";
import RecruiterDashboard from "../Pages/RecruiterDashboard.jsx";
import { Toaster } from "react-hot-toast";
import SetPassword from "../Pages/Manager/SetPassword.jsx";
import AccountManagerSetPassword from "../Pages/AccountManager/SetPassword.jsx";
import RecruiterJobDetailPage from '../Pages/RecruiterJobDetailPage';
import ManagerJobDetailPage from '../Pages/Manager/jobs/[jobid]';
import ManagerDashboard from '../Pages/Manager/ManagerDashboard.jsx';
import AdminJobDetailPage from '../Pages/Admin/jobs/[jobid]';
import AccountManagerJobDetailPage from '../Pages/AccountManager/jobs/[jobid]';
import UnifiedLogin from "../Pages/UnifiedLogin";
import AdminLogin from "../Pages/Admin/Login.jsx";



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
