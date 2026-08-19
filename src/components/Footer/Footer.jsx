import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { FaFacebook, FaInstagram, FaYoutube, FaLinkedin } from 'react-icons/fa';
import { NAV_LINKS } from '../../utils/constants';
import { useContent } from '../../context/ContentContext';
import BrandLogo from '../Shared/BrandLogo';
import { formatPhoneLink } from '../../utils/helpers';

/**
 * Site footer with links, contact info, and social icons
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { site, projects } = useContent();

  const phoneNumbers = site?.phones?.length ? site.phones.join(', ') : site?.phone || '';

  return (
    <footer className="bg-slate-50 text-slate-800 border-t border-slate-200/80 pt-16 pb-8" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Company */}
          <div>
            <Link to="/" className="inline-block mb-5 group">
              <BrandLogo className="h-16 md:h-20 w-auto max-w-[320px] object-contain group-hover:scale-105" />
            </Link>
            <p className="text-slate-600 text-sm leading-relaxed mb-5">
              {site?.companyName || 'Lake Valley Duplex & Resort Ltd.'} — {site?.tagline || 'building Bangladesh\'s premier eco-friendly integrated township.'}
            </p>
            <div className="flex gap-3">
              {[
                { icon: FaFacebook, href: site?.facebook, label: 'Facebook' },
                { icon: FaInstagram, href: site?.instagram, label: 'Instagram' },
                { icon: FaYoutube, href: site?.youtube, label: 'YouTube' },
                { icon: FaLinkedin, href: site?.linkedin, label: 'LinkedIn' },
              ].filter((s) => s.href).map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-emerald-brand flex items-center justify-center hover:bg-emerald-brand hover:text-white transition-colors shadow-sm"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-deep-green text-base mb-5">Quick Links</h3>
            <ul className="space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-slate-600 hover:text-emerald-brand text-sm font-medium transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/contact#booking" className="text-slate-600 hover:text-emerald-brand text-sm font-medium transition-colors">
                  Book a Visit
                </Link>
              </li>
            </ul>
          </div>

          {/* Projects */}
          <div>
            <h3 className="font-bold text-deep-green text-base mb-5">Our Projects</h3>
            <ul className="space-y-2.5">
              {(projects || []).map((p) => (
                <li key={p.id}>
                  <Link
                    to={`/projects/${p.slug}`}
                    className="text-slate-600 hover:text-emerald-brand text-sm font-medium transition-colors"
                  >
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-deep-green text-base mb-5">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-emerald-brand mt-1 shrink-0" />
                <div className="text-slate-600 text-sm space-y-1">
                  <p className="font-medium text-slate-800">Customer Care:</p>
                  <a href={`tel:${formatPhoneLink(site?.phoneRaw || site?.phone || '')}`} className="block hover:text-emerald-brand transition-colors font-mono">
                    {phoneNumbers}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-emerald-brand mt-1 shrink-0" />
                <a href={`mailto:${site?.email}`} className="text-slate-600 hover:text-emerald-brand text-sm transition-colors">
                  {site?.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-emerald-brand mt-1 shrink-0" />
                <div className="text-slate-600 text-sm">
                  <p className="font-semibold text-slate-800">Head Office:</p>
                  <p>{site?.headOffice}</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-emerald-brand mt-1 shrink-0" />
                <span className="text-slate-600 text-sm">{site?.hours}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-200/80 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">
            &copy; {currentYear} {site?.companyName || 'Lake Valley Duplex & Resort Ltd.'}. All rights reserved.
          </p>
          <p className="text-slate-500 text-xs">
            {site?.siteName || 'Lake Valley Flower City'} — {site?.tagline || 'Where Nature Meets Modern Living'}
          </p>
        </div>
      </div>
    </footer>
  );
}
