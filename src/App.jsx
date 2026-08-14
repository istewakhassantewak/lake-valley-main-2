import { Outlet, ScrollRestoration } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import LoadingScreen from './components/Shared/LoadingScreen';
import ScrollProgress from './components/Shared/ScrollProgress';
import BackToTop from './components/Shared/BackToTop';
import FloatingButtons from './components/Shared/FloatingButtons';
import StickyCTA from './components/Shared/StickyCTA';

/**
 * Root layout wrapping all pages with global UI elements
 */
export default function App() {
  return (
    <>
      <LoadingScreen />
      <ScrollProgress />
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      <BackToTop />
      <FloatingButtons />
      <StickyCTA />
      <ScrollRestoration />
    </>
  );
}
