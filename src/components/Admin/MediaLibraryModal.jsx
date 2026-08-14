import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Search,
  Check,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  FolderOpen,
} from 'lucide-react';
import { useImages } from '../../context/ImageContext';

export default function MediaLibraryModal({
  isOpen,
  onClose,
  onSelect,
  currentValue = '',
  title = 'Select Image from Media Library',
}) {
  const { images, uploadImageFile } = useImages();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' | 'upload'
  
  // Quick Upload State
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState('');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Township');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const categories = useMemo(() => {
    const set = new Set(['All']);
    images.forEach((img) => {
      if (img.category) set.add(img.category);
      if (img.targetSection) set.add(img.targetSection);
    });
    return Array.from(set);
  }, [images]);

  const filteredImages = useMemo(() => {
    return images.filter((img) => {
      const matchesCat =
        selectedCategory === 'All' ||
        img.category === selectedCategory ||
        img.targetSection === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (img.title && img.title.toLowerCase().includes(q)) ||
        (img.alt && img.alt.toLowerCase().includes(q)) ||
        (img.category && img.category.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [images, selectedCategory, searchQuery]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      setUploadTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      const reader = new FileReader();
      reader.onload = () => setUploadPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handlePerformUpload = async () => {
    if (!uploadFile) return;
    setIsUploading(true);
    try {
      const newImg = await uploadImageFile({
        file: uploadFile,
        title: uploadTitle || 'Uploaded Asset',
        category: uploadCategory,
        alt: uploadTitle || 'Uploaded Asset',
        targetSection: 'all',
      });
      if (newImg && newImg.src) {
        onSelect(newImg.src);
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-brand flex items-center justify-center">
                <FolderOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">{title}</h3>
                <p className="text-xs text-slate-500">
                  Select an existing media asset or upload a new one directly
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setActiveTab('browse')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'browse'
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Gallery ({images.length})
                </button>
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                    activeTab === 'upload'
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Upload className="w-3 h-3" /> Upload New
                </button>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {activeTab === 'browse' ? (
              <>
                {/* Search & Filter bar */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search image name, category or tag..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-brand/30"
                    />
                  </div>

                  {/* Category Pills */}
                  <div className="flex gap-1 overflow-x-auto pb-1 max-w-full scrollbar-none">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap cursor-pointer transition-all ${
                          selectedCategory === cat
                            ? 'bg-emerald-brand text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grid */}
                {filteredImages.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <ImageIcon className="w-10 h-10 mx-auto text-slate-300" />
                    <p className="text-xs">No images matched your query.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                    {filteredImages.map((img) => {
                      const isSelected = currentValue === img.src;
                      return (
                        <div
                          key={img.id}
                          onClick={() => {
                            onSelect(img.src);
                            onClose();
                          }}
                          className={`group relative rounded-2xl overflow-hidden border-2 cursor-pointer transition-all hover:shadow-lg bg-slate-100 aspect-video ${
                            isSelected
                              ? 'border-emerald-brand ring-2 ring-emerald-brand/30'
                              : 'border-transparent hover:border-emerald-brand/50'
                          }`}
                        >
                          <img
                            src={img.src}
                            alt={img.alt || img.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

                          {isSelected && (
                            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-emerald-brand text-white flex items-center justify-center shadow-md">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          )}

                          <div className="absolute bottom-2 left-2 right-2 text-white">
                            <p className="text-[11px] font-bold line-clamp-1 leading-tight">
                              {img.title}
                            </p>
                            <span className="text-[9px] text-emerald-200 font-medium uppercase tracking-wider">
                              {img.category || 'Asset'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              /* Upload Tab */
              <div className="max-w-md mx-auto py-6 space-y-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-emerald-brand rounded-2xl p-6 text-center cursor-pointer bg-slate-50/50 hover:bg-emerald-50/30 transition-all"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {uploadPreview ? (
                    <div className="space-y-3">
                      <img
                        src={uploadPreview}
                        alt="Preview"
                        className="max-h-48 mx-auto rounded-xl object-cover shadow-sm"
                      />
                      <p className="text-xs text-emerald-600 font-semibold">
                        Click or drag to choose another file
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-brand mx-auto flex items-center justify-center">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-slate-800">
                        Click to select an image from your computer
                      </p>
                      <p className="text-[11px] text-slate-400">
                        PNG, JPG, WEBP or JPEG up to 10MB
                      </p>
                    </div>
                  )}
                </div>

                {uploadPreview && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Asset Title
                      </label>
                      <input
                        type="text"
                        value={uploadTitle}
                        onChange={(e) => setUploadTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-brand/30"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Category
                      </label>
                      <select
                        value={uploadCategory}
                        onChange={(e) => setUploadCategory(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-brand/30 bg-white"
                      >
                        <option value="Township">Township</option>
                        <option value="Residential">Residential</option>
                        <option value="Resort">Resort</option>
                        <option value="Commercial">Commercial</option>
                        <option value="Agro Tourism">Agro Tourism</option>
                      </select>
                    </div>

                    <button
                      onClick={handlePerformUpload}
                      disabled={isUploading}
                      className="w-full py-2.5 rounded-xl bg-emerald-brand text-white font-bold text-xs hover:bg-emerald-brand/90 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {isUploading ? 'Uploading & Setting...' : 'Upload & Use This Image'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
            <span className="truncate max-w-md font-mono text-[11px] text-slate-400">
              {currentValue ? `Current: ${currentValue}` : 'No image currently selected'}
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold cursor-pointer transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
