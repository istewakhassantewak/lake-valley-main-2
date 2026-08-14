import { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Calendar,
  LogOut,
  MessageSquareText,
  Camera,
  Edit3,
  Search,
  XCircle,
  Shield,
  Trash2,
  Calculator,
} from 'lucide-react';
import ProtectedRoute from '../../components/Shared/ProtectedRoute';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  getProfile,
  updateProfile,
  getMyBookings,
  cancelBooking,
  deleteAccount,
} from '../../api/userApi';
import { getMyContactMessages } from '../../api/contactApi';
import {
  uploadProfileImage,
  uploadBannerImage,
  changePassword,
  removeProfileImage,
  linkPasswordAccount,
  linkGoogleAccount,
  logOut as firebaseLogOut,
  auth,
  hasPasswordProvider,
  getAuthProviders,
} from '../../firebase';
import { updateProfile as updateFirebaseProfile } from 'firebase/auth';
import Button from '../../components/Shared/Button';
import PasswordInput from '../../components/Shared/PasswordInput';
import SectionHeading from '../../components/Shared/SectionHeading';
import { cn } from '../../utils/helpers';
import { validatePassword, getPasswordValidationMessage } from '../../utils/passwordValidation';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'bookings', label: 'My Bookings' },
  { id: 'messages', label: 'Messages' },
  { id: 'settings', label: 'Settings' },
];

const BOOKING_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];

const COUNTRY_LIST = [
  'Bangladesh',
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'United Arab Emirates',
  'Saudi Arabia',
  'Qatar',
  'Kuwait',
  'Oman',
  'Bahrain',
  'Malaysia',
  'Singapore',
  'India',
  'Pakistan',
  'Germany',
  'France',
  'Italy',
  'Spain',
  'Japan',
  'China',
  'South Korea',
  'Turkey',
  'Egypt',
  'South Africa',
  'Brazil',
  'New Zealand',
];

function ProfileContent() {
  const { user: authUser, logout, updateAuthUser } = useAuth();
  const toast = useToast();
  const fileInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [form, setForm] = useState({});

  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingFilter, setBookingFilter] = useState('all');
  const [bookingSearch, setBookingSearch] = useState('');

  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(true);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [linkPasswordVal, setLinkPasswordVal] = useState('');
  const [linkPasswordConfirm, setLinkPasswordConfirm] = useState('');
  const [linking, setLinking] = useState(false);
  const [linkGoogleLoading, setLinkGoogleLoading] = useState(false);
  const [hasPassword, setHasPassword] = useState(() => {
    try {
      return hasPasswordProvider();
    } catch {
      return false;
    }
  });
  const [hasGoogle, setHasGoogle] = useState(() => {
    try {
      return getAuthProviders().includes('google.com');
    } catch {
      return false;
    }
  });

  const loadProfile = useCallback(async () => {
    try {
      const data = await getProfile();
      const loadedUser = data.user || data;
      setProfile(loadedUser);
      setForm(loadedUser);
    } catch {
      setProfile({
        displayName: authUser?.displayName,
        email: authUser?.email,
        photoURL: authUser?.photoURL,
        profileCompletion: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [authUser]);

  const loadBookings = useCallback(async () => {
    setBookingsLoading(true);
    try {
      const params = {};
      if (bookingFilter !== 'all') params.status = bookingFilter;
      if (bookingSearch.trim()) params.search = bookingSearch.trim();
      const data = await getMyBookings(params);
      setBookings(data.bookings || data || []);
    } catch {
      setBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  }, [bookingFilter, bookingSearch]);

  useEffect(() => {
    loadProfile();
    getMyContactMessages()
      .then((messages) => setMessages(Array.isArray(messages) ? messages : []))
      .catch(() => setMessages([]))
      .finally(() => setMessagesLoading(false));
  }, [loadProfile]);

  useEffect(() => {
    if (activeTab !== 'bookings') return;
    const timer = setTimeout(loadBookings, bookingSearch ? 400 : 0);
    return () => clearTimeout(timer);
  }, [activeTab, loadBookings, bookingSearch]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const data = await updateProfile({
        displayName: form.displayName,
        username: form.username,
        phone: form.phone,
        dateOfBirth: form.dateOfBirth || null,
        gender: form.gender || '',
        country: form.country,
        address: form.address,
        bio: form.bio,
        socialLinks: form.socialLinks || {},
      });

      if (auth.currentUser && form.displayName && form.displayName !== auth.currentUser.displayName) {
        try {
          await updateFirebaseProfile(auth.currentUser, { displayName: form.displayName });
        } catch {
          // ignore firebase sync errors
        }
      }

      const updatedUser = data?.data?.user || data?.user || data;
      setProfile(updatedUser);
      setForm(updatedUser);
      if (updateAuthUser) updateAuthUser({ displayName: updatedUser.displayName, photoURL: updatedUser.photoURL });
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUploading(true);
    try {
      const url = await uploadProfileImage(file);
      const res = await updateProfile({ photoURL: url });
      const updatedUser = res?.data?.user || res?.user || res || {};
      const newPhoto = updatedUser.photoURL || url;
      setProfile((p) => ({ ...p, photoURL: newPhoto }));
      setForm((f) => ({ ...f, photoURL: newPhoto }));
      if (updateAuthUser) updateAuthUser({ photoURL: newPhoto });
      toast.success('Profile picture updated successfully');
    } catch (err) {
      console.error('Photo upload error:', err);
      toast.error(err.message || 'Failed to update photo');
    } finally {
      setPhotoUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving(true);
    try {
      const url = await uploadBannerImage(file);
      await updateProfile({ bannerURL: url });
      setProfile((p) => ({ ...p, bannerURL: url }));
      toast.success('Banner image updated');
    } catch (err) {
      toast.error(err.message || 'Failed to update banner');
    } finally {
      setSaving(false);
      if (bannerInputRef.current) bannerInputRef.current.value = '';
    }
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Cancel this booking request?')) return;
    try {
      await cancelBooking(id);
      toast.success('Booking cancelled');
      loadBookings();
    } catch (err) {
      toast.error(err.message || 'Failed to cancel booking');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const check = validatePassword(newPassword);
    if (!check.valid) {
      toast.error(getPasswordValidationMessage(newPassword));
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setPasswordLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      toast.error(err.code === 'auth/wrong-password' ? 'Current password is incorrect' : err.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleRemovePhoto = async () => {
    setPhotoUploading(true);
    try {
      await removeProfileImage();
      await updateProfile({ photoURL: '' });
      setProfile((p) => ({ ...p, photoURL: '' }));
      setForm((f) => ({ ...f, photoURL: '' }));
      if (updateAuthUser) updateAuthUser({ photoURL: '' });
      toast.success('Profile picture deleted successfully');
    } catch (err) {
      console.error('Remove photo error:', err);
      toast.error(err.message || 'Failed to remove photo');
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleLinkPassword = async (e) => {
    e.preventDefault();
    const check = validatePassword(linkPasswordVal);
    if (!check.valid) {
      toast.error(getPasswordValidationMessage(linkPasswordVal));
      return;
    }
    if (linkPasswordVal !== linkPasswordConfirm) {
      toast.error('Passwords do not match');
      return;
    }
    setLinking(true);
    try {
      await linkPasswordAccount(linkPasswordVal);
      toast.success('Password linked successfully! You can now sign in using Email/Password or Google.');
      setLinkPasswordVal('');
      setLinkPasswordConfirm('');
      setHasPassword(true);
      if (updateAuthUser) {
        try {
          updateAuthUser({ providers: getAuthProviders() });
        } catch {
          // ignore
        }
      }
      loadProfile();
    } catch (err) {
      toast.error(err.message || 'Failed to set password');
    } finally {
      setLinking(false);
    }
  };

  const handleLinkGoogle = async () => {
    setLinkGoogleLoading(true);
    try {
      await linkGoogleAccount();
      toast.success('Google account linked successfully! You can now sign in using Email/Password or Google.');
      setHasGoogle(true);
      if (updateAuthUser) {
        try {
          updateAuthUser({ providers: getAuthProviders() });
        } catch {
          // ignore
        }
      }
      loadProfile();
    } catch (err) {
      toast.error(err.message || 'Failed to link Google account');
    } finally {
      setLinkGoogleLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure? This will deactivate your account and remove profile data.')) return;
    try {
      await deleteAccount();
      try {
        await removeProfileImage();
      } catch {
        // ignore
      }
      await firebaseLogOut();
      logout();
      toast.info('Account deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete account');
    }
  };

  const inputClass =
    'w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-brand/30 text-sm';

  if (loading) {
    return (
      <section className="min-h-screen pt-28 pb-16 flex items-center justify-center">
        <div className="animate-pulse text-slate-400" role="status">Loading profile…</div>
      </section>
    );
  }

  const completion = profile?.profileCompletion ?? 0;

  return (
    <section className="min-h-screen pt-28 pb-16 section-padding bg-surface">
      <div className="max-w-4xl mx-auto">
        <SectionHeading badge="My Account" title="Profile Dashboard" subtitle="Manage your account, bookings, and preferences." />

        {/* Profile header card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 rounded-3xl bg-white border border-slate-100 shadow-premium overflow-hidden"
        >
          <div
            className="h-24 md:h-32 bg-gradient-to-r from-emerald-brand/20 to-deep-green/20 relative group"
            style={profile?.bannerURL ? { backgroundImage: `url(${profile.bannerURL})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
          >
            <button
              type="button"
              onClick={() => bannerInputRef.current?.click()}
              className="absolute top-3 right-3 p-2 rounded-lg bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity text-xs flex items-center gap-1"
              aria-label="Upload banner image"
            >
              <Camera size={14} /> Change banner
            </button>
            <input ref={bannerInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleBannerUpload} />
          </div>
          <div className="px-6 pb-6 -mt-12">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="relative">
                {(() => {
                  const currentPhoto = profile?.photoURL !== undefined ? profile.photoURL : (authUser?.photoURL || '');
                  return (
                    <>
                      {currentPhoto ? (
                        <img
                          src={currentPhoto}
                          alt={`${profile?.displayName || 'User'} profile`}
                          className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-emerald-brand/10 border-4 border-white flex items-center justify-center">
                          <User size={36} className="text-emerald-brand" />
                        </div>
                      )}
                      {photoUploading && (
                        <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center text-white text-xs font-medium">
                          Updating…
                        </div>
                      )}
                      <div className="absolute bottom-0 right-0 flex gap-1">
                        {Boolean(currentPhoto) && (
                          <button
                            type="button"
                            onClick={handleRemovePhoto}
                            disabled={photoUploading}
                            className="p-1.5 rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                            title="Delete profile picture"
                            aria-label="Delete profile picture"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={photoUploading}
                          className="p-1.5 rounded-full bg-emerald-brand text-white shadow-lg hover:bg-deep-green transition-colors disabled:opacity-50"
                          title="Upload profile picture"
                          aria-label="Upload profile picture"
                        >
                          <Camera size={14} />
                        </button>
                      </div>
                    </>
                  );
                })()}
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhotoUpload} />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-deep-green">
                  {profile?.displayName || 'Lake Valley User'}
                </h2>
                {profile?.username && (
                  <p className="text-sm text-emerald-brand">@{profile.username}</p>
                )}
                <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
                  <Mail size={14} /> {profile?.email}
                </p>
              </div>
              <div className="flex gap-2">
                <Link to="/contact#booking">
                  <Button variant="primary" size="sm">New Booking</Button>
                </Link>
                <Button variant="outline" size="sm" onClick={logout}>
                  <LogOut size={16} /> Sign Out
                </Button>
              </div>
            </div>

            {/* Profile completion */}
            <div className="mt-6">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Profile completion</span>
                <span>{completion}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                <div className="h-full bg-emerald-brand rounded-full transition-all duration-500" style={{ width: `${completion}%` }} />
              </div>
            </div>

            {/* Meta info */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Calendar size={12} /> Member since {profile?.memberSince ? new Date(profile.memberSince).toLocaleDateString() : '—'}
              </span>
              <span className="flex items-center gap-1 capitalize">
                Status: {profile?.accountStatus || 'active'}
              </span>
              <span className="flex items-center gap-1">
                Last login: {profile?.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleDateString() : '—'}
              </span>
              <span className="flex items-center gap-1 capitalize">
                Provider: {profile?.provider || 'email'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="mt-6 flex gap-1 overflow-x-auto pb-1" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors',
                activeTab === tab.id
                  ? 'bg-emerald-brand text-white'
                  : 'bg-white text-slate-600 border border-slate-200/60 hover:bg-emerald-brand/10'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-6 md:p-8 rounded-3xl bg-white border border-slate-100 shadow-premium"
        >
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-deep-green">Personal Information</h3>
                <Button variant="outline" size="sm" onClick={() => setEditing(!editing)}>
                  <Edit3 size={14} /> {editing ? 'Cancel' : 'Edit Profile'}
                </Button>
              </div>

              {editing ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    ['displayName', 'Full Name', 'text'],
                    ['username', 'Username', 'text'],
                    ['phone', 'Phone', 'tel'],
                    ['dateOfBirth', 'Date of Birth', 'date'],
                  ].map(([key, label, type]) => (
                    <div key={key}>
                      <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
                      <input
                        type={type}
                        value={
                          form[key]
                            ? key === 'dateOfBirth'
                              ? typeof form[key] === 'string'
                                ? form[key].slice(0, 10)
                                : form[key] instanceof Date && !isNaN(form[key].getTime())
                                  ? form[key].toISOString().slice(0, 10)
                                  : ''
                              : form[key]
                            : ''
                        }
                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Country</label>
                    <select
                      value={COUNTRY_LIST.includes(form.country) ? form.country : (form.country ? 'Other' : '')}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'Other') {
                          setForm({ ...form, country: 'Other' });
                        } else {
                          setForm({ ...form, country: val });
                        }
                      }}
                      className={inputClass}
                    >
                      <option value="">Select Country</option>
                      {COUNTRY_LIST.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                      <option value="Other">Other / Custom</option>
                    </select>
                    {(!COUNTRY_LIST.includes(form.country) || form.country === 'Other') && form.country !== '' && (
                      <input
                        type="text"
                        placeholder="Type your country name..."
                        value={form.country === 'Other' ? '' : form.country || ''}
                        onChange={(e) => setForm({ ...form, country: e.target.value })}
                        className={`${inputClass} mt-2`}
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Gender</label>
                    <select
                      value={form.gender || ''}
                      onChange={(e) => setForm({ ...form, gender: e.target.value })}
                      className={inputClass}
                    >
                      <option value="">Prefer not to say</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Address</label>
                    <input type="text" value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} className={inputClass} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Bio</label>
                    <textarea rows={3} value={form.bio || ''} onChange={(e) => setForm({ ...form, bio: e.target.value })} className={`${inputClass} resize-none`} maxLength={500} />
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs font-medium text-slate-500 mb-2">Social Links</p>
                    <div className="grid md:grid-cols-2 gap-3">
                      {['facebook', 'twitter', 'linkedin', 'instagram'].map((platform) => (
                        <div key={platform}>
                          <label className="block text-xs text-slate-400 mb-1 capitalize">{platform}</label>
                          <input
                            type="url"
                            value={form.socialLinks?.[platform] || ''}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                socialLinks: { ...form.socialLinks, [platform]: e.target.value },
                              })
                            }
                            className={inputClass}
                            placeholder={`https://${platform}.com/...`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <Button variant="primary" onClick={handleSaveProfile} disabled={saving}>
                      {saving ? 'Saving…' : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              ) : (
                <dl className="grid md:grid-cols-2 gap-4 text-sm">
                  {[
                    ['Full Name', profile?.displayName],
                    ['Username', profile?.username ? `@${profile.username}` : null],
                    ['Email', profile?.email],
                    ['Phone', profile?.phone],
                    ['Date of Birth', profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : null],
                    ['Gender', profile?.gender],
                    ['Country', profile?.country],
                    ['Address', profile?.address],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-xs text-slate-400">{label}</dt>
                      <dd className="text-deep-green font-medium mt-0.5">{value || '—'}</dd>
                    </div>
                  ))}
                  {profile?.bio && (
                    <div className="md:col-span-2">
                      <dt className="text-xs text-slate-400">Bio</dt>
                      <dd className="text-deep-green font-medium mt-0.5">{profile.bio}</dd>
                    </div>
                  )}
                  {profile?.socialLinks && Object.values(profile.socialLinks).some(Boolean) && (
                    <div className="md:col-span-2">
                      <dt className="text-xs text-slate-400 mb-1">Social Links</dt>
                      <dd className="flex flex-wrap gap-2">
                        {Object.entries(profile.socialLinks)
                          .filter(([, url]) => url)
                          .map(([platform, url]) => (
                            <a
                              key={platform}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs px-2 py-1 rounded-lg bg-emerald-brand/10 text-emerald-brand capitalize hover:underline"
                            >
                              {platform}
                            </a>
                          ))}
                      </dd>
                    </div>
                  )}
                </dl>
              )}
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    placeholder="Search by project or booking ID…"
                    value={bookingSearch}
                    onChange={(e) => setBookingSearch(e.target.value)}
                    className={`${inputClass} pl-9`}
                    aria-label="Search bookings"
                  />
                </div>
                <div className="flex gap-1 overflow-x-auto">
                  {BOOKING_FILTERS.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setBookingFilter(f.id)}
                      className={cn(
                        'px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors',
                        bookingFilter === f.id ? 'bg-emerald-brand text-white' : 'bg-slate-100 text-slate-600'
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {bookingsLoading ? (
                <p className="text-sm text-slate-400">Loading bookings…</p>
              ) : bookings.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No bookings found.{' '}
                  <Link to="/contact#booking" className="text-emerald-brand hover:underline">Book a site visit</Link>
                </p>
              ) : (
                <ul className="space-y-3">
                  {bookings.map((b) => (
                    <li key={b._id || b.bookingId} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                        <div>
                          <p className="font-bold text-deep-green">{b.project || 'Lake Valley Flower City'}</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            ID: <span className="font-mono text-emerald-brand">{b.bookingId || b._id?.slice(-8)}</span> · Plot Size: {b.plotSize || 'N/A'} · Requested on {new Date(b.createdAt || Date.now()).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-brand/10 text-emerald-brand font-medium capitalize">
                            {b.status?.replace(/_/g, ' ')}
                          </span>
                          {b.paymentStatus && b.paymentStatus !== 'not_applicable' && (
                            <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-800 font-medium capitalize">
                              {b.paymentStatus}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* International Investment Estimator Details */}
                      {b.estimatorDetails && (b.estimatorDetails.katha || b.estimatorDetails.formattedTotal || b.estimatorDetails.totalPriceUSD > 0) && (
                        <div className="p-3 rounded-xl bg-emerald-brand/5 border border-emerald-brand/15 text-xs space-y-1.5 mt-2">
                          <div className="flex items-center gap-1.5 font-bold text-emerald-brand uppercase tracking-wider text-[11px]">
                            <Calculator size={14} />
                            International Investment Estimator Details
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-700">
                            <div>
                              <span className="text-slate-400 block text-[10px]">Plot Size</span>
                              <span className="font-semibold">{b.estimatorDetails.katha ? `${b.estimatorDetails.katha} Katha` : b.plotSize || '—'}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Down Payment ({b.estimatorDetails.downPaymentPercent || 0}%)</span>
                              <span className="font-semibold text-emerald-brand">
                                {b.estimatorDetails.formattedDownPayment || (b.estimatorDetails.downPaymentUSD ? `${b.estimatorDetails.downPaymentUSD}` : '—')}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Monthly ({b.estimatorDetails.months || 0} Mos)</span>
                              <span className="font-semibold text-amber-700">
                                {b.estimatorDetails.formattedMonthly || (b.estimatorDetails.monthlyInstallmentUSD ? `${b.estimatorDetails.monthlyInstallmentUSD}/mo` : '—')}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {b.message && (
                        <p className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
                          <span className="font-semibold text-slate-500">Note: </span>
                          {b.message}
                        </p>
                      )}

                      {!['cancelled', 'closed'].includes(b.status) && (
                        <button
                          type="button"
                          onClick={() => handleCancelBooking(b._id || b.bookingId)}
                          className="pt-1 text-xs text-red-500 hover:underline flex items-center gap-1 font-medium transition-colors"
                        >
                          <XCircle size={14} /> Cancel booking request
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {activeTab === 'messages' && (
            <div>
              <h3 className="text-lg font-bold text-deep-green mb-4 flex items-center gap-2">
                <MessageSquareText size={20} /> Contact Messages
              </h3>
              {messagesLoading ? (
                <p className="text-sm text-slate-400">Loading messages…</p>
              ) : messages.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No messages yet.{' '}
                  <Link to="/contact" className="text-emerald-brand hover:underline">Contact us</Link>
                </p>
              ) : (
                <ul className="space-y-3">
                  {messages.map((msg) => (
                    <li key={msg._id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                      <div className="flex justify-between items-start">
                        <p className="font-bold text-deep-green">{msg.subject}</p>
                        <span className="text-xs px-2 py-1 rounded-full bg-emerald-brand/10 text-emerald-brand capitalize">{msg.status}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{new Date(msg.createdAt).toLocaleDateString()}</p>
                      <p className="text-sm text-slate-600 mt-2">{msg.message}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-bold text-deep-green mb-2 flex items-center gap-2">
                  <Shield size={20} /> Security & Passwords
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Account Provider: <span className="font-semibold text-emerald-brand capitalize">{profile?.provider || 'Email'}</span>
                </p>

                <div className="space-y-6">
                  {/* Sign-in methods */}
                  <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50">
                    <h4 className="text-sm font-bold text-deep-green mb-2">Sign-in Methods</h4>
                    <p className="text-xs text-slate-500 mb-3">
                      Manage how you sign in. You can use Email/Password, Google, or both.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200">
                        <div className="flex items-center gap-2 text-xs">
                          <Mail size={14} className="text-emerald-brand" />
                          <span className="font-bold text-deep-green">Email / Password</span>
                        </div>
                        <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', hasPassword ? 'bg-emerald-brand/10 text-emerald-brand' : 'bg-slate-200 text-slate-500')}>
                          {hasPassword ? 'Linked' : 'Not linked'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200">
                        <div className="flex items-center gap-2 text-xs">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" aria-hidden="true">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                          </svg>
                          <span className="font-bold text-deep-green">Google</span>
                        </div>
                        {hasGoogle ? (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-brand/10 text-emerald-brand">Linked</span>
                        ) : (
                          <Button variant="outline" size="sm" onClick={handleLinkGoogle} disabled={linkGoogleLoading}>
                            {linkGoogleLoading ? 'Linking…' : 'Link Google'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className={cn('grid gap-8', hasPassword ? '' : 'md:grid-cols-2')}>
                    <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50">
                      <h4 className="text-sm font-bold text-deep-green mb-3">Change Existing Password</h4>
                      <form onSubmit={handleChangePassword} className="space-y-4">
                        <PasswordInput id="current-pw" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Current password" required autoComplete="current-password" />
                        <PasswordInput id="new-pw" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" showStrength required autoComplete="new-password" />
                        <PasswordInput id="confirm-pw" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} placeholder="Confirm new password" required autoComplete="new-password" />
                        <Button type="submit" variant="primary" size="sm" disabled={passwordLoading}>
                          {passwordLoading ? 'Updating…' : 'Update Password'}
                        </Button>
                      </form>
                    </div>

                    {!hasPassword && (
                      <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50">
                        <h4 className="text-sm font-bold text-deep-green mb-1">Set Password (Link Account)</h4>
                        <p className="text-xs text-slate-500 mb-3">
                          If you registered using Google, set a password to enable Email/Password sign-in.
                        </p>
                        <form onSubmit={handleLinkPassword} className="space-y-4">
                          <PasswordInput id="link-pw" value={linkPasswordVal} onChange={(e) => setLinkPasswordVal(e.target.value)} placeholder="New password" showStrength required autoComplete="new-password" />
                          <PasswordInput id="link-pw-confirm" value={linkPasswordConfirm} onChange={(e) => setLinkPasswordConfirm(e.target.value)} placeholder="Confirm password" required autoComplete="new-password" />
                          <Button type="submit" variant="outline" size="sm" disabled={linking}>
                            {linking ? 'Linking…' : 'Set Password'}
                          </Button>
                        </form>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-6">
                <h3 className="text-lg font-bold text-red-500 mb-2 flex items-center gap-2">
                  <Trash2 size={20} /> Delete Account
                </h3>
                <p className="text-sm text-slate-500 mb-4">
                  This will deactivate your account and remove your profile data. Your Firebase account must be deleted separately from Firebase settings.
                </p>
                <Button variant="outline" size="sm" onClick={handleDeleteAccount} className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
                  Delete Account
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
