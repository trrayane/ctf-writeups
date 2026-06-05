import { useEffect } from 'react';
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthProvider';
import { AuthGate, RequireAuth, RequireRole } from './auth/RouteGuards';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import InternalLayout from './layout/InternalLayout';
import About from './pages/About';
import Careers from './pages/Careers';
import Contact from './pages/Contact';
import Home from './pages/Home';
import News from './pages/News';
import Pipeline from './pages/Pipeline';
import Science from './pages/Science';
import Team from './pages/Team';
import {
  LoginPage,
  RegisterPage,
} from './pages/auth/AuthPages';
import {
  AdminDashboardPage,
  AdminErrorLogsPage,
  AdminEntityDeleteButton,
  AdminEntityDetailPage,
  AdminEntityFormPage,
  AdminEntityListPage,
  AdminQMongoPage,
  loadQMongoApi,
  PortalApplicationCreatePage,
  PortalDashboardPage,
  PortalDetailPage,
  PortalInquiryCreatePage,
  PortalListPage,
  PortalProfilePage,
  StaffContentDetailPage,
  StaffContentListPage,
  StaffDashboardPage,
} from './pages/internal/InternalPages';

function RoleHomeRedirect() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.roleCode === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  if (user.roleCode === 'staff') {
    return <Navigate to="/staff" replace />;
  }

  return <Navigate to="/portal" replace />;
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function SiteLayout() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main className="site-main">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

function AdminRuntimePreload() {
  useEffect(() => {
    loadQMongoApi().catch(() => {
      // QMongo page will present a user-facing error if runtime validation is needed and unavailable.
    });
  }, []);

  return <Outlet />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AuthGate />}>
            <Route element={<SiteLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/science" element={<Science />} />
              <Route path="/pipeline" element={<Pipeline />} />
              <Route path="/team" element={<Team />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/news" element={<News />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            <Route element={<RequireAuth />}>
              <Route element={<InternalLayout />}>
                <Route path="/dashboard" element={<RoleHomeRedirect />} />

                <Route element={<RequireRole allowed={['external']} />}>
                  <Route path="/portal" element={<PortalDashboardPage />} />
                  <Route path="/portal/profile" element={<PortalProfilePage />} />
                  <Route path="/portal/applications" element={<PortalListPage mode="applications" />} />
                  <Route path="/portal/applications/new" element={<PortalApplicationCreatePage />} />
                  <Route path="/portal/applications/:id" element={<PortalDetailPage mode="applications" />} />
                  <Route path="/portal/inquiries" element={<PortalListPage mode="inquiries" />} />
                  <Route path="/portal/inquiries/new" element={<PortalInquiryCreatePage />} />
                  <Route path="/portal/inquiries/:id" element={<PortalDetailPage mode="inquiries" />} />
                </Route>

                <Route element={<RequireRole allowed={['staff', 'admin']} />}>
                  <Route path="/staff" element={<StaffDashboardPage />} />
                  <Route path="/staff/articles" element={<StaffContentListPage resource="articles" />} />
                  <Route path="/staff/articles/:id" element={<StaffContentDetailPage resource="articles" />} />
                  <Route path="/staff/pipeline-programs" element={<StaffContentListPage resource="pipeline-programs" />} />
                  <Route path="/staff/pipeline-programs/:id" element={<StaffContentDetailPage resource="pipeline-programs" />} />
                  <Route path="/staff/team-profiles" element={<StaffContentListPage resource="team-profiles" />} />
                  <Route path="/staff/team-profiles/:id" element={<StaffContentDetailPage resource="team-profiles" />} />
                  <Route path="/staff/job-postings" element={<StaffContentListPage resource="job-postings" />} />
                  <Route path="/staff/job-postings/:id" element={<StaffContentDetailPage resource="job-postings" />} />
                </Route>

                <Route element={<RequireRole allowed={['admin']} />}>
                  <Route element={<AdminRuntimePreload />}>
                  <Route path="/admin" element={<AdminDashboardPage />} />

                  <Route path="/admin/users" element={<AdminEntityListPage resource="users" createPath="/admin/users/new" />} />
                  <Route path="/admin/users/new" element={<AdminEntityFormPage resource="users" mode="create" template={{ email: '', fullName: '', password: '', roleCode: 'staff', userType: 'internal' }} />} />
                  <Route path="/admin/users/:id" element={<><AdminEntityDeleteButton resource="users" /><AdminEntityDetailPage resource="users" /></>} />
                  <Route path="/admin/users/:id/edit" element={<AdminEntityFormPage resource="users" mode="edit" />} />

                  <Route path="/admin/roles" element={<AdminEntityListPage resource="roles" createPath="/admin/roles/new" />} />
                  <Route path="/admin/roles/new" element={<AdminEntityFormPage resource="roles" mode="create" template={{ code: '', name: '', description: '' }} />} />
                  <Route path="/admin/roles/:id" element={<><AdminEntityDeleteButton resource="roles" /><AdminEntityDetailPage resource="roles" /></>} />
                  <Route path="/admin/roles/:id/edit" element={<AdminEntityFormPage resource="roles" mode="edit" />} />

                  <Route path="/admin/sessions" element={<AdminEntityListPage resource="sessions" />} />
                  <Route path="/admin/sessions/:id" element={<><AdminEntityDeleteButton resource="sessions" /><AdminEntityDetailPage resource="sessions" /></>} />

                  <Route path="/admin/articles" element={<AdminEntityListPage resource="articles" createPath="/admin/articles/new" />} />
                  <Route path="/admin/articles/new" element={<AdminEntityFormPage resource="articles" mode="create" template={{ title: '', category: 'news', body: '', status: 'draft' }} />} />
                  <Route path="/admin/articles/:id" element={<><AdminEntityDeleteButton resource="articles" /><AdminEntityDetailPage resource="articles" /></>} />
                  <Route path="/admin/articles/:id/edit" element={<AdminEntityFormPage resource="articles" mode="edit" />} />

                  <Route path="/admin/pipeline-programs" element={<AdminEntityListPage resource="pipeline-programs" createPath="/admin/pipeline-programs/new" />} />
                  <Route path="/admin/pipeline-programs/new" element={<AdminEntityFormPage resource="pipeline-programs" mode="create" template={{ compound: '', condition: '', modality: '', stage: 'Preclinical', status: 'draft' }} />} />
                  <Route path="/admin/pipeline-programs/:id" element={<><AdminEntityDeleteButton resource="pipeline-programs" /><AdminEntityDetailPage resource="pipeline-programs" /></>} />
                  <Route path="/admin/pipeline-programs/:id/edit" element={<AdminEntityFormPage resource="pipeline-programs" mode="edit" />} />

                  <Route path="/admin/team-profiles" element={<AdminEntityListPage resource="team-profiles" createPath="/admin/team-profiles/new" />} />
                  <Route path="/admin/team-profiles/new" element={<AdminEntityFormPage resource="team-profiles" mode="create" template={{ name: '', title: '', bio: '', initials: '', status: 'draft' }} />} />
                  <Route path="/admin/team-profiles/:id" element={<><AdminEntityDeleteButton resource="team-profiles" /><AdminEntityDetailPage resource="team-profiles" /></>} />
                  <Route path="/admin/team-profiles/:id/edit" element={<AdminEntityFormPage resource="team-profiles" mode="edit" />} />

                  <Route path="/admin/job-postings" element={<AdminEntityListPage resource="job-postings" createPath="/admin/job-postings/new" />} />
                  <Route path="/admin/job-postings/new" element={<AdminEntityFormPage resource="job-postings" mode="create" template={{ title: '', department: '', location: '', description: '', status: 'draft' }} />} />
                  <Route path="/admin/job-postings/:id" element={<><AdminEntityDeleteButton resource="job-postings" /><AdminEntityDetailPage resource="job-postings" /></>} />
                  <Route path="/admin/job-postings/:id/edit" element={<AdminEntityFormPage resource="job-postings" mode="edit" />} />

                  <Route path="/admin/job-applications" element={<AdminEntityListPage resource="job-applications" createPath="/admin/job-applications/new" />} />
                  <Route path="/admin/job-applications/new" element={<AdminEntityFormPage resource="job-applications" mode="create" template={{ userId: '', jobPostingId: '', resumeUrl: '', status: 'submitted' }} />} />
                  <Route path="/admin/job-applications/:id" element={<><AdminEntityDeleteButton resource="job-applications" /><AdminEntityDetailPage resource="job-applications" /></>} />
                  <Route path="/admin/job-applications/:id/edit" element={<AdminEntityFormPage resource="job-applications" mode="edit" />} />

                  <Route path="/admin/inquiries" element={<AdminEntityListPage resource="inquiries" createPath="/admin/inquiries/new" />} />
                  <Route path="/admin/inquiries/new" element={<AdminEntityFormPage resource="inquiries" mode="create" template={{ source: 'public', fullName: '', email: '', subject: '', message: '', status: 'open' }} />} />
                  <Route path="/admin/inquiries/:id" element={<><AdminEntityDeleteButton resource="inquiries" /><AdminEntityDetailPage resource="inquiries" /></>} />
                  <Route path="/admin/inquiries/:id/edit" element={<AdminEntityFormPage resource="inquiries" mode="edit" />} />

                  <Route path="/admin/audit-logs" element={<AdminEntityListPage resource="audit-logs" />} />
                  <Route path="/admin/audit-logs/:id" element={<AdminEntityDetailPage resource="audit-logs" />} />

                  <Route path="/admin/error-logs" element={<AdminErrorLogsPage />} />

                  <Route path="/admin/qmongo" element={<AdminQMongoPage />} />
                  </Route>
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
