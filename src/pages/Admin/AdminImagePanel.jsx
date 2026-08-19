import { useState, useRef, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Image as ImageIcon,
  RefreshCw,
  Search,
  Trash2,
  Edit2,
  Copy,
  Check,
  Eye,
  Sliders,
  Sparkles,
  Plus,
  X,
  FileImage,
  Link as LinkIcon,
  Layers,
  FolderOpen,
  LayoutGrid,
  Save,
  Building,
  Home,
  Info,
  HelpCircle,
  MessageSquare,
  Award,
  CheckCircle2,
  Send,
  Inbox,
  ChevronRight,
  Menu,
  Globe,
  ExternalLink,
  LogOut,
  ShieldCheck,
  Cloud,
  Download,
  UploadCloud,
  Database,
  Loader2,
} from 'lucide-react';
import { useImages } from '../../context/ImageContext';
import { useContent } from '../../context/ContentContext';
import { useToast } from '../../context/ToastContext';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { syncImagesToFirestore } from '../../api/imageApi';
import Lightbox from '../../components/Shared/Lightbox';
import AdminMessagesTab from './AdminMessagesTab';
import ImageFieldPicker from '../../components/Admin/ImageFieldPicker';
import AdminLoginGate from '../../components/Admin/AdminLoginGate';

export default function AdminImagePanel() {
  const { isAdmin, adminUser, logout: adminLogout, loading: adminLoading } = useAdminAuth();
  const {
    images,
    categories,
    uploadImageFile,
    addImageUrl,
    replaceImage,
    deleteImage,
    resetImagesToDefault,
  } = useImages();

  const {
    content,
    site: contentSite,
    hero: contentHero,
    projects: contentProjects,
    about: contentAbout,
    amenities: contentAmenities,
    whyChooseUs: contentWhyChooseUs,
    testimonials: contentTestimonials,
    faqs: contentFaqs,
    cta: contentCta,
    updateSection,
    saveFullContent,
    refreshContent,
  } = useContent();

  const { addToast } = useToast();

  const [isSyncingAllCloud, setIsSyncingAllCloud] = useState(false);
  const backupFileInputRef = useRef(null);

  const handleSyncAllToCloud = async () => {
    setIsSyncingAllCloud(true);
    try {
      if (content) {
        await saveFullContent(content);
      }
      if (images && images.length > 0) {
        await syncImagesToFirestore(images);
      }
      addToast('✓ All site sections & images synced to Cloud Database successfully!', 'success');
    } catch (err) {
      addToast('Cloud sync notice: ' + (err.message || 'Failed to sync'), 'error');
    } finally {
      setIsSyncingAllCloud(false);
    }
  };

  const handleExportBackup = () => {
    try {
      const backupData = {
        title: 'Lake Valley Township CMS Backup',
        version: '1.0',
        exportedAt: new Date().toISOString(),
        siteContent: content,
        galleryImages: images,
      };
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lake-valley-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      addToast('Site backup file downloaded successfully!', 'success');
    } catch (err) {
      addToast('Export failed: ' + err.message, 'error');
    }
  };

  const handleImportBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const json = JSON.parse(evt.target.result);
        if (json.siteContent && typeof json.siteContent === 'object') {
          await saveFullContent(json.siteContent);
        }
        if (json.galleryImages && Array.isArray(json.galleryImages)) {
          await syncImagesToFirestore(json.galleryImages);
        }
        addToast('✓ Backup restored & synced across all browsers!', 'success');
        if (typeof refreshContent === 'function') refreshContent();
      } catch (err) {
        addToast('Failed to parse backup JSON: ' + err.message, 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Active Main Tab
  const [activeTab, setActiveTab] = useState('messages'); // 'messages' | 'media' | 'site' | 'hero' | 'projects' | 'about' | 'amenities' | 'why' | 'testimonials' | 'faqs' | 'cta'
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // =========================================================================
  // MEDIA TAB STATES
  // =========================================================================
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTargetSection, setSelectedTargetSection] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [replaceTargetImage, setReplaceTargetImage] = useState(null);
  const [editTargetImage, setEditTargetImage] = useState(null);
  const [deleteConfirmImage, setDeleteConfirmImage] = useState(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isResetImagesModalOpen, setIsResetImagesModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const [uploadMode, setUploadMode] = useState('file');
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imageTitle, setImageTitle] = useState('');
  const [imageCategory, setImageCategory] = useState('Township');
  const [customCategory, setCustomCategory] = useState('');
  const [imageTargetSection, setImageTargetSection] = useState('gallery');
  const [imageAlt, setImageAlt] = useState('');
  const [imageSpan] = useState('col-span-1 row-span-1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef(null);

  const [replaceMode, setReplaceMode] = useState('file');
  const [replaceFile, setReplaceFile] = useState(null);
  const [replaceFilePreview, setReplaceFilePreview] = useState('');
  const [replaceUrlInput, setReplaceUrlInput] = useState('');

  useEffect(() => {
    if (replaceFile) {
      const url = URL.createObjectURL(replaceFile);
      setReplaceFilePreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setReplaceFilePreview('');
    }
  }, [replaceFile]);

  // Filtered and Sorted Images
  const filteredImages = useMemo(() => {
    return images
      .filter((img) => {
        const matchesCategory =
          selectedCategory === 'All' || img.category === selectedCategory;
        const matchesTarget =
          selectedTargetSection === 'All' ||
          (img.targetSection || 'gallery') === selectedTargetSection;
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !query ||
          img.title?.toLowerCase().includes(query) ||
          img.alt?.toLowerCase().includes(query) ||
          img.category?.toLowerCase().includes(query) ||
          String(img.id).toLowerCase().includes(query);

        return matchesCategory && matchesTarget && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
        if (sortBy === 'oldest') return (a.id || 0) > (b.id || 0) ? 1 : -1;
        return (a.id || 0) < (b.id || 0) ? 1 : -1;
      });
  }, [images, selectedCategory, selectedTargetSection, searchQuery, sortBy]);

  const mediaStats = useMemo(() => {
    return {
      total: images.length,
      galleryCount: images.filter((i) => (i.targetSection || 'gallery') === 'gallery').length,
      heroCount: images.filter((i) => i.targetSection === 'hero').length,
      projectCount: images.filter((i) => i.targetSection === 'project').length,
      masterPlanCount: images.filter((i) => i.targetSection === 'masterplan').length,
    };
  }, [images]);

  // =========================================================================
  // SITE BRANDING FORM STATE
  // =========================================================================
  const [siteForm, setSiteForm] = useState({
    siteName: '',
    siteNameBn: '',
    companyName: '',
    tagline: '',
    logo: '',
    phone: '',
    phones: [],
    phoneRaw: '',
    email: '',
    headOffice: '',
    corporateOffice: '',
    hours: '',
    facebook: '',
    instagram: '',
    youtube: '',
    linkedin: '',
  });

  useEffect(() => {
    if (contentSite) {
      setSiteForm({
        siteName: contentSite.siteName || '',
        siteNameBn: contentSite.siteNameBn || '',
        companyName: contentSite.companyName || '',
        tagline: contentSite.tagline || '',
        logo: contentSite.logo || '',
        phone: contentSite.phone || '',
        phones: contentSite.phones || [],
        phoneRaw: contentSite.phoneRaw || '',
        email: contentSite.email || '',
        headOffice: contentSite.headOffice || '',
        corporateOffice: contentSite.corporateOffice || '',
        hours: contentSite.hours || '',
        facebook: contentSite.facebook || '',
        instagram: contentSite.instagram || '',
        youtube: contentSite.youtube || '',
        linkedin: contentSite.linkedin || '',
      });
    }
  }, [contentSite]);

  const handleSaveSite = async () => {
    setIsSubmitting(true);
    try {
      const phonesArray = typeof siteForm.phones === 'string'
        ? siteForm.phones.split(',').map((p) => p.trim()).filter(Boolean)
        : siteForm.phones;

      await updateSection('site', {
        ...siteForm,
        phones: phonesArray,
      });
      addToast('Site branding and contact info saved!', 'success');
    } catch (err) {
      addToast('Failed to save site settings: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================================================
  // HERO SLIDER & STATS FORM STATE
  // =========================================================================
  const [heroForm, setHeroForm] = useState({
    slides: [],
    stats: [],
  });

  useEffect(() => {
    if (contentHero) {
      setHeroForm({
        slides: contentHero.slides ? JSON.parse(JSON.stringify(contentHero.slides)) : [],
        stats: contentHero.stats ? JSON.parse(JSON.stringify(contentHero.stats)) : [],
      });
    }
  }, [contentHero]);

  const handleSaveHero = async () => {
    setIsSubmitting(true);
    try {
      await updateSection('hero', heroForm);
      addToast('Hero slider content & banner images saved successfully!', 'success');
    } catch (err) {
      addToast('Failed to save hero section: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================================================
  // PROJECTS LIST FORM STATE
  // =========================================================================
  const [projectsForm, setProjectsForm] = useState([]);
  const [selectedProjectIndex, setSelectedProjectIndex] = useState(0);

  useEffect(() => {
    if (contentProjects) {
      setProjectsForm(JSON.parse(JSON.stringify(contentProjects)));
    }
  }, [contentProjects]);

  const handleSaveProjects = async () => {
    setIsSubmitting(true);
    try {
      await updateSection('projects', projectsForm);
      addToast('Projects and cover/banner images saved successfully!', 'success');
    } catch (err) {
      addToast('Failed to save projects: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddProject = () => {
    const newProj = {
      id: 'proj-' + Date.now(),
      slug: 'new-project-' + Date.now(),
      title: 'New Real Estate Project',
      titleBn: 'নতুন প্রকল্প',
      tagline: 'Residential / Commercial',
      shortDescription: 'Short description of the new project development.',
      fullDescription: 'Comprehensive full description of the new project development.',
      image: 'https://lakevalleyflowercity.com/uploads/gallery-images/1785062826_00838.jpg',
      heroImage: 'https://lakevalleyflowercity.com/uploads/gallery-images/1785062826_00838.jpg',
      location: 'Lake Valley Flower City Township',
      stats: {
        area: '50 Acres',
        plots: '200 Units',
        startingPriceUSD: 25000,
        plotSizes: '3 - 5 Katha',
      },
      features: ['24/7 Security', 'Wide Roads', 'Solar Lights'],
      amenities: ['Central Park', 'Clubhouse'],
      mapLocation: {
        lat: 23.8103,
        lng: 90.4125,
      },
    };
    const updated = [...projectsForm, newProj];
    setProjectsForm(updated);
    setSelectedProjectIndex(updated.length - 1);
    addToast('New project created. Edit details below and click Save.', 'info');
  };

  const handleDeleteProject = (index) => {
    if (window.confirm(`Are you sure you want to delete "${projectsForm[index]?.title}"?`)) {
      const updated = projectsForm.filter((_, i) => i !== index);
      setProjectsForm(updated);
      setSelectedProjectIndex(Math.max(0, index - 1));
      addToast('Project removed.', 'info');
    }
  };

  // =========================================================================
  // ABOUT PAGE FORM STATE
  // =========================================================================
  const [aboutForm, setAboutForm] = useState({
    heroTitle: '',
    heroTitleBn: '',
    heroSubtitle: '',
    heroImage: '',
    storyHeading: '',
    storyBn: '',
    storyEn1: '',
    storyEn2: '',
    storyImage1: '',
    storyImage2: '',
    milestones: [],
    leadershipMessages: [],
  });

  useEffect(() => {
    if (contentAbout) {
      setAboutForm(JSON.parse(JSON.stringify(contentAbout)));
    }
  }, [contentAbout]);

  const handleSaveAbout = async () => {
    setIsSubmitting(true);
    try {
      await updateSection('about', aboutForm);
      addToast('About Page content saved!', 'success');
    } catch (err) {
      addToast('Failed to save About page: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================================================
  // AMENITIES FORM STATE
  // =========================================================================
  const [amenitiesForm, setAmenitiesForm] = useState([]);

  useEffect(() => {
    if (contentAmenities) {
      setAmenitiesForm(JSON.parse(JSON.stringify(contentAmenities)));
    }
  }, [contentAmenities]);

  const handleSaveAmenities = async () => {
    setIsSubmitting(true);
    try {
      await updateSection('amenities', amenitiesForm);
      addToast('Amenities list saved!', 'success');
    } catch (err) {
      addToast('Failed to save amenities: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================================================
  // WHY CHOOSE US FORM STATE
  // =========================================================================
  const [whyForm, setWhyForm] = useState([]);
  const [whyMeta, setWhyMeta] = useState({
    sectionTitle: 'Why Choose Lake Valley',
    sectionTitleBn: 'কেন লেক ভ্যালি ফ্লাওয়ার সিটি',
    sectionSubtitle: 'Unmatched advantages of living and investing in Bangladesh’s flagship eco-township.',
  });

  useEffect(() => {
    if (contentWhyChooseUs) {
      if (Array.isArray(contentWhyChooseUs)) {
        setWhyForm(JSON.parse(JSON.stringify(contentWhyChooseUs)));
      } else if (typeof contentWhyChooseUs === 'object' && contentWhyChooseUs !== null) {
        setWhyForm(Array.isArray(contentWhyChooseUs.items) ? JSON.parse(JSON.stringify(contentWhyChooseUs.items)) : []);
        setWhyMeta({
          sectionTitle: contentWhyChooseUs.sectionTitle || 'Why Choose Lake Valley',
          sectionTitleBn: contentWhyChooseUs.sectionTitleBn || 'কেন লেক ভ্যালি ফ্লাওয়ার সিটি',
          sectionSubtitle: contentWhyChooseUs.sectionSubtitle || '',
        });
      }
    }
  }, [contentWhyChooseUs]);

  const handleSaveWhy = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        sectionTitle: whyMeta.sectionTitle,
        sectionTitleBn: whyMeta.sectionTitleBn,
        sectionSubtitle: whyMeta.sectionSubtitle,
        items: whyForm,
      };
      await updateSection('whyChooseUs', payload);
      addToast('Why Choose Us section saved!', 'success');
    } catch (err) {
      addToast('Failed to save Why Choose Us: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================================================
  // TESTIMONIALS FORM STATE
  // =========================================================================
  const [testimonialsForm, setTestimonialsForm] = useState([]);

  useEffect(() => {
    if (contentTestimonials) {
      setTestimonialsForm(JSON.parse(JSON.stringify(contentTestimonials)));
    }
  }, [contentTestimonials]);

  const handleSaveTestimonials = async () => {
    setIsSubmitting(true);
    try {
      await updateSection('testimonials', testimonialsForm);
      addToast('Client testimonials saved!', 'success');
    } catch (err) {
      addToast('Failed to save testimonials: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================================================
  // FAQS FORM STATE
  // =========================================================================
  const [faqsForm, setFaqsForm] = useState([]);

  useEffect(() => {
    if (contentFaqs) {
      setFaqsForm(JSON.parse(JSON.stringify(contentFaqs)));
    }
  }, [contentFaqs]);

  const handleSaveFaqs = async () => {
    setIsSubmitting(true);
    try {
      await updateSection('faqs', faqsForm);
      addToast('FAQ questions and answers saved!', 'success');
    } catch (err) {
      addToast('Failed to save FAQs: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================================================
  // CTA BANNER FORM STATE
  // =========================================================================
  const [ctaForm, setCtaForm] = useState({
    badge: '',
    title: '',
    titleBn: '',
    subtitle: '',
    buttonText: '',
  });

  useEffect(() => {
    if (contentCta) {
      setCtaForm(JSON.parse(JSON.stringify(contentCta)));
    }
  }, [contentCta]);

  const handleSaveCta = async () => {
    setIsSubmitting(true);
    try {
      await updateSection('cta', ctaForm);
      addToast('Call to Action banner saved!', 'success');
    } catch (err) {
      addToast('Failed to save CTA section: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Media File Drag & Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file) => {
    if (!file.type.startsWith('image/')) {
      addToast('Please select a valid image file (PNG, JPG, WEBP, GIF, SVG)', 'error');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      addToast('Image size exceeds 10MB limit', 'error');
      return;
    }
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setFilePreviewUrl(objectUrl);
    if (!imageTitle) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setImageTitle(nameWithoutExt);
      setImageAlt(nameWithoutExt);
    }
  };

  const syncImageToContent = async (imgData) => {
    if (!imgData || !imgData.src) return;
    const title = (imgData.title || '').toLowerCase().trim();
    const target = imgData.targetSection || 'gallery';

    try {
      if (
        contentProjects &&
        (target === 'project' || contentProjects.some((p) => title.includes((p.title || '').toLowerCase())))
      ) {
        const updatedProjects = contentProjects.map((p) => {
          const pTitle = (p.title || '').toLowerCase();
          if (target === 'project' || (title && (title.includes(pTitle) || pTitle.includes(title)))) {
            return {
              ...p,
              image: imgData.src || p.image,
            };
          }
          return p;
        });
        setProjectsForm(updatedProjects);
        await updateSection('projects', updatedProjects);
      }

      if (
        contentHero?.slides &&
        Array.isArray(contentHero.slides) &&
        contentHero.slides.length > 0 &&
        (target === 'hero' || (title && contentHero.slides.some((s) => title.includes((s.title || '').toLowerCase()))))
      ) {
        let matchedIndex = -1;
        if (title) {
          matchedIndex = contentHero.slides.findIndex((s, idx) => {
            const sTitle = (s.title || '').toLowerCase();
            return (
              sTitle &&
              (title.includes(sTitle) || sTitle.includes(title) || title.includes(`slide ${idx + 1}`))
            );
          });
        }

        const targetIndex = matchedIndex >= 0 ? matchedIndex : 0;
        const updatedSlides = contentHero.slides.map((slide, idx) => {
          if (idx === targetIndex) {
            return { ...slide, image: imgData.src || slide.image };
          }
          return slide;
        });
        const updatedHero = { ...contentHero, slides: updatedSlides };
        setHeroForm(updatedHero);
        await updateSection('hero', updatedHero);
      }
    } catch (e) {
      console.warn('Sync to content error:', e);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    const finalCategory = customCategory.trim() || imageCategory;

    if (uploadMode === 'file' && !selectedFile) {
      addToast('Please choose an image file to upload', 'warning');
      return;
    }

    if (uploadMode === 'url' && !imageUrlInput.trim()) {
      addToast('Please paste a valid image URL', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      let created = null;
      if (uploadMode === 'file') {
        created = await uploadImageFile({
          file: selectedFile,
          title: imageTitle || selectedFile.name,
          category: finalCategory,
          targetSection: imageTargetSection,
          alt: imageAlt || imageTitle || selectedFile.name,
          span: imageSpan,
        });
        addToast('New image uploaded successfully!', 'success');
      } else {
        created = await addImageUrl({
          src: imageUrlInput.trim(),
          title: imageTitle || 'New Image',
          category: finalCategory,
          targetSection: imageTargetSection,
          alt: imageAlt || imageTitle || 'New Image',
          span: imageSpan,
        });
        addToast('Image added via URL successfully!', 'success');
      }

      if (created) {
        syncImageToContent(created).catch((e) => console.warn('Content sync note:', e));
      }

      resetUploadForm();
      setIsUploadModalOpen(false);
    } catch (err) {
      addToast('Upload failed: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetUploadForm = () => {
    setSelectedFile(null);
    setFilePreviewUrl('');
    setImageUrlInput('');
    setImageTitle('');
    setImageCategory('Township');
    setCustomCategory('');
    setImageTargetSection('gallery');
    setImageAlt('');
    setImageSpan('col-span-1 row-span-1');
  };

  const handleReplaceSubmit = async (e) => {
    e.preventDefault();
    if (!replaceTargetImage) return;

    if (replaceMode === 'file' && !replaceFile) {
      addToast('Please select a replacement image file from your device', 'warning');
      return;
    }
    if (replaceMode === 'url' && !replaceUrlInput.trim()) {
      addToast('Please enter a valid replacement image URL', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await replaceImage(replaceTargetImage.id, {
        file: replaceMode === 'file' ? replaceFile : null,
        src: replaceMode === 'url' ? replaceUrlInput.trim() : null,
        title: replaceTargetImage.title,
        category: replaceTargetImage.category,
        alt: replaceTargetImage.alt,
        span: replaceTargetImage.span,
        targetSection: replaceTargetImage.targetSection,
      });

      if (updated) {
        syncImageToContent(updated).catch((e) => console.warn('Content sync note:', e));
      }

      addToast('Image replaced and synced successfully across all browsers!', 'success');
      setReplaceTargetImage(null);
      setReplaceFile(null);
      setReplaceUrlInput('');
      setReplaceFilePreview('');
    } catch (err) {
      console.error('Image replace failure:', err);
      addToast('Failed to replace image: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editTargetImage) return;

    setIsSubmitting(true);
    try {
      const updated = await replaceImage(editTargetImage.id, {
        title: editTargetImage.title,
        category: editTargetImage.category,
        alt: editTargetImage.alt,
        span: editTargetImage.span,
        targetSection: editTargetImage.targetSection,
      });

      if (updated) {
        syncImageToContent(updated).catch((e) => console.warn('Content sync note:', e));
      }

      addToast('Image details updated successfully!', 'success');
      setEditTargetImage(null);
    } catch (err) {
      addToast('Failed to update image: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmImage) return;
    try {
      await deleteImage(deleteConfirmImage.id);
      addToast('Image deleted from repository', 'success');
      setDeleteConfirmImage(null);
    } catch (err) {
      addToast('Failed to delete image: ' + err.message, 'error');
    }
  };

  const copyToClipboard = (url, id) => {
    const fullUrl = url.startsWith('http') ? url : window.location.origin + url;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    addToast('Image URL copied to clipboard!', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const navTabs = [
    {
      id: 'projects',
      label: '🏗️ Real Estate Projects',
      bnLabel: 'প্রকল্পসমূহ (৪টি প্রজেক্ট)',
      shortLabel: 'Projects',
      desc: 'Lake Valley Flower City, Duplex City & Resort Limited, Green Garden Resort & Bangla Tower',
      icon: Home,
      group: 'CMS',
      badge: `${projectsForm.length}`,
      badgeColor: 'bg-teal-100 text-teal-800',
    },
    {
      id: 'hero',
      label: '🖼️ Hero Slider & Banner',
      bnLabel: 'হোম পেজের প্রধান স্লাইডার ও ব্যানার',
      shortLabel: 'Hero Slider',
      desc: 'Top homepage slider titles, images, and quick statistics',
      icon: Sparkles,
      group: 'CMS',
      badge: `${heroForm.slides?.length || 0}`,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'site',
      label: '🏢 Site Branding & Contact',
      bnLabel: 'লোগো, ফোন নম্বর ও যোগাযোগের ঠিকানা',
      shortLabel: 'Site & Contact',
      desc: 'Company logo, support email, phone numbers, office addresses & social links',
      icon: Building,
      group: 'CMS',
    },
    {
      id: 'media',
      label: '📸 Media Library & Uploads',
      bnLabel: 'ছবি আপলোড ও গ্যালারি লাইব্রেরি',
      shortLabel: 'Media Library',
      desc: 'Upload new images, manage website gallery photos and copy image URLs',
      icon: ImageIcon,
      group: 'Operations',
      badge: `${images.length}`,
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    {
      id: 'messages',
      label: '📩 Client Inquiries & Leads',
      bnLabel: 'গ্রাহকদের বুকিং ও মেসেজ তালিকা',
      shortLabel: 'Client Inquiries',
      desc: 'Real-time customer inquiries, plot requests and contact form submissions',
      icon: Inbox,
      group: 'Operations',
      badge: 'Live',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'about',
      label: '📖 About Us Page Content',
      bnLabel: 'কোম্পানি সম্পর্কে ও চেয়ারম্যানের বাণী',
      shortLabel: 'About Us',
      desc: 'About story texts, mission, vision, chairman and advisor messages',
      icon: Info,
      group: 'CMS',
    },
    {
      id: 'amenities',
      label: '🌟 Township Amenities',
      bnLabel: 'নাগরিক সুযোগ-সুবিধা সমূহ',
      shortLabel: 'Amenities',
      desc: 'Lakes, botanical gardens, sports club, security and civic facilities',
      icon: Award,
      group: 'CMS',
      badge: `${amenitiesForm.items?.length || 0}`,
      badgeColor: 'bg-purple-100 text-purple-800',
    },
    {
      id: 'why',
      label: '💡 Why Choose Us',
      bnLabel: 'কেন লেক ভ্যালি বেছে নেবেন',
      shortLabel: 'Why Choose Us',
      desc: 'Core highlights, green township benefits and legal assurances',
      icon: CheckCircle2,
      group: 'CMS',
      badge: `${whyForm.features?.length || 0}`,
      badgeColor: 'bg-indigo-100 text-indigo-800',
    },
    {
      id: 'testimonials',
      label: '💬 Client Testimonials',
      bnLabel: 'সন্তুষ্ট গ্রাহক ও প্রবাসীদের মতামত',
      shortLabel: 'Testimonials',
      desc: 'Customer quotes, reviews, ratings, and plot buyer stories',
      icon: MessageSquare,
      group: 'CMS',
      badge: `${testimonialsForm.testimonials?.length || 0}`,
      badgeColor: 'bg-rose-100 text-rose-800',
    },
    {
      id: 'faqs',
      label: '❓ FAQ Questions & Answers',
      bnLabel: 'সাধারণ জিজ্ঞাসা ও উত্তর',
      shortLabel: 'FAQ Items',
      desc: 'Common buyer questions about registration, installment plans and handover',
      icon: HelpCircle,
      group: 'CMS',
      badge: `${faqsForm.length}`,
      badgeColor: 'bg-slate-100 text-slate-800',
    },
    {
      id: 'cta',
      label: '📢 Call to Action & Banners',
      bnLabel: 'কল টু অ্যাকশন ও বুকিং ব্যানার',
      shortLabel: 'Call to Action',
      desc: 'Bottom booking banner texts, contact buttons and hotline CTA',
      icon: Send,
      group: 'CMS',
    },
  ];

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-3 text-slate-300">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        <span className="text-sm font-medium">Verifying Administrative Session...</span>
      </div>
    );
  }

  if (!isAdmin) {
    return <AdminLoginGate />;
  }

  return (
    <div className="min-h-screen bg-slate-50/70 pt-24 pb-16 px-3 sm:px-6 lg:px-8">
      <div className="max-w-[1560px] mx-auto space-y-6">
        
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-emerald-brand font-semibold text-xs tracking-wider uppercase mb-1">
              <Sliders className="w-4 h-4" /> Comprehensive CMS Control Center
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-deep-green tracking-tight">
              Website Admin Panel
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/70 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Logged in as: <strong className="font-mono">{adminUser?.email || 'istewakhassantewak121@gmail.com'}</strong></span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200/70 text-xs font-semibold">
                <Cloud className="w-3.5 h-3.5 text-teal-600" />
                <span>Global Cloud Sync Active</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Force Sync Everything to Cloud */}
            <button
              type="button"
              disabled={isSyncingAllCloud}
              onClick={handleSyncAllToCloud}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              title="Force sync all content and media to Cloud database across all browsers"
            >
              {isSyncingAllCloud ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <UploadCloud className="w-3.5 h-3.5" />
              )}
              <span>{isSyncingAllCloud ? 'Syncing...' : 'Sync All to Cloud'}</span>
            </button>

            {/* Export JSON Backup */}
            <button
              type="button"
              onClick={handleExportBackup}
              className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-xs transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              title="Download full JSON backup of website content and media"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" /> Backup JSON
            </button>

            {/* Import JSON Restore */}
            <input
              type="file"
              ref={backupFileInputRef}
              onChange={handleImportBackup}
              accept=".json"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => backupFileInputRef.current?.click()}
              className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-xs transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              title="Restore content from a JSON backup file"
            >
              <Database className="w-3.5 h-3.5 text-slate-500" /> Restore
            </button>

            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-emerald-brand font-medium text-xs transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-brand" /> Live Site
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </Link>

            <button
              type="button"
              onClick={() => setIsResetImagesModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" /> Reset Images
            </button>

            <button
              type="button"
              onClick={() => setIsLogoutModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 hover:bg-rose-100 hover:text-rose-800 font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Lock Admin Panel & Sign Out"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600" /> Log Out
            </button>
          </div>
        </div>

        {/* Quick CMS Guide (সহজে ওয়েবসাইট আপডেট করার গাইড) */}
        <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 text-white rounded-3xl p-5 md:p-6 border border-emerald-500/30 shadow-lg space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-emerald-500/20 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-lg border border-emerald-500/30">
                💡
              </div>
              <div>
                <h2 className="text-sm md:text-base font-bold text-white flex flex-wrap items-center gap-2">
                  <span>How to Update Anything on Your Website</span>
                  <span className="text-emerald-400 font-bangla text-xs font-medium">| সহজে ওয়েবসাইট আপডেট করার ৩টি ধাপ</span>
                </h2>
                <p className="text-xs text-slate-300">Follow these 3 simple steps to update any text, photo, or project on your live website:</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30 w-fit flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Instant Live Sync
            </span>
          </div>

          <div className="grid sm:grid-cols-3 gap-3.5">
            <div className="bg-white/5 hover:bg-white/10 transition-colors rounded-2xl p-4 border border-white/10 flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-sm">
                ১
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">1. Select Menu (মেনু নির্বাচন)</h4>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  বা দিকের মেনু থেকে আপনি যা বদলাতে চান (যেমন: <strong>Real Estate Projects</strong>, <strong>Hero Slider</strong>, <strong>Site Contact</strong>) নির্বাচন করুন।
                </p>
              </div>
            </div>

            <div className="bg-white/5 hover:bg-white/10 transition-colors rounded-2xl p-4 border border-white/10 flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-teal-500 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-sm">
                ২
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">2. Edit Text or Image (ছবি/তথ্য পরিবর্তন)</h4>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  টেক্সট বক্সে নতুন লেখা লিখুন অথবা ছবির উপর <strong>'Replace'</strong> / <strong>'Upload File'</strong> চেপে যেকোনো ছবি সহজে পরিবর্তন করুন।
                </p>
              </div>
            </div>

            <div className="bg-white/5 hover:bg-white/10 transition-colors rounded-2xl p-4 border border-white/10 flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-sm">
                ৩
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">3. Click 'Save Changes' (সংরক্ষণ করুন)</h4>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  সেকশনের উপরে বা নিচে থাকা বড় সবুজ <strong>'Save Changes'</strong> বাটনে চাপ দিন। আপনার সাইট সাথে সাথে সবার কাছে আপডেট হয়ে যাবে!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Section Selector & Drawer Toggle */}
        <div className="lg:hidden bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-brand flex items-center justify-center font-bold flex-shrink-0">
              {(() => {
                const cur = navTabs.find((t) => t.id === activeTab);
                const Icon = cur?.icon || Sliders;
                return <Icon className="w-5 h-5" />;
              })()}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active CMS Section</p>
              <p className="text-xs font-bold text-slate-800 truncate">
                {navTabs.find((t) => t.id === activeTab)?.label}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer hover:bg-slate-800 transition-all flex-shrink-0"
          >
            <Menu className="w-3.5 h-3.5" />
            <span>{isMobileSidebarOpen ? 'Close Menu' : 'All Sections'}</span>
          </button>
        </div>

        {/* 2-COLUMN MAIN CMS WORKSPACE: SIDEBAR + CONTENT AREA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* SIDEBAR NAVIGATION */}
          <aside className={`lg:col-span-4 xl:col-span-3 lg:sticky lg:top-24 space-y-4 ${isMobileSidebarOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-sm space-y-6">
              
              {/* Header / Admin Info */}
              <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center font-black text-xs shadow-sm">
                    LV
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Admin Control Center</h3>
                    <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Active & Connected
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION GROUP 1: WEBSITE CONTENT CMS */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 mb-2 flex items-center justify-between">
                  <span>Website CMS & Pages</span>
                  <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-semibold">9 Sections</span>
                </p>
                {navTabs.filter((t) => t.group === 'CMS').map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setIsMobileSidebarOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between gap-3 cursor-pointer group ${
                        isActive
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-700/20'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-600'}`} />
                        <div className="min-w-0">
                          <span className="block truncate font-bold">{tab.label}</span>
                          {tab.bnLabel && (
                            <span className={`block text-[10px] font-bangla truncate font-normal mt-0.5 ${isActive ? 'text-emerald-100' : 'text-slate-400'}`}>
                              {tab.bnLabel}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {tab.badge && (
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              isActive
                                ? 'bg-white/20 text-white'
                                : tab.badgeColor || 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {tab.badge}
                          </span>
                        )}
                        {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* SECTION GROUP 2: OPERATIONS & LEADS */}
              <div className="space-y-1.5 pt-4 border-t border-slate-100">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 mb-2 flex items-center justify-between">
                  <span>Operations & Media</span>
                  <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-semibold">2 Tabs</span>
                </p>
                {navTabs.filter((t) => t.group === 'Operations').map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setIsMobileSidebarOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between gap-3 cursor-pointer group ${
                        isActive
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-700/20'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-600'}`} />
                        <div className="min-w-0">
                          <span className="block truncate font-bold">{tab.label}</span>
                          {tab.bnLabel && (
                            <span className={`block text-[10px] font-bangla truncate font-normal mt-0.5 ${isActive ? 'text-emerald-100' : 'text-slate-400'}`}>
                              {tab.bnLabel}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {tab.badge && (
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              isActive
                                ? 'bg-white/20 text-white'
                                : tab.badgeColor || 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {tab.badge}
                          </span>
                        )}
                        {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Sidebar Quick Footer */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <Link
                  to="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-xs font-semibold flex items-center justify-between transition-all"
                >
                  <span className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-emerald-600" />
                    Visit Live Website
                  </span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </Link>

                <button
                  type="button"
                  onClick={() => setIsLogoutModalOpen(true)}
                  className="w-full py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200/70 text-rose-700 text-xs font-semibold flex items-center justify-between transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <LogOut className="w-3.5 h-3.5 text-rose-600" />
                    Lock & Sign Out
                  </span>
                  <span className="text-[10px] bg-rose-200/70 text-rose-800 px-1.5 py-0.5 rounded font-bold">Admin</span>
                </button>
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT AREA */}
          <main className="lg:col-span-8 xl:col-span-9 min-w-0 space-y-6">
            {/* ========================================================================= */}
            {/* TAB 0: CLIENT MESSAGES & INQUIRIES */}
            {/* ========================================================================= */}
            {activeTab === 'messages' && <AdminMessagesTab />}

            {/* ========================================================================= */}
            {/* TAB 1: MEDIA LIBRARY */}
            {/* ========================================================================= */}
            {activeTab === 'media' && (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-slate-800">{mediaStats.total}</div>
                  <div className="text-xs font-medium text-slate-500">Total Images</div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <LayoutGrid className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-slate-800">{mediaStats.galleryCount}</div>
                  <div className="text-xs font-medium text-slate-500">Gallery Items</div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-slate-800">{mediaStats.heroCount}</div>
                  <div className="text-xs font-medium text-slate-500">Hero Slides</div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-slate-800">{mediaStats.projectCount}</div>
                  <div className="text-xs font-medium text-slate-500">Project Media</div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-4 col-span-2 sm:col-span-1">
                <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                  <FolderOpen className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-slate-800">{categories.length - 1}</div>
                  <div className="text-xs font-medium text-slate-500">Categories</div>
                </div>
              </div>
            </div>

            {/* Filter & Upload Action Bar */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search images by title, category, tag..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-brand/30"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedTargetSection}
                    onChange={(e) => setSelectedTargetSection(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-brand/30"
                  >
                    <option value="All">All Target Sections</option>
                    <option value="gallery">Main Gallery</option>
                    <option value="hero">Hero Slider</option>
                    <option value="project">Project Pages</option>
                    <option value="masterplan">Master Plan</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-brand/30"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="title">By Title</option>
                  </select>
                </div>

                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-brand text-white font-semibold text-xs shadow-md shadow-emerald-brand/20 hover:bg-emerald-brand/90 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Upload New Image
                </button>
              </div>

              {/* Categories */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-500 mr-2">Category:</span>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-emerald-brand text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Media Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredImages.map((img) => (
                <div
                  key={img.id}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="relative aspect-video bg-slate-100 overflow-hidden">
                    <img
                      src={img.src}
                      alt={img.alt || img.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => setLightboxIndex(images.indexOf(img))}
                        className="p-2 rounded-full bg-white text-slate-800 hover:scale-110 transition-all cursor-pointer"
                        title="View Fullsize"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setReplaceTargetImage(img)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-brand text-white text-xs font-semibold hover:bg-emerald-brand/90 transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Replace File
                      </button>
                    </div>

                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-medium backdrop-blur-sm">
                      {img.category}
                    </span>
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-emerald-brand/90 text-white text-[10px] font-semibold backdrop-blur-sm">
                      {img.targetSection || 'gallery'}
                    </span>
                  </div>

                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{img.title}</h4>
                      <p className="text-slate-400 text-xs line-clamp-1">{img.alt}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <button
                        onClick={() => copyToClipboard(img.src, img.id)}
                        className="text-slate-500 hover:text-emerald-brand transition-colors flex items-center gap-1 cursor-pointer font-medium"
                      >
                        {copiedId === img.id ? <Check className="w-3.5 h-3.5 text-emerald-brand" /> : <Copy className="w-3.5 h-3.5" />}
                        Copy URL
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setEditTargetImage(img)}
                          className="p-1 rounded text-slate-500 hover:bg-slate-100 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmImage(img)}
                          className="p-1 rounded text-rose-500 hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: SITE BRANDING & CONTACT INFO */}
        {/* ========================================================================= */}
        {activeTab === 'site' && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-deep-green">Site Branding & Contact Details</h2>
                <p className="text-slate-500 text-xs mt-0.5">Edit company name, logos, phone numbers, addresses, and social links across navbar & footer.</p>
              </div>
              <button
                onClick={handleSaveSite}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-emerald-brand text-white font-semibold text-xs hover:bg-emerald-brand/90 transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" /> Save Site Settings
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Site Title (English)</label>
                <input
                  type="text"
                  value={siteForm.siteName}
                  onChange={(e) => setSiteForm({ ...siteForm, siteName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-brand/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Site Title (Bengali)</label>
                <input
                  type="text"
                  value={siteForm.siteNameBn}
                  onChange={(e) => setSiteForm({ ...siteForm, siteNameBn: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-brand/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Company Name</label>
                <input
                  type="text"
                  value={siteForm.companyName}
                  onChange={(e) => setSiteForm({ ...siteForm, companyName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-brand/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company Tagline</label>
                <input
                  type="text"
                  value={siteForm.tagline}
                  onChange={(e) => setSiteForm({ ...siteForm, tagline: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-brand/30"
                />
              </div>

              <div className="md:col-span-2">
                <ImageFieldPicker
                  label="Site & Company Logo"
                  description="Primary brand logo used in top navigation bar, footer, and loading screens"
                  value={siteForm.logo}
                  onChange={(newUrl) => setSiteForm({ ...siteForm, logo: newUrl })}
                  aspectRatio="aspect-[4/1] max-w-sm"
                  showPresets={true}
                  customPresets={[
                    { name: 'Standard Brand Logo', url: '/logo.png', badge: 'Default' },
                    { name: 'Transparent Brand Logo', url: '/logo-transparent.png', badge: 'Transparent' },
                    { name: 'Original High-Res Asset', url: '/Lake%20Valley%20Logo.png', badge: 'PNG' },
                  ]}
                  presetLabel="Official Brand Logo Variations:"
                  modalTitle="Select Brand Logo"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Support Email</label>
                <input
                  type="email"
                  value={siteForm.email}
                  onChange={(e) => setSiteForm({ ...siteForm, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-brand/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Care Phone Numbers (Comma separated)</label>
                <input
                  type="text"
                  value={Array.isArray(siteForm.phones) ? siteForm.phones.join(', ') : siteForm.phones}
                  onChange={(e) => setSiteForm({ ...siteForm, phones: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-brand/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Raw Phone Number for Tel Link (e.g. +8801700000000)</label>
                <input
                  type="text"
                  value={siteForm.phoneRaw}
                  onChange={(e) => setSiteForm({ ...siteForm, phoneRaw: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-brand/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Head Office Address</label>
                <input
                  type="text"
                  value={siteForm.headOffice}
                  onChange={(e) => setSiteForm({ ...siteForm, headOffice: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-brand/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Corporate Office Address</label>
                <input
                  type="text"
                  value={siteForm.corporateOffice}
                  onChange={(e) => setSiteForm({ ...siteForm, corporateOffice: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-brand/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Operating Hours</label>
                <input
                  type="text"
                  value={siteForm.hours}
                  onChange={(e) => setSiteForm({ ...siteForm, hours: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-brand/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Facebook URL</label>
                <input
                  type="text"
                  value={siteForm.facebook}
                  onChange={(e) => setSiteForm({ ...siteForm, facebook: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-brand/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Instagram URL</label>
                <input
                  type="text"
                  value={siteForm.instagram}
                  onChange={(e) => setSiteForm({ ...siteForm, instagram: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-brand/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">YouTube URL</label>
                <input
                  type="text"
                  value={siteForm.youtube}
                  onChange={(e) => setSiteForm({ ...siteForm, youtube: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-brand/30"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: HERO SLIDER & STATS */}
        {/* ========================================================================= */}
        {activeTab === 'hero' && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm space-y-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-deep-green">Hero Banner & Floating Stats</h2>
                <p className="text-slate-500 text-xs mt-0.5">Manage homepage hero slides, titles, subtitles, background images, and animated counter stats.</p>
              </div>
              <button
                onClick={handleSaveHero}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-emerald-brand text-white font-semibold text-xs hover:bg-emerald-brand/90 transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" /> Save Hero Section
              </button>
            </div>

            {/* Slides List */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-sm">Hero Banner Slides ({heroForm.slides.length})</h3>
                <button
                  onClick={() => {
                    const newSlide = {
                      id: 'slide-' + Date.now(),
                      image: 'https://lakevalleyflowercity.com/uploads/gallery-images/1785062826_00838.jpg',
                      title: 'New Hero Headline',
                      titleBn: 'নতুন ব্যানার শিরোনাম',
                      subtitle: 'Premium Living',
                      description: 'Enter slide description text here.',
                      cta: 'Explore Projects',
                      ctaLink: '/projects',
                    };
                    setHeroForm({ ...heroForm, slides: [...heroForm.slides, newSlide] });
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-brand/10 text-emerald-brand font-semibold text-xs hover:bg-emerald-brand hover:text-white transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Slide
                </button>
              </div>

              {heroForm.slides.map((slide, index) => (
                <div key={slide.id || index} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-brand uppercase tracking-wider">Slide #{index + 1}</span>
                    <button
                      onClick={() => {
                        const updated = heroForm.slides.filter((_, i) => i !== index);
                        setHeroForm({ ...heroForm, slides: updated });
                      }}
                      className="text-rose-500 text-xs font-semibold hover:underline cursor-pointer"
                    >
                      Delete Slide
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Title (English)</label>
                      <input
                        type="text"
                        value={slide.title}
                        onChange={(e) => {
                          const slides = [...heroForm.slides];
                          slides[index].title = e.target.value;
                          setHeroForm({ ...heroForm, slides });
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Title (Bengali)</label>
                      <input
                        type="text"
                        value={slide.titleBn}
                        onChange={(e) => {
                          const slides = [...heroForm.slides];
                          slides[index].titleBn = e.target.value;
                          setHeroForm({ ...heroForm, slides });
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Subtitle / Badge</label>
                      <input
                        type="text"
                        value={slide.subtitle}
                        onChange={(e) => {
                          const slides = [...heroForm.slides];
                          slides[index].subtitle = e.target.value;
                          setHeroForm({ ...heroForm, slides });
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <ImageFieldPicker
                        label="Hero Slide Background Image"
                        description="High-resolution banner background displayed on homepage slider"
                        value={slide.image || ''}
                        onChange={(newUrl) => {
                          const slides = [...heroForm.slides];
                          slides[index].image = newUrl;
                          setHeroForm({ ...heroForm, slides });
                        }}
                        aspectRatio="aspect-[21/9]"
                        modalTitle={`Select Banner for Slide #${index + 1}: ${slide.title || 'Slide'}`}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                      <textarea
                        rows={2}
                        value={slide.description}
                        onChange={(e) => {
                          const slides = [...heroForm.slides];
                          slides[index].description = e.target.value;
                          setHeroForm({ ...heroForm, slides });
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Floating Stats List */}
            <div className="space-y-4 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-sm">Floating Counter Stats ({heroForm.stats.length})</h3>
                <button
                  onClick={() => {
                    const newStat = { value: 100, suffix: '+', label: 'New Metric' };
                    setHeroForm({ ...heroForm, stats: [...heroForm.stats, newStat] });
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-brand/10 text-emerald-brand font-semibold text-xs hover:bg-emerald-brand hover:text-white transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Metric Stat
                </button>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {heroForm.stats.map((stat, i) => (
                  <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">Stat #{i + 1}</span>
                      <button
                        onClick={() => {
                          const updated = heroForm.stats.filter((_, idx) => idx !== i);
                          setHeroForm({ ...heroForm, stats: updated });
                        }}
                        className="text-rose-500 text-xs font-semibold"
                      >
                        Remove
                      </button>
                    </div>

                    <input
                      type="number"
                      placeholder="Number value"
                      value={stat.value}
                      onChange={(e) => {
                        const stats = [...heroForm.stats];
                        stats[i].value = Number(e.target.value);
                        setHeroForm({ ...heroForm, stats });
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-bold"
                    />

                    <input
                      type="text"
                      placeholder="Suffix (e.g. + or Acres)"
                      value={stat.suffix}
                      onChange={(e) => {
                        const stats = [...heroForm.stats];
                        stats[i].suffix = e.target.value;
                        setHeroForm({ ...heroForm, stats });
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                    />

                    <input
                      type="text"
                      placeholder="Label"
                      value={stat.label}
                      onChange={(e) => {
                        const stats = [...heroForm.stats];
                        stats[i].label = e.target.value;
                        setHeroForm({ ...heroForm, stats });
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: REAL ESTATE PROJECTS */}
        {/* ========================================================================= */}
        {activeTab === 'projects' && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 text-emerald-brand font-semibold text-xs tracking-wider uppercase mb-1">
                  <Home className="w-4 h-4" /> 4 Flagship Developments
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-deep-green">Real Estate Projects & Listings</h2>
                <p className="text-slate-500 text-xs mt-0.5">
                  নিচের ৪টি প্রজেক্টের যেকোনোটিতে ক্লিক করে তথ্য, মূল্য ও ছবি পরিবর্তন করুন। পরিবর্তন শেষে <strong>'Save Projects'</strong> বাটনে চাপুন।
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleSaveProjects}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSubmitting ? 'Saving...' : 'Save Projects Data'}</span>
                </button>
              </div>
            </div>

            {/* Visual 4-Project Selector Cards */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span>Select Project to Edit:</span>
                <span className="text-[11px] font-normal text-slate-400 font-bangla">(যে প্রজেক্টটি এডিট করতে চান নির্বাচন করুন)</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {projectsForm.map((proj, idx) => {
                  const isSelected = selectedProjectIndex === idx;
                  return (
                    <button
                      key={proj.id || idx}
                      type="button"
                      onClick={() => setSelectedProjectIndex(idx)}
                      className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between h-full ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-500/20'
                          : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/70 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-slate-300/60 shadow-inner">
                          <img
                            src={proj.image || 'https://lakevalleyflowercity.com/uploads/gallery-images/1785062826_00838.jpg'}
                            alt={proj.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className={`text-[10px] font-extrabold uppercase tracking-wider block ${isSelected ? 'text-emerald-700' : 'text-slate-400'}`}>
                            Project #{idx + 1}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 truncate mt-0.5">
                            {proj.title || `Project #${idx + 1}`}
                          </h4>
                          <p className="text-[11px] font-bangla text-slate-500 truncate mt-0.5">
                            {proj.titleBn || ''}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                        <span className="font-semibold text-slate-600 truncate">{proj.stats?.area || 'Township'}</span>
                        <span className={`font-bold px-2 py-0.5 rounded-full ${isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                          {isSelected ? 'Editing Now' : 'Click to Edit'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Project Form */}
            {projectsForm[selectedProjectIndex] && (
              <div className="space-y-6 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                      {selectedProjectIndex + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-deep-green text-sm sm:text-base">
                        Editing: {projectsForm[selectedProjectIndex].title}
                      </h3>
                      <p className="text-xs text-slate-500 font-bangla">
                        {projectsForm[selectedProjectIndex].titleBn}
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
                    {projectsForm[selectedProjectIndex].tagline || 'Flagship'}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Project Title (English) *</label>
                    <input
                      type="text"
                      value={projectsForm[selectedProjectIndex].title || ''}
                      onChange={(e) => {
                        const updated = [...projectsForm];
                        updated[selectedProjectIndex].title = e.target.value;
                        setProjectsForm(updated);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-brand/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Project Title (Bengali / বাংলা) *</label>
                    <input
                      type="text"
                      value={projectsForm[selectedProjectIndex].titleBn || ''}
                      onChange={(e) => {
                        const updated = [...projectsForm];
                        updated[selectedProjectIndex].titleBn = e.target.value;
                        setProjectsForm(updated);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bangla focus:outline-none focus:ring-2 focus:ring-emerald-brand/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Category Tagline (e.g. Integrated Eco-Township, Luxury Resort)</label>
                    <input
                      type="text"
                      value={projectsForm[selectedProjectIndex].tagline || ''}
                      onChange={(e) => {
                        const updated = [...projectsForm];
                        updated[selectedProjectIndex].tagline = e.target.value;
                        setProjectsForm(updated);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-brand/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">URL Slug</label>
                    <input
                      type="text"
                      value={projectsForm[selectedProjectIndex].slug || ''}
                      onChange={(e) => {
                        const updated = [...projectsForm];
                        updated[selectedProjectIndex].slug = e.target.value;
                        setProjectsForm(updated);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-brand/30"
                    />
                  </div>

                  <div className="md:col-span-2 grid md:grid-cols-2 gap-4 pt-2">
                    <ImageFieldPicker
                      label="Cover Thumbnail Image"
                      description="Shown on the homepage 'Our Projects' section & projects grid cards"
                      value={projectsForm[selectedProjectIndex].image || ''}
                      onChange={(newUrl) => {
                        const updated = [...projectsForm];
                        updated[selectedProjectIndex].image = newUrl;
                        setProjectsForm(updated);
                      }}
                      aspectRatio="aspect-video"
                      modalTitle={`Select Cover Image for ${projectsForm[selectedProjectIndex].title || 'Project'}`}
                    />

                    <ImageFieldPicker
                      label="Project Detail Hero Banner"
                      description="Full-width header image on the individual project details page"
                      value={projectsForm[selectedProjectIndex].heroImage || ''}
                      onChange={(newUrl) => {
                        const updated = [...projectsForm];
                        updated[selectedProjectIndex].heroImage = newUrl;
                        setProjectsForm(updated);
                      }}
                      aspectRatio="aspect-video"
                      modalTitle={`Select Detail Hero Banner for ${projectsForm[selectedProjectIndex].title || 'Project'}`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Starting Price (USD)</label>
                    <input
                      type="number"
                      value={projectsForm[selectedProjectIndex].stats?.startingPriceUSD || 0}
                      onChange={(e) => {
                        const updated = [...projectsForm];
                        updated[selectedProjectIndex].stats = {
                          ...updated[selectedProjectIndex].stats,
                          startingPriceUSD: Number(e.target.value),
                        };
                        setProjectsForm(updated);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-brand/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Price Per Katha (USD)</label>
                    <input
                      type="number"
                      value={projectsForm[selectedProjectIndex].stats?.pricePerKathaUSD || 0}
                      onChange={(e) => {
                        const updated = [...projectsForm];
                        updated[selectedProjectIndex].stats = {
                          ...updated[selectedProjectIndex].stats,
                          pricePerKathaUSD: Number(e.target.value),
                        };
                        setProjectsForm(updated);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-brand/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Total Project Area (e.g. 300 Acres, 12 Acres)</label>
                    <input
                      type="text"
                      value={projectsForm[selectedProjectIndex].stats?.area || ''}
                      onChange={(e) => {
                        const updated = [...projectsForm];
                        updated[selectedProjectIndex].stats = {
                          ...updated[selectedProjectIndex].stats,
                          area: e.target.value,
                        };
                        setProjectsForm(updated);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-brand/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Total Units / Plots (e.g. 1000+ Plots, 100+ Units)</label>
                    <input
                      type="text"
                      value={projectsForm[selectedProjectIndex].stats?.plots || ''}
                      onChange={(e) => {
                        const updated = [...projectsForm];
                        updated[selectedProjectIndex].stats = {
                          ...updated[selectedProjectIndex].stats,
                          plots: e.target.value,
                        };
                        setProjectsForm(updated);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-brand/30"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Location Address</label>
                    <input
                      type="text"
                      value={projectsForm[selectedProjectIndex].location || ''}
                      onChange={(e) => {
                        const updated = [...projectsForm];
                        updated[selectedProjectIndex].location = e.target.value;
                        setProjectsForm(updated);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-brand/30"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Short Summary Description</label>
                    <textarea
                      rows={2}
                      value={projectsForm[selectedProjectIndex].shortDescription || ''}
                      onChange={(e) => {
                        const updated = [...projectsForm];
                        updated[selectedProjectIndex].shortDescription = e.target.value;
                        setProjectsForm(updated);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-brand/30"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Detailed Description</label>
                    <textarea
                      rows={4}
                      value={projectsForm[selectedProjectIndex].fullDescription || ''}
                      onChange={(e) => {
                        const updated = [...projectsForm];
                        updated[selectedProjectIndex].fullDescription = e.target.value;
                        setProjectsForm(updated);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-brand/30"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Project Features (Comma separated)</label>
                    <input
                      type="text"
                      value={Array.isArray(projectsForm[selectedProjectIndex].features) ? projectsForm[selectedProjectIndex].features.join(', ') : (projectsForm[selectedProjectIndex].features || '')}
                      onChange={(e) => {
                        const updated = [...projectsForm];
                        updated[selectedProjectIndex].features = e.target.value.split(',').map((f) => f.trim()).filter(Boolean);
                        setProjectsForm(updated);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-brand/30"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Project Amenities (Comma separated)</label>
                    <input
                      type="text"
                      value={Array.isArray(projectsForm[selectedProjectIndex].amenities) ? projectsForm[selectedProjectIndex].amenities.join(', ') : (projectsForm[selectedProjectIndex].amenities || '')}
                      onChange={(e) => {
                        const updated = [...projectsForm];
                        updated[selectedProjectIndex].amenities = e.target.value.split(',').map((f) => f.trim()).filter(Boolean);
                        setProjectsForm(updated);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-brand/30"
                    />
                  </div>
                </div>

                {/* Bottom Save Action Bar */}
                <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/70 p-4 rounded-2xl">
                  <div className="text-xs text-slate-600">
                    <span className="font-bold text-slate-800">Ready to publish?</span> Click Save below to apply all project edits immediately to the live site.
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveProjects}
                    disabled={isSubmitting}
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-xs shadow-lg shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSubmitting ? 'Saving to Database...' : 'Save All Projects Changes (সংরক্ষণ করুন)'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: ABOUT US PAGE */}
        {/* ========================================================================= */}
        {activeTab === 'about' && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-deep-green">About Us Page Content</h2>
                <p className="text-slate-500 text-xs mt-0.5">Edit story texts, images, company milestones, and leadership messages.</p>
              </div>
              <button
                onClick={handleSaveAbout}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-emerald-brand text-white font-semibold text-xs hover:bg-emerald-brand/90 transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" /> Save About Page
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Hero Title (English)</label>
                <input
                  type="text"
                  value={aboutForm.heroTitle || ''}
                  onChange={(e) => setAboutForm({ ...aboutForm, heroTitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Hero Title (Bengali)</label>
                <input
                  type="text"
                  value={aboutForm.heroTitleBn || ''}
                  onChange={(e) => setAboutForm({ ...aboutForm, heroTitleBn: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Hero Subtitle</label>
                <input
                  type="text"
                  value={aboutForm.heroSubtitle || ''}
                  onChange={(e) => setAboutForm({ ...aboutForm, heroSubtitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <ImageFieldPicker
                  label="About Page Hero Banner"
                  description="Top hero banner image for the About Us page"
                  value={aboutForm.heroImage || ''}
                  onChange={(newUrl) => setAboutForm({ ...aboutForm, heroImage: newUrl })}
                  aspectRatio="aspect-[21/9]"
                  modalTitle="Select About Page Hero Banner"
                />
              </div>

              <div className="md:col-span-2 grid md:grid-cols-2 gap-4 pt-2">
                <ImageFieldPicker
                  label="About Us Story Image 1"
                  description="First collage image on the About Us story section"
                  value={aboutForm.storyImage1 || ''}
                  onChange={(newUrl) => setAboutForm({ ...aboutForm, storyImage1: newUrl })}
                  aspectRatio="aspect-video"
                  modalTitle="Select About Story Image 1"
                />

                <ImageFieldPicker
                  label="About Us Story Image 2"
                  description="Second collage image on the About Us story section"
                  value={aboutForm.storyImage2 || ''}
                  onChange={(newUrl) => setAboutForm({ ...aboutForm, storyImage2: newUrl })}
                  aspectRatio="aspect-video"
                  modalTitle="Select About Story Image 2"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Our Story Text (Bengali)</label>
                <textarea
                  rows={3}
                  value={aboutForm.storyBn || ''}
                  onChange={(e) => setAboutForm({ ...aboutForm, storyBn: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Our Story Paragraph 1 (English)</label>
                <textarea
                  rows={3}
                  value={aboutForm.storyEn1 || ''}
                  onChange={(e) => setAboutForm({ ...aboutForm, storyEn1: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Our Story Paragraph 2 (English)</label>
                <textarea
                  rows={3}
                  value={aboutForm.storyEn2 || ''}
                  onChange={(e) => setAboutForm({ ...aboutForm, storyEn2: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: AMENITIES LIST */}
        {/* ========================================================================= */}
        {activeTab === 'amenities' && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-deep-green">Township Amenities</h2>
                <p className="text-slate-500 text-xs mt-0.5">Manage luxury amenities, icon names, titles, and descriptions.</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setAmenitiesForm([
                      ...amenitiesForm,
                      { id: 'amenity-' + Date.now(), title: 'New Facility', description: 'Description of the new amenity.', iconName: 'Sparkles' },
                    ]);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-800 font-semibold text-xs hover:bg-slate-200 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Amenity
                </button>
                <button
                  onClick={handleSaveAmenities}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-emerald-brand text-white font-semibold text-xs hover:bg-emerald-brand/90 transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> Save Amenities
                </button>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {amenitiesForm.map((item, idx) => (
                <div key={item.id || idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-brand uppercase">Facility #{idx + 1}</span>
                    <button
                      onClick={() => {
                        const updated = amenitiesForm.filter((_, i) => i !== idx);
                        setAmenitiesForm(updated);
                      }}
                      className="text-rose-500 text-xs font-semibold hover:underline cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Title</label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => {
                        const updated = [...amenitiesForm];
                        updated[idx].title = e.target.value;
                        setAmenitiesForm(updated);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Lucide Icon Name (e.g., TreePine, Shield, Swimming)</label>
                    <input
                      type="text"
                      value={item.iconName || ''}
                      onChange={(e) => {
                        const updated = [...amenitiesForm];
                        updated[idx].iconName = e.target.value;
                        setAmenitiesForm(updated);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={item.description}
                      onChange={(e) => {
                        const updated = [...amenitiesForm];
                        updated[idx].description = e.target.value;
                        setAmenitiesForm(updated);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: WHY CHOOSE US */}
        {/* ========================================================================= */}
        {activeTab === 'why' && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-deep-green">Why Choose Us Advantage Cards</h2>
                <p className="text-slate-500 text-xs mt-0.5">Manage grid feature cards and section headings displayed on the homepage.</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const list = Array.isArray(whyForm) ? whyForm : [];
                    setWhyForm([
                      ...list,
                      { id: 'why-' + Date.now(), title: 'New Advantage', titleBn: 'নতুন সুবিধা', description: 'Advantage detail text.', iconName: 'Check' },
                    ]);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-800 font-semibold text-xs hover:bg-slate-200 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Advantage Card
                </button>
                <button
                  onClick={handleSaveWhy}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-emerald-brand text-white font-semibold text-xs hover:bg-emerald-brand/90 transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> Save Why Choose Us
                </button>
              </div>
            </div>

            {/* Section Headings */}
            <div className="grid md:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Section Title (English)</label>
                <input
                  type="text"
                  value={whyMeta.sectionTitle}
                  onChange={(e) => setWhyMeta({ ...whyMeta, sectionTitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-bold bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Section Title (Bengali)</label>
                <input
                  type="text"
                  value={whyMeta.sectionTitleBn}
                  onChange={(e) => setWhyMeta({ ...whyMeta, sectionTitleBn: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Section Subtitle</label>
                <input
                  type="text"
                  value={whyMeta.sectionSubtitle}
                  onChange={(e) => setWhyMeta({ ...whyMeta, sectionSubtitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(Array.isArray(whyForm) ? whyForm : []).map((item, idx) => (
                <div key={item.id || idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-brand uppercase">Card #{idx + 1}</span>
                    <button
                      onClick={() => {
                        const list = Array.isArray(whyForm) ? whyForm : [];
                        const updated = list.filter((_, i) => i !== idx);
                        setWhyForm(updated);
                      }}
                      className="text-rose-500 text-xs font-semibold hover:underline cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Title (English)</label>
                    <input
                      type="text"
                      value={item.title || ''}
                      onChange={(e) => {
                        const list = Array.isArray(whyForm) ? [...whyForm] : [];
                        list[idx].title = e.target.value;
                        setWhyForm(list);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-bold bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Title (Bengali)</label>
                    <input
                      type="text"
                      value={item.titleBn || ''}
                      onChange={(e) => {
                        const list = Array.isArray(whyForm) ? [...whyForm] : [];
                        list[idx].titleBn = e.target.value;
                        setWhyForm(list);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Lucide Icon Name</label>
                    <input
                      type="text"
                      value={item.iconName || ''}
                      onChange={(e) => {
                        const list = Array.isArray(whyForm) ? [...whyForm] : [];
                        list[idx].iconName = e.target.value;
                        setWhyForm(list);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={item.description || ''}
                      onChange={(e) => {
                        const list = Array.isArray(whyForm) ? [...whyForm] : [];
                        list[idx].description = e.target.value;
                        setWhyForm(list);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 8: TESTIMONIALS */}
        {/* ========================================================================= */}
        {activeTab === 'testimonials' && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-deep-green">Client Testimonials</h2>
                <p className="text-slate-500 text-xs mt-0.5">Manage user reviews, quotes, star ratings, and avatars.</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setTestimonialsForm([
                      ...testimonialsForm,
                      {
                        id: 'testi-' + Date.now(),
                        name: 'New Client',
                        role: 'Plot Owner',
                        quote: 'Wonderful investment experience!',
                        rating: 5,
                        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
                      },
                    ]);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-800 font-semibold text-xs hover:bg-slate-200 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Review
                </button>
                <button
                  onClick={handleSaveTestimonials}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-emerald-brand text-white font-semibold text-xs hover:bg-emerald-brand/90 transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> Save Testimonials
                </button>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {testimonialsForm.map((item, idx) => (
                <div key={item.id || idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-brand uppercase">Review #{idx + 1}</span>
                    <button
                      onClick={() => {
                        const updated = testimonialsForm.filter((_, i) => i !== idx);
                        setTestimonialsForm(updated);
                      }}
                      className="text-rose-500 text-xs font-semibold hover:underline cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Client Name</label>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => {
                        const updated = [...testimonialsForm];
                        updated[idx].name = e.target.value;
                        setTestimonialsForm(updated);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Role / Subtitle</label>
                    <input
                      type="text"
                      value={item.role}
                      onChange={(e) => {
                        const updated = [...testimonialsForm];
                        updated[idx].role = e.target.value;
                        setTestimonialsForm(updated);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Avatar Image URL</label>
                    <input
                      type="text"
                      value={item.avatar}
                      onChange={(e) => {
                        const updated = [...testimonialsForm];
                        updated[idx].avatar = e.target.value;
                        setTestimonialsForm(updated);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Rating (1-5)</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={item.rating}
                      onChange={(e) => {
                        const updated = [...testimonialsForm];
                        updated[idx].rating = Number(e.target.value);
                        setTestimonialsForm(updated);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Quote</label>
                    <textarea
                      rows={3}
                      value={item.quote}
                      onChange={(e) => {
                        const updated = [...testimonialsForm];
                        updated[idx].quote = e.target.value;
                        setTestimonialsForm(updated);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 9: FAQS */}
        {/* ========================================================================= */}
        {activeTab === 'faqs' && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-deep-green">Frequently Asked Questions</h2>
                <p className="text-slate-500 text-xs mt-0.5">Edit questions and answers shown on the contact page.</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setFaqsForm([
                      ...faqsForm,
                      { question: 'New Question?', answer: 'Answer details go here.' },
                    ]);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-800 font-semibold text-xs hover:bg-slate-200 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add FAQ
                </button>
                <button
                  onClick={handleSaveFaqs}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-emerald-brand text-white font-semibold text-xs hover:bg-emerald-brand/90 transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> Save FAQs
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {faqsForm.map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-brand uppercase">Question #{idx + 1}</span>
                    <button
                      onClick={() => {
                        const updated = faqsForm.filter((_, i) => i !== idx);
                        setFaqsForm(updated);
                      }}
                      className="text-rose-500 text-xs font-semibold hover:underline cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Question</label>
                    <input
                      type="text"
                      value={item.question}
                      onChange={(e) => {
                        const updated = [...faqsForm];
                        updated[idx].question = e.target.value;
                        setFaqsForm(updated);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Answer</label>
                    <textarea
                      rows={2}
                      value={item.answer}
                      onChange={(e) => {
                        const updated = [...faqsForm];
                        updated[idx].answer = e.target.value;
                        setFaqsForm(updated);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 10: CALL TO ACTION BANNER */}
        {/* ========================================================================= */}
        {activeTab === 'cta' && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-deep-green">Call to Action Banner</h2>
                <p className="text-slate-500 text-xs mt-0.5">Edit bottom CTA banner titles, subtitles, and button labels.</p>
              </div>
              <button
                onClick={handleSaveCta}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-emerald-brand text-white font-semibold text-xs hover:bg-emerald-brand/90 transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" /> Save CTA Banner
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Badge Text</label>
                <input
                  type="text"
                  value={ctaForm.badge || ''}
                  onChange={(e) => setCtaForm({ ...ctaForm, badge: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Button Text</label>
                <input
                  type="text"
                  value={ctaForm.buttonText || ''}
                  onChange={(e) => setCtaForm({ ...ctaForm, buttonText: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title (English)</label>
                <input
                  type="text"
                  value={ctaForm.title || ''}
                  onChange={(e) => setCtaForm({ ...ctaForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title (Bengali)</label>
                <input
                  type="text"
                  value={ctaForm.titleBn || ''}
                  onChange={(e) => setCtaForm({ ...ctaForm, titleBn: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subtitle Description</label>
                <textarea
                  rows={3}
                  value={ctaForm.subtitle || ''}
                  onChange={(e) => setCtaForm({ ...ctaForm, subtitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                />
              </div>
            </div>
          </div>
        )}

          </main>
        </div>
      </div>

      {/* ======================================================== */}
      {/* UPLOAD NEW IMAGE MODAL */}
      {/* ======================================================== */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-8 relative"
            >
              <button
                onClick={() => {
                  setIsUploadModalOpen(false);
                  resetUploadForm();
                }}
                className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6">
                <div className="flex items-center gap-2 text-emerald-brand text-xs font-bold uppercase tracking-wider mb-1">
                  <Upload className="w-4 h-4" /> Media Repository
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900">Upload New Website Image</h3>
              </div>

              <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-6">
                <button
                  type="button"
                  onClick={() => setUploadMode('file')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                    uploadMode === 'file' ? 'bg-white text-emerald-brand shadow-sm' : 'text-slate-500'
                  }`}
                >
                  <FileImage className="w-4 h-4 inline mr-1" /> Device File Upload
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode('url')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                    uploadMode === 'url' ? 'bg-white text-emerald-brand shadow-sm' : 'text-slate-500'
                  }`}
                >
                  <LinkIcon className="w-4 h-4 inline mr-1" /> External Image URL
                </button>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-4">
                {uploadMode === 'file' ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer ${
                      isDragOver ? 'border-emerald-brand bg-emerald-50' : 'border-slate-200'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                      className="hidden"
                    />
                    {filePreviewUrl ? (
                      <div className="space-y-2 flex flex-col items-center">
                        <img src={filePreviewUrl} alt="Preview" className="w-32 h-24 object-cover rounded-xl" />
                        <span className="text-xs text-slate-600 font-medium">{selectedFile?.name}</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-emerald-brand mx-auto mb-2" />
                        <p className="text-sm font-semibold text-slate-800">Click to upload or drag & drop image</p>
                      </>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Image URL *</label>
                    <input
                      type="url"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Title *</label>
                    <input
                      type="text"
                      value={imageTitle}
                      onChange={(e) => setImageTitle(e.target.value)}
                      placeholder="Image caption"
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                    <select
                      value={imageCategory}
                      onChange={(e) => setImageCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                    >
                      {categories.filter((c) => c !== 'All').map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Target Section</label>
                    <select
                      value={imageTargetSection}
                      onChange={(e) => setImageTargetSection(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                    >
                      <option value="gallery">Main Gallery</option>
                      <option value="hero">Hero Slider</option>
                      <option value="project">Project Page</option>
                      <option value="masterplan">Master Plan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Alt Text</label>
                    <input
                      type="text"
                      value={imageAlt}
                      onChange={(e) => setImageAlt(e.target.value)}
                      placeholder="Alt description"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl bg-emerald-brand text-white font-semibold text-xs shadow-md"
                  >
                    Confirm & Upload
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* REPLACE IMAGE MODAL */}
      {/* ======================================================== */}
      <AnimatePresence>
        {replaceTargetImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative"
            >
              <button
                onClick={() => {
                  setReplaceTargetImage(null);
                  setReplaceFile(null);
                  setReplaceUrlInput('');
                  setReplaceFilePreview('');
                }}
                className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-5">
                <div className="flex items-center gap-2 text-emerald-brand text-xs font-bold uppercase tracking-wider mb-1">
                  <RefreshCw className="w-4 h-4" /> Replace Image Media
                </div>
                <h3 className="text-xl font-bold text-slate-900 line-clamp-1">
                  Replace "{replaceTargetImage.title}"
                </h3>
              </div>

              {/* Side-by-side Preview */}
              <div className="grid grid-cols-2 gap-3 mb-5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div>
                  <span className="block text-[11px] font-semibold text-slate-500 mb-1">Current Image</span>
                  <div className="aspect-video rounded-xl overflow-hidden bg-slate-200 border border-slate-200">
                    <img
                      src={replaceTargetImage.src}
                      alt={replaceTargetImage.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div>
                  <span className="block text-[11px] font-semibold text-emerald-600 mb-1">Replacement Preview</span>
                  <div className="aspect-video rounded-xl overflow-hidden bg-slate-100 border border-dashed border-emerald-300 flex items-center justify-center">
                    {replaceMode === 'file' && replaceFilePreview ? (
                      <img
                        src={replaceFilePreview}
                        alt="New replacement preview"
                        className="w-full h-full object-cover"
                      />
                    ) : replaceMode === 'url' && replaceUrlInput.trim() ? (
                      <img
                        src={replaceUrlInput.trim()}
                        alt="URL replacement preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://placehold.co/400x300/f1f5f9/94a3b8?text=Invalid+URL';
                        }}
                      />
                    ) : (
                      <div className="text-center p-2">
                        <ImageIcon className="w-5 h-5 mx-auto text-slate-300 mb-1" />
                        <span className="text-[10px] text-slate-400 font-medium">Select file or URL</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
                <button
                  type="button"
                  onClick={() => setReplaceMode('file')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    replaceMode === 'file' ? 'bg-white text-emerald-brand shadow-sm' : 'text-slate-500'
                  }`}
                >
                  Device File
                </button>
                <button
                  type="button"
                  onClick={() => setReplaceMode('url')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    replaceMode === 'url' ? 'bg-white text-emerald-brand shadow-sm' : 'text-slate-500'
                  }`}
                >
                  External Image URL
                </button>
              </div>

              <form onSubmit={handleReplaceSubmit} className="space-y-4">
                {replaceMode === 'file' ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Select Replacement Image File</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setReplaceFile(e.target.files?.[0] || null)}
                      className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-brand file:text-white hover:file:bg-emerald-brand/90 cursor-pointer"
                    />
                    {replaceFile && (
                      <p className="text-xs text-emerald-600 mt-1.5 font-medium flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        Selected: {replaceFile.name} ({(replaceFile.size / 1024).toFixed(1)} KB)
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Replacement Image URL</label>
                    <input
                      type="url"
                      value={replaceUrlInput}
                      onChange={(e) => setReplaceUrlInput(e.target.value)}
                      placeholder="https://example.com/new-image.jpg"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-brand"
                    />
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setReplaceTargetImage(null);
                      setReplaceFile(null);
                      setReplaceUrlInput('');
                      setReplaceFilePreview('');
                    }}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || (replaceMode === 'file' && !replaceFile) || (replaceMode === 'url' && !replaceUrlInput.trim())}
                    className="px-5 py-2 rounded-xl bg-emerald-brand text-white text-xs font-semibold shadow-md hover:bg-emerald-brand/90 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Replacing...
                      </>
                    ) : (
                      'Confirm & Replace'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* EDIT IMAGE METADATA MODAL */}
      {/* ======================================================== */}
      <AnimatePresence>
        {editTargetImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative"
            >
              <button
                onClick={() => setEditTargetImage(null)}
                className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6 flex items-center gap-3">
                <img
                  src={editTargetImage.src}
                  alt={editTargetImage.alt}
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-200"
                />
                <div>
                  <div className="flex items-center gap-1.5 text-emerald-brand text-xs font-bold uppercase tracking-wider mb-0.5">
                    <Edit2 className="w-3.5 h-3.5" /> Edit Details
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{editTargetImage.title}</h3>
                </div>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Image Title *</label>
                  <input
                    type="text"
                    value={editTargetImage.title || ''}
                    onChange={(e) => setEditTargetImage({ ...editTargetImage, title: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-brand"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                    <select
                      value={editTargetImage.category || 'Township'}
                      onChange={(e) => setEditTargetImage({ ...editTargetImage, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-brand"
                    >
                      {categories.filter((c) => c !== 'All').map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Target Section</label>
                    <select
                      value={editTargetImage.targetSection || 'gallery'}
                      onChange={(e) => setEditTargetImage({ ...editTargetImage, targetSection: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-brand"
                    >
                      <option value="gallery">Main Gallery</option>
                      <option value="hero">Hero Slider</option>
                      <option value="project">Project Page</option>
                      <option value="masterplan">Master Plan</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Alt Description</label>
                  <input
                    type="text"
                    value={editTargetImage.alt || ''}
                    onChange={(e) => setEditTargetImage({ ...editTargetImage, alt: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-brand"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditTargetImage(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl bg-emerald-brand text-white text-xs font-semibold shadow-md hover:bg-emerald-brand/90 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ======================================================== */}
      <AnimatePresence>
        {deleteConfirmImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900">Delete Image?</h3>
                <p className="text-slate-500 text-xs mt-1">
                  Are you sure you want to delete <span className="font-bold text-slate-800">"{deleteConfirmImage.title}"</span>? This action cannot be undone.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl flex items-center gap-3 border border-slate-200 text-left">
                <img
                  src={deleteConfirmImage.src}
                  alt={deleteConfirmImage.title}
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div className="overflow-hidden">
                  <p className="font-semibold text-xs text-slate-800 truncate">{deleteConfirmImage.title}</p>
                  <p className="text-[11px] text-slate-400">{deleteConfirmImage.category} • {deleteConfirmImage.targetSection || 'gallery'}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmImage(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-semibold shadow-md hover:bg-rose-700 cursor-pointer"
                >
                  Yes, Delete Image
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* LOGOUT CONFIRMATION MODAL */}
      {/* ======================================================== */}
      <AnimatePresence>
        {isLogoutModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative text-center space-y-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
                <LogOut className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">Lock & Sign Out?</h3>
                <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                  Are you sure you want to end your administrative session and return to the secure access gate?
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl flex items-center gap-3 border border-slate-200 text-left">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <p className="font-semibold text-xs text-slate-800 truncate">
                    {adminUser?.email || 'istewakhassantewak121@gmail.com'}
                  </p>
                  <p className="text-[11px] text-emerald-600 font-medium">Universal Admin Session</p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  disabled={isLoggingOut}
                  onClick={() => setIsLogoutModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isLoggingOut}
                  onClick={async () => {
                    setIsLoggingOut(true);
                    try {
                      await adminLogout();
                      addToast('Administrative session safely locked & logged out.', 'info');
                    } finally {
                      setIsLoggingOut(false);
                      setIsLogoutModalOpen(false);
                    }
                  }}
                  className="flex-1 py-3 rounded-xl bg-rose-600 text-white text-xs font-semibold shadow-md hover:bg-rose-700 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoggingOut ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Locking...</span>
                    </>
                  ) : (
                    <>
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Yes, Lock & Exit</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* RESET IMAGES CONFIRMATION MODAL */}
      {/* ======================================================== */}
      <AnimatePresence>
        {isResetImagesModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                <RefreshCw className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900">Reset All Images?</h3>
                <p className="text-slate-500 text-xs mt-1">
                  This will restore all default media gallery images and sliders to their factory presets.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsResetImagesModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetImagesToDefault();
                    addToast('Media reset to factory defaults', 'info');
                    setIsResetImagesModalOpen(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 text-white text-xs font-semibold shadow-md hover:bg-amber-700 cursor-pointer"
                >
                  Reset Defaults
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LIGHTBOX FOR FULL VIEW */}
      {lightboxIndex !== null && (
        <Lightbox
          images={filteredImages}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={(i) => setLightboxIndex(i)}
        />
      )}
    </div>
  );
}
