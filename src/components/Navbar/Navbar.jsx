import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  User,
  Sliders,
  PhoneCall,
  MapPin,
  Calendar,
  MessageCircle,
  Clock,
  Sparkles,
  ChevronRight,
  Home,
  Info,
  Building2,
  Image as ImageIcon,
  Mail,
} from 'lucide-react';
import { NAV_LINKS, CONTACT } from '../../utils/constants';
import { useScrolledPast } from '../../hooks/useScrollPosition';
import { useAuth } from '../../context/AuthContext';
import { useContent } from '../../context/ContentContext';
import Button from '../Shared/Button';
import BrandLogo from '../Shared/BrandLogo';
import { cn } from '../../utils/helpers';

/**
 * World-Class Luxury Real Estate Navigation Bar
 * Features a top utility contact strip, glassmorphic sticky header,
 * micro-interactions, responsive mobile drawer, and high-conversion CTAs.
 */
export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const scrolled = useScrolledPast(30);
  const location = useLocation();
  const { user } = useAuth();
  const { site } = useContent();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is active
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileOpen]);

  const navIcons = {
    '/': Home,
    '/about': Info,
    '/projects': Building2,
    '/gallery': ImageIcon,
    '/contact': Mail,
  };

  const primaryPhone = site?.phone || CONTACT.phone;
  const rawPhone = site?.phoneRaw || CONTACT.phoneRaw;
  const whatsappNum = site?.whatsapp || CONTACT.whatsapp;

  return (
    <>
      {/* Top Utility Bar (Desktop only) - Luxury Real Estate Touch */}
      <div className="hidden lg:block bg-slate-950 text-slate-300 text-[11px] py-1.5 border-b border-slate-800/80 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Left: Location & Hours */}
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors">
              <MapPin className="w-3 h-3 text-emerald-400" />
              <span>Dhaka-Mawa Expressway</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>Sat – Thu: 9:30 AM – 6:30 PM</span>
            </div>
            <span className="font-bangla text-emerald-400/90 text-[11px] font-medium">
              লেক ভ্যালি ফ্লাওয়ার সিটি
            </span>
          </div>

          {/* Right: Hotline, WhatsApp, Currency, Admin */}
          <div className="flex items-center gap-3.5">
            <a
              href={`https://wa.me/${whatsappNum}?text=Hello%20Lake%20Valley%20Team`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[11px] font-semibold border border-emerald-500/20 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <MessageCircle className="w-2.5 h-2.5" /> WhatsApp
            </a>

            <a
              href={`tel:${rawPhone}`}
              className="inline-flex items-center gap-1 text-slate-200 hover:text-emerald-400 font-bold transition-colors text-[11px]"
            >
              <PhoneCall className="w-3 h-3 text-emerald-400" />
              <span>Hotline: {primaryPhone}</span>
            </a>

            <div className="h-2.5 w-px bg-slate-700" />

            <Link
              to="/admin"
              className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-amber-300 transition-colors px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700/80"
              title="Admin CMS & Image Management"
            >
              <Sliders className="w-2.5 h-2.5 text-amber-400" /> Admin
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation Header */}
      <header
        className={cn(
          'sticky top-0 left-0 right-0 z-50 transition-all duration-300 select-none',
          scrolled
            ? 'bg-white/95 backdrop-blur-xl shadow-md shadow-slate-900/5 py-1.5 border-b border-slate-200/90'
            : 'bg-white/95 backdrop-blur-md py-2 border-b border-slate-200/60'
        )}
      >
        <nav
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between"
          aria-label="Main navigation"
        >
          {/* Brand Logo & Tagline */}
          <Link
            to="/"
            className="flex items-center gap-3 group focus:outline-hidden py-0.5"
            aria-label={site?.siteName || 'Lake Valley Flower City'}
          >
            <div className="relative">
              <BrandLogo className="h-10 sm:h-11 md:h-12 lg:h-12 w-auto max-w-[190px] sm:max-w-[220px] md:max-w-[250px] object-contain transition-transform duration-300 group-hover:scale-105" />
            </div>
          </Link>

          {/* Desktop Links with Animated Indicator */}
          <ul className="hidden lg:flex items-center gap-1 xl:gap-1.5 bg-slate-100/70 p-1 rounded-full border border-slate-200/80 shadow-2xs">
            {NAV_LINKS.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={cn(
                      'relative px-3.5 py-1.5 rounded-full text-xs xl:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5',
                      isActive
                        ? 'text-white'
                        : 'text-slate-700 hover:text-emerald-700 hover:bg-white/60'
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-pill"
                        className="absolute inset-0 bg-emerald-600 rounded-full shadow-sm shadow-emerald-600/30"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{link.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Desktop Right Action Area */}
          <div className="hidden lg:flex items-center gap-2.5">
            {/* Direct Phone Dial Quick Pill */}
            <a
              href={`tel:${rawPhone}`}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-700 border border-slate-200 transition-all text-xs font-semibold shadow-2xs"
              title="Call for instant property consultant"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <PhoneCall className="w-2.5 h-2.5" />
              </div>
              <span className="hidden xl:inline">{primaryPhone}</span>
            </a>

            {/* User Account / Sign In */}
            {user ? (
              <Link to="/profile">
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-1.5 font-bold text-slate-800 border-slate-200 bg-white hover:bg-slate-50 py-1.5 px-3 rounded-xl shadow-2xs text-xs"
                >
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{user.displayName?.split(' ')[0] || 'Profile'}</span>
                </Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button
                  variant="secondary"
                  size="sm"
                  className="font-bold text-slate-700 hover:text-slate-900 border-slate-200 bg-white hover:bg-slate-50 py-1.5 px-3 rounded-xl shadow-2xs text-xs"
                >
                  Sign In
                </Button>
              </Link>
            )}

            {/* Book Site Visit CTA */}
            <Link to="/contact#booking">
              <Button
                variant="primary"
                size="sm"
                className="font-bold bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white py-1.5 px-3.5 rounded-xl shadow-sm shadow-emerald-700/20 text-xs gap-1.5 transition-all"
              >
                <Calendar className="w-3.5 h-3.5 text-emerald-200" />
                <span>Book Site Visit</span>
                <ChevronRight className="w-3.5 h-3.5 ml-0.5 opacity-80" />
              </Button>
            </Link>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex lg:hidden items-center gap-2">
            <a
              href={`tel:${rawPhone}`}
              className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100"
              aria-label="Call Hotline"
            >
              <PhoneCall className="w-4 h-4" />
            </a>

            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
              aria-label={mobileOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
              onClick={() => setMobileOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="absolute right-0 top-0 bottom-0 w-[85vw] max-w-sm bg-white shadow-2xl flex flex-col justify-between overflow-y-auto"
            >
              {/* Drawer Top Header */}
              <div>
                <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                  <BrandLogo className="h-11 sm:h-12 w-auto max-w-[200px] object-contain" />
                  <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-700 flex items-center justify-center cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick Info Badge */}
                <div className="px-5 pt-4 pb-2">
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-emerald-900">
                        Lake Valley Flower City
                      </p>
                      <p className="text-[11px] text-emerald-700 mt-0.5">
                        Eco-Friendly Integrated Township at Dhaka-Mawa Expressway
                      </p>
                    </div>
                  </div>
                </div>

                {/* Nav Links */}
                <nav className="p-4 space-y-1">
                  {NAV_LINKS.map((link) => {
                    const IconComponent = navIcons[link.path] || ChevronRight;
                    const isActive = location.pathname === link.path;
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          'flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-colors',
                          isActive
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'text-slate-700 hover:bg-slate-100'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <IconComponent
                            className={cn('w-4 h-4', isActive ? 'text-white' : 'text-emerald-600')}
                          />
                          <span>{link.label}</span>
                        </div>
                        <ChevronRight
                          className={cn(
                            'w-4 h-4',
                            isActive ? 'text-white/80' : 'text-slate-400'
                          )}
                        />
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Drawer Bottom Actions */}
              <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/60 space-y-3">
                {/* Book Site Visit Button */}
                <Link to="/contact#booking" onClick={() => setMobileOpen(false)}>
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md py-3 text-sm flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Book Site Visit</span>
                  </Button>
                </Link>

                {/* Direct Contact Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`tel:${rawPhone}`}
                    className="px-3 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Call Us</span>
                  </a>

                  <a
                    href={`https://wa.me/${whatsappNum}?text=Hello%20Lake%20Valley%20Team`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp</span>
                  </a>
                </div>

                {/* User Auth & Admin Links */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-200/70 text-xs">
                  {user ? (
                    <Link
                      to="/profile"
                      onClick={() => setMobileOpen(false)}
                      className="font-bold text-slate-800 flex items-center gap-1.5 hover:text-emerald-700"
                    >
                      <User className="w-4 h-4 text-emerald-600" />
                      <span>{user.displayName || 'My Profile'}</span>
                    </Link>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Link
                        to="/login"
                        onClick={() => setMobileOpen(false)}
                        className="font-bold text-slate-700 hover:text-emerald-600"
                      >
                        Sign In
                      </Link>
                      <span className="text-slate-300">|</span>
                      <Link
                        to="/register"
                        onClick={() => setMobileOpen(false)}
                        className="font-bold text-emerald-700 hover:underline"
                      >
                        Sign Up
                      </Link>
                    </div>
                  )}

                  <Link
                    to="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                  >
                    <Sliders className="w-3.5 h-3.5 text-amber-500" />
                    <span>Admin Panel</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
