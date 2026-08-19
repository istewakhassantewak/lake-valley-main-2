import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import App from '../App.jsx';
import ErrorBoundary from '../components/Shared/ErrorBoundary.jsx';
import BrandLogo from '../components/Shared/BrandLogo.jsx';

const Home = lazy(() => import('../pages/Home/Home.jsx'));
const AboutPage = lazy(() => import('../pages/About/AboutPage.jsx'));
const ProjectsPage = lazy(() => import('../pages/Projects/ProjectsPage.jsx'));
const ProjectDetailsPage = lazy(() => import('../pages/ProjectDetails/ProjectDetailsPage.jsx'));
const GalleryPage = lazy(() => import('../pages/Gallery/GalleryPage.jsx'));
const ContactPage = lazy(() => import('../pages/Contact/ContactPage.jsx'));
const LoginPage = lazy(() => import('../pages/Auth/LoginPage.jsx'));
const RegisterPage = lazy(() => import('../pages/Auth/RegisterPage.jsx'));
const ProfilePage = lazy(() => import('../pages/Profile/ProfilePage.jsx'));
const AdminImagePanel = lazy(() => import('../pages/Admin/AdminImagePanel.jsx'));
const NotFoundPage = lazy(() => import('../pages/NotFound/NotFoundPage.jsx'));

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 py-16 bg-white select-none">
      <BrandLogo className="h-14 sm:h-16 w-auto max-w-[260px] object-contain drop-shadow-xs animate-pulse" />
      <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80 shadow-2xs">
        <div className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 rounded-full animate-pulse" />
      </div>
      <span className="text-[11px] font-semibold text-slate-400 tracking-wide uppercase">
        Loading Lake Valley...
      </span>
    </div>
  );
}

function LazyPage({ children }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>{children}</Suspense>
    </ErrorBoundary>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: (
      <ErrorBoundary>
        <NotFoundPage />
      </ErrorBoundary>
    ),
    children: [
      { index: true, element: <LazyPage><Home /></LazyPage> },
      { path: 'about', element: <LazyPage><AboutPage /></LazyPage> },
      { path: 'projects', element: <LazyPage><ProjectsPage /></LazyPage> },
      { path: 'projects/:slug', element: <LazyPage><ProjectDetailsPage /></LazyPage> },
      { path: 'gallery', element: <LazyPage><GalleryPage /></LazyPage> },
      { path: 'contact', element: <LazyPage><ContactPage /></LazyPage> },
      { path: 'login', element: <LazyPage><LoginPage /></LazyPage> },
      { path: 'register', element: <LazyPage><RegisterPage /></LazyPage> },
      { path: 'profile', element: <LazyPage><ProfilePage /></LazyPage> },
      { path: 'admin', element: <LazyPage><AdminImagePanel /></LazyPage> },
      { path: 'admin/images', element: <LazyPage><AdminImagePanel /></LazyPage> },
      { path: '*', element: <LazyPage><NotFoundPage /></LazyPage> },
    ],
  },
]);

export default router;
