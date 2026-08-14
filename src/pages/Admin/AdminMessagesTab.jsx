import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Phone,
  Calendar,
  Clock,
  Search,
  Trash2,
  Check,
  Download,
  RefreshCw,
  Eye,
  Send,
  Copy,
  Building2,
  Sparkles,
  Inbox,
  X,
  Layers,
} from 'lucide-react';
import {
  getAllContactMessages,
  updateContactMessageStatus,
  deleteContactMessage,
} from '../../api/contactApi';
import {
  getAllBookings,
  updateBookingStatus,
  deleteBooking,
} from '../../api/bookingApi';
import { useToast } from '../../context/ToastContext';

export default function AdminMessagesTab() {
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [contactMessages, setContactMessages] = useState([]);
  const [bookingInquiries, setBookingInquiries] = useState([]);

  // Active sub-tab: 'all' | 'contact' | 'bookings'
  const [activeSubTab, setActiveSubTab] = useState('all');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'new' | 'read' | 'replied'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest'

  // Selected item for full detail view modal
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  // Fetch all messages and bookings
  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const [contacts, bookings] = await Promise.all([
        getAllContactMessages().catch(() => []),
        getAllBookings().catch(() => []),
      ]);

      setContactMessages(Array.isArray(contacts) ? contacts : []);
      setBookingInquiries(Array.isArray(bookings) ? bookings : []);
    } catch (err) {
      addToast('Failed to fetch messages: ' + err.message, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Combine both sources with unified format
  const unifiedItems = useMemo(() => {
    const contacts = contactMessages.map((m) => ({
      ...m,
      id: m._id || m.id,
      itemType: 'contact',
      typeLabel: 'Contact Message',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      senderName: m.name || 'Anonymous Client',
      senderEmail: m.email || '',
      senderPhone: m.phone || '',
      subjectOrProject: m.subject || 'Website Inquiry',
      bodyMessage: m.message || '',
      createdAtDate: m.createdAt ? new Date(m.createdAt) : new Date(),
      status: m.status || 'new',
    }));

    const bookings = bookingInquiries.map((b) => ({
      ...b,
      id: b._id || b.id || b.bookingId,
      itemType: 'booking',
      typeLabel: 'Plot Booking Inquiry',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      senderName: b.name || 'Anonymous Client',
      senderEmail: b.email || '',
      senderPhone: b.phone || '',
      subjectOrProject: `${b.project || 'Lake Valley Project'}${b.plotSize ? ` (${b.plotSize})` : ''}`,
      bodyMessage: b.message || 'Expressed direct interest in booking plot / property.',
      createdAtDate: b.createdAt ? new Date(b.createdAt) : new Date(),
      status: b.status || 'new',
    }));

    let list = [];
    if (activeSubTab === 'all') {
      list = [...contacts, ...bookings];
    } else if (activeSubTab === 'contact') {
      list = contacts;
    } else if (activeSubTab === 'bookings') {
      list = bookings;
    }

    // Apply Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((item) => {
        const name = (item.senderName || '').toLowerCase();
        const email = (item.senderEmail || '').toLowerCase();
        const phone = (item.senderPhone || '').toLowerCase();
        const subject = (item.subjectOrProject || '').toLowerCase();
        const body = (item.bodyMessage || '').toLowerCase();
        return (
          name.includes(q) ||
          email.includes(q) ||
          phone.includes(q) ||
          subject.includes(q) ||
          body.includes(q)
        );
      });
    }

    // Apply Status Filter
    if (statusFilter !== 'all') {
      list = list.filter((item) => item.status === statusFilter);
    }

    // Apply Sorting
    list.sort((a, b) => {
      if (sortBy === 'oldest') {
        return a.createdAtDate - b.createdAtDate;
      }
      return b.createdAtDate - a.createdAtDate;
    });

    return list;
  }, [contactMessages, bookingInquiries, activeSubTab, searchQuery, statusFilter, sortBy]);

  // Statistics counters
  const stats = useMemo(() => {
    const all = [...contactMessages, ...bookingInquiries];
    const totalCount = all.length;
    const newCount = all.filter((i) => (i.status || 'new') === 'new').length;
    const readCount = all.filter((i) => i.status === 'read').length;
    const repliedCount = all.filter((i) => i.status === 'replied').length;
    const contactCount = contactMessages.length;
    const bookingCount = bookingInquiries.length;

    return {
      total: totalCount,
      newCount,
      readCount,
      repliedCount,
      contacts: contactCount,
      bookings: bookingCount,
    };
  }, [contactMessages, bookingInquiries]);

  // Handle status update
  const handleUpdateStatus = async (item, newStatus) => {
    try {
      if (item.itemType === 'contact') {
        await updateContactMessageStatus(item.id, newStatus);
        setContactMessages((prev) =>
          prev.map((m) => ((m._id || m.id) === item.id ? { ...m, status: newStatus } : m))
        );
      } else {
        await updateBookingStatus(item.id, newStatus);
        setBookingInquiries((prev) =>
          prev.map((b) =>
            (b._id || b.id || b.bookingId) === item.id ? { ...b, status: newStatus } : b
          )
        );
      }

      if (selectedItem && selectedItem.id === item.id) {
        setSelectedItem((prev) => ({ ...prev, status: newStatus }));
      }

      addToast(`Marked as ${newStatus}`, 'success');
    } catch (err) {
      addToast('Failed to update status: ' + err.message, 'error');
    }
  };

  // Handle delete
  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    try {
      if (itemToDelete.itemType === 'contact') {
        await deleteContactMessage(itemToDelete.id);
        setContactMessages((prev) =>
          prev.filter((m) => (m._id || m.id) !== itemToDelete.id)
        );
      } else {
        await deleteBooking(itemToDelete.id);
        setBookingInquiries((prev) =>
          prev.filter((b) => (b._id || b.id || b.bookingId) !== itemToDelete.id)
        );
      }

      if (selectedItem && selectedItem.id === itemToDelete.id) {
        setSelectedItem(null);
      }

      addToast('Message deleted successfully', 'info');
      setItemToDelete(null);
    } catch (err) {
      addToast('Failed to delete message: ' + err.message, 'error');
    }
  };

  // Copy helper
  const copyToClipboard = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    addToast(`${fieldName} copied to clipboard!`, 'info');
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (unifiedItems.length === 0) {
      addToast('No messages to export', 'warning');
      return;
    }

    const headers = [
      'Type',
      'Sender Name',
      'Email',
      'Phone',
      'Subject / Project',
      'Message',
      'Status',
      'Submitted At',
      'Katha Size',
      'Estimated Total Price',
    ];

    const rows = unifiedItems.map((item) => [
      `"${item.typeLabel}"`,
      `"${(item.senderName || '').replace(/"/g, '""')}"`,
      `"${(item.senderEmail || '').replace(/"/g, '""')}"`,
      `"${(item.senderPhone || '').replace(/"/g, '""')}"`,
      `"${(item.subjectOrProject || '').replace(/"/g, '""')}"`,
      `"${(item.bodyMessage || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
      `"${item.status}"`,
      `"${item.createdAtDate.toLocaleString()}"`,
      `"${item.estimatorDetails?.katha || item.plotSize || ''}"`,
      `"${item.estimatorDetails?.formattedTotal || item.estimatorDetails?.totalPriceUSD || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `lake_valley_client_messages_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('Client messages exported to CSV successfully', 'success');
  };

  const formatRelativeTime = (date) => {
    try {
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 2) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP STATS OVERVIEW */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Inbox className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800">{stats.total}</p>
            <p className="text-xs text-slate-500 font-medium">Total Inquiries</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-4 relative overflow-hidden">
          {stats.newCount > 0 && (
            <span className="absolute top-3 right-3 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          )}
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-emerald-600">{stats.newCount}</p>
            <p className="text-xs text-slate-500 font-medium">New / Unread</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800">{stats.contacts}</p>
            <p className="text-xs text-slate-500 font-medium">Contact Form Messages</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800">{stats.bookings}</p>
            <p className="text-xs text-slate-500 font-medium">Plot & Booking Leads</p>
          </div>
        </div>
      </div>

      {/* 2. CONTROLS BAR: SUB-TABS, SEARCH, FILTERS, EXPORT & REFRESH */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Sub-tab buttons */}
          <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
            <button
              onClick={() => setActiveSubTab('all')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeSubTab === 'all'
                  ? 'bg-white text-emerald-brand shadow-sm font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              All Submissions ({stats.total})
            </button>
            <button
              onClick={() => setActiveSubTab('contact')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeSubTab === 'contact'
                  ? 'bg-white text-emerald-brand shadow-sm font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              Contact Form ({stats.contacts})
            </button>
            <button
              onClick={() => setActiveSubTab('bookings')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeSubTab === 'bookings'
                  ? 'bg-white text-emerald-brand shadow-sm font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Plot Inquiries ({stats.bookings})
            </button>
          </div>

          {/* Export and Refresh action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Export to CSV spreadsheet"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              Export CSV
            </button>
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="px-3.5 py-2 rounded-xl bg-emerald-brand text-white hover:bg-emerald-brand/90 font-medium text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
              title="Fetch latest client messages"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Search, Status and Sort Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-slate-100">
          {/* Search box */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by client name, email, phone, subject, or message..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-brand focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status filter */}
          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-emerald-brand focus:bg-white"
            >
              <option value="all">All Statuses ({stats.total})</option>
              <option value="new">🟢 New / Unread ({stats.newCount})</option>
              <option value="read">🔵 Read ({stats.readCount})</option>
              <option value="replied">🟣 Replied ({stats.repliedCount})</option>
            </select>
          </div>

          {/* Sort order */}
          <div className="sm:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-emerald-brand focus:bg-white"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. MESSAGES LIST */}
      {loading ? (
        <div className="bg-white rounded-3xl p-16 border border-slate-200/80 shadow-sm text-center">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">Loading client messages & inquiries...</p>
        </div>
      ) : unifiedItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 border border-slate-200/80 shadow-sm text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <Inbox className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No messages found</h3>
          <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
            {searchQuery || statusFilter !== 'all'
              ? 'No messages matched your search or status filter criteria.'
              : 'Clients have not submitted any contact messages or booking inquiries yet.'}
          </p>
          {(searchQuery || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {unifiedItems.map((item) => {
            const isNew = (item.status || 'new') === 'new';
            const isReplied = item.status === 'replied';

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-2xl p-5 border transition-all hover:shadow-md cursor-pointer ${
                  isNew
                    ? 'border-emerald-300 bg-emerald-50/20 shadow-sm'
                    : 'border-slate-200/80 hover:border-slate-300'
                }`}
                onClick={() => setSelectedItem(item)}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Sender & Content Preview */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    {/* Avatar circle */}
                    <div
                      className={`w-11 h-11 rounded-2xl flex-shrink-0 flex items-center justify-center font-bold text-sm shadow-sm ${
                        item.itemType === 'booking'
                          ? 'bg-gradient-to-br from-emerald-500 to-teal-700 text-white'
                          : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'
                      }`}
                    >
                      {(item.senderName || 'C').charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-bold text-sm text-slate-900 truncate">
                          {item.senderName}
                        </span>

                        {/* Type badge */}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${item.badgeColor}`}
                        >
                          {item.typeLabel}
                        </span>

                        {/* Status badge */}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isNew
                              ? 'bg-emerald-100 text-emerald-800 font-extrabold'
                              : isReplied
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {isNew ? '● New' : isReplied ? '✓ Replied' : 'Read'}
                        </span>

                        {/* Relative time */}
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 ml-auto">
                          <Clock className="w-3 h-3" />
                          {formatRelativeTime(item.createdAtDate)}
                        </span>
                      </div>

                      {/* Contact Info Subtitle */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-2">
                        {item.senderEmail && (
                          <span className="flex items-center gap-1 text-slate-600">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {item.senderEmail}
                          </span>
                        )}
                        {item.senderPhone && (
                          <span className="flex items-center gap-1 text-emerald-700 font-medium">
                            <Phone className="w-3 h-3 text-emerald-500" />
                            {item.senderPhone}
                          </span>
                        )}
                        {item.estimatorDetails?.katha && (
                          <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded text-[10px] font-semibold">
                            📐 {item.estimatorDetails.katha} Katha Plot
                          </span>
                        )}
                      </div>

                      {/* Subject and Message Snippet */}
                      <div className="text-xs">
                        <p className="font-semibold text-slate-800 truncate mb-0.5">
                          {item.subjectOrProject}
                        </p>
                        <p className="text-slate-600 line-clamp-2 leading-relaxed">
                          {item.bodyMessage}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div
                    className="flex items-center gap-1.5 self-end lg:self-center border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {item.senderEmail && (
                      <a
                        href={`mailto:${item.senderEmail}?subject=Re: ${encodeURIComponent(
                          item.subjectOrProject
                        )}&body=Dear ${encodeURIComponent(
                          item.senderName
                        )},\n\nThank you for reaching out to Lake Valley Flower City regarding "${item.subjectOrProject}".\n\n`}
                        onClick={() => handleUpdateStatus(item, 'replied')}
                        className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200 hover:border-emerald-200 text-xs font-semibold transition-all flex items-center gap-1"
                        title="Reply via Email"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Reply</span>
                      </a>
                    )}

                    {item.senderPhone && (
                      <a
                        href={`tel:${item.senderPhone}`}
                        className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200 hover:border-emerald-200 text-xs font-semibold transition-all flex items-center gap-1"
                        title="Call Client"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Call</span>
                      </a>
                    )}

                    {isNew ? (
                      <button
                        onClick={() => handleUpdateStatus(item, 'read')}
                        className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs transition-all"
                        title="Mark as Read"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdateStatus(item, 'new')}
                        className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 border border-slate-200 text-xs transition-all"
                        title="Mark as New / Unread"
                      >
                        <Clock className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedItem(item)}
                      className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-all flex items-center gap-1"
                      title="View Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">View</span>
                    </button>

                    <button
                      onClick={() => setItemToDelete(item)}
                      className="p-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 text-xs transition-all"
                      title="Delete Message"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* 4. DETAIL MODAL / DRAWER */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto space-y-6"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-base text-white shadow-md ${
                      selectedItem.itemType === 'booking'
                        ? 'bg-gradient-to-br from-emerald-600 to-teal-700'
                        : 'bg-gradient-to-br from-blue-600 to-indigo-700'
                    }`}
                  >
                    {(selectedItem.senderName || 'C').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-slate-900">
                        {selectedItem.senderName}
                      </h3>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          selectedItem.status === 'new'
                            ? 'bg-emerald-100 text-emerald-800'
                            : selectedItem.status === 'replied'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        Status: {selectedItem.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      Received on {selectedItem.createdAtDate.toLocaleString()}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sender Details Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Email */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      Email Address
                    </p>
                    <p className="text-xs font-semibold text-slate-800 truncate">
                      {selectedItem.senderEmail || 'Not provided'}
                    </p>
                  </div>
                  {selectedItem.senderEmail && (
                    <button
                      onClick={() => copyToClipboard(selectedItem.senderEmail, 'Email')}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white transition-all cursor-pointer"
                      title="Copy Email"
                    >
                      {copiedField === 'Email' ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>

                {/* Phone */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      Phone Number
                    </p>
                    <p className="text-xs font-semibold text-slate-800 truncate">
                      {selectedItem.senderPhone || 'Not provided'}
                    </p>
                  </div>
                  {selectedItem.senderPhone && (
                    <button
                      onClick={() => copyToClipboard(selectedItem.senderPhone, 'Phone')}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white transition-all cursor-pointer"
                      title="Copy Phone"
                    >
                      {copiedField === 'Phone' ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Subject / Purpose */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                  Subject / Project Inquiry
                </p>
                <p className="text-sm font-bold text-slate-900">
                  {selectedItem.subjectOrProject}
                </p>
              </div>

              {/* International Investment Estimator Breakdown (if available) */}
              {selectedItem.estimatorDetails && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    International Investment Estimator Calculation
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                      <span className="text-slate-400 block text-[10px]">Plot Katha</span>
                      <span className="font-bold text-slate-800">
                        {selectedItem.estimatorDetails.katha} Katha
                      </span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                      <span className="text-slate-400 block text-[10px]">Down Payment</span>
                      <span className="font-bold text-slate-800">
                        {selectedItem.estimatorDetails.formattedDownPayment ||
                          `${selectedItem.estimatorDetails.downPaymentPercent}%`}
                      </span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                      <span className="text-slate-400 block text-[10px]">Tenure</span>
                      <span className="font-bold text-slate-800">
                        {selectedItem.estimatorDetails.months} Months
                      </span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                      <span className="text-slate-400 block text-[10px]">Monthly Installment</span>
                      <span className="font-bold text-emerald-700">
                        {selectedItem.estimatorDetails.formattedMonthly ||
                          `$${selectedItem.estimatorDetails.monthlyInstallmentUSD}`}
                      </span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-emerald-100 sm:col-span-2">
                      <span className="text-slate-400 block text-[10px]">Total Price</span>
                      <span className="font-black text-emerald-800 text-sm">
                        {selectedItem.estimatorDetails.formattedTotal ||
                          `$${selectedItem.estimatorDetails.totalPriceUSD}`}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Full Message Body */}
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">
                  Client Message
                </p>
                <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-normal">
                  {selectedItem.bodyMessage || 'No text message provided.'}
                </div>
              </div>

              {/* Status Update Quick Toggles */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-400 font-medium">Update Status:</span>
                  <button
                    onClick={() => handleUpdateStatus(selectedItem, 'new')}
                    className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
                      selectedItem.status === 'new'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    New
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedItem, 'read')}
                    className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
                      selectedItem.status === 'read'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Read
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedItem, 'replied')}
                    className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
                      selectedItem.status === 'replied'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Replied
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {selectedItem.senderEmail && (
                    <a
                      href={`mailto:${selectedItem.senderEmail}?subject=Re: ${encodeURIComponent(
                        selectedItem.subjectOrProject
                      )}&body=Dear ${encodeURIComponent(
                        selectedItem.senderName
                      )},\n\nThank you for reaching out to Lake Valley Flower City regarding "${selectedItem.subjectOrProject}".\n\n`}
                      onClick={() => handleUpdateStatus(selectedItem, 'replied')}
                      className="px-4 py-2 rounded-xl bg-emerald-brand text-white text-xs font-bold shadow-md hover:bg-emerald-brand/90 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Reply via Email
                    </a>
                  )}

                  <button
                    onClick={() => {
                      setItemToDelete(selectedItem);
                    }}
                    className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition-all cursor-pointer"
                    title="Delete Message"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {itemToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900">Delete Message?</h3>
                <p className="text-slate-500 text-xs mt-1">
                  Are you sure you want to permanently delete the message from{' '}
                  <span className="font-bold text-slate-800">
                    "{itemToDelete.senderName}"
                  </span>
                  ? This action cannot be undone.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl text-left border border-slate-200 text-xs space-y-1">
                <p className="font-semibold text-slate-800">{itemToDelete.subjectOrProject}</p>
                <p className="text-slate-500 truncate">{itemToDelete.bodyMessage}</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setItemToDelete(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-semibold shadow-md hover:bg-rose-700 cursor-pointer"
                >
                  Yes, Delete Message
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
