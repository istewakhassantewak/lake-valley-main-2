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
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 py-12">
      <BrandLogo className="h-12 w-auto animate-pulse" />
      <div className="w-24 h-1 bg-emerald-brand/20 rounded-full overflow-hidden">
        <div className="h-full bg-emerald-brand rounded-full animate-pulse" />
      </div>
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
