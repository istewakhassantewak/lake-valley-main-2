import { useState, useRef } from 'react';
import {
  Upload,
  FolderOpen,
  X,
  Eye,
  Check,
  Sparkles,
  Link as LinkIcon,
  Image as ImageIcon,
} from 'lucide-react';
import MediaLibraryModal from './MediaLibraryModal';

const POPULAR_PRESETS = [
  {
    name: 'Flower City Masterview',
    url: 'https://lakevalleyflowercity.com/uploads/pages/1745397003_76929.jpeg',
    badge: 'Flagship',
  },
  {
    name: 'Green Garden Resort',
    url: 'https://lakevalleyflowercity.com/uploads/gallery-images/1785062843_47538.jpg',
    badge: 'Resort',
  },
  {
    name: 'Duplex City Villa',
    url: 'https://lakevalleyflowercity.com/uploads/gallery-images/1785062826_00838.jpg',
    badge: 'Duplex',
  },
  {
    name: 'Commercial Bangla Tower',
    url: 'https://lakevalleyflowercity.com/uploads/pages/1784711067_90986.jpeg',
    badge: 'Commercial',
  },
  {
    name: 'Master Plan Layout',
    url: 'https://lakevalleyflowercity.com/uploads/pages/1784702276_86395.jpeg',
    badge: 'Masterplan',
  },
];

export default function ImageFieldPicker({
  label = 'Image',
  value = '',
  onChange,
  description = '',
  aspectRatio = 'aspect-video',
  placeholder = 'Enter image URL or upload...',
  showPresets = true,
  customPresets = null,
  presetLabel = 'Quick Township Presets:',
  modalTitle = 'Select Media Image',
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFullsize, setShowFullsize] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef(null);

  const activePresets = customPresets || POPULAR_PRESETS;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result && onChange) {
          onChange(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (onChange) onChange('');
  };

  return (
    <div className="space-y-2.5">
      {/* Header Label and Actions */}
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-bold text-slate-800">{label}</label>
          {description && <p className="text-[11px] text-slate-500">{description}</p>}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer border border-emerald-200/60 shadow-xs"
            title="Upload image from computer"
          >
            <Upload className="w-3 h-3" /> Upload File
          </button>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer border border-blue-200/60 shadow-xs"
            title="Pick an image from the Media Library"
          >
            <FolderOpen className="w-3 h-3" /> Media Library
          </button>

          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer border ${
              showUrlInput
                ? 'bg-slate-800 text-white border-slate-800'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200'
            }`}
            title="Toggle URL Input"
          >
            <LinkIcon className="w-3 h-3" /> {showUrlInput ? 'Hide URL' : 'Edit URL'}
          </button>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Visual Preview Box */}
      <div
        className={`relative ${aspectRatio} w-full rounded-2xl overflow-hidden border border-slate-200/90 bg-slate-100/80 group shadow-inner flex items-center justify-center`}
      >
        {value ? (
          <>
            <img
              src={value}
              alt={label}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://placehold.co/600x400/e2e8f0/64748b?text=Image+Load+Error';
              }}
            />

            {/* Hover Actions Overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4 backdrop-blur-xs">
              <button
                type="button"
                onClick={() => setShowFullsize(true)}
                className="p-2 rounded-xl bg-white/90 text-slate-800 hover:bg-white hover:scale-105 transition-all shadow-md cursor-pointer"
                title="Preview Full Size"
              >
                <Eye className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-xl bg-emerald-brand text-white font-bold text-xs hover:bg-emerald-600 hover:scale-105 transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" /> Replace File
              </button>

              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 hover:scale-105 transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <FolderOpen className="w-3.5 h-3.5" /> Select Other
              </button>

              <button
                type="button"
                onClick={handleClear}
                className="p-2 rounded-xl bg-rose-500/90 text-white hover:bg-rose-600 hover:scale-105 transition-all shadow-md cursor-pointer"
                title="Clear Image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Badge */}
            <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold flex items-center gap-1.5 pointer-events-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Active Image
            </div>
          </>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="p-6 text-center cursor-pointer hover:bg-slate-200/50 transition-colors w-full h-full flex flex-col items-center justify-center space-y-2 border-2 border-dashed border-slate-300 rounded-2xl"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-500 flex items-center justify-center">
              <ImageIcon className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-700">Click to upload or pick an image</p>
            <p className="text-[10px] text-slate-400">JPG, PNG, WEBP or Paste URL</p>
          </div>
        )}
      </div>

      {/* Optional Direct URL Input Field */}
      {(showUrlInput || !value) && (
        <div className="space-y-1">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={placeholder}
              value={value || ''}
              onChange={(e) => onChange && onChange(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-brand/30 bg-white font-mono"
            />
            {value && (
              <button
                type="button"
                onClick={handleClear}
                className="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-500 text-xs font-semibold transition-colors cursor-pointer"
                title="Clear input"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Preset Quick Chooser */}
      {showPresets && activePresets?.length > 0 && (
        <div className="pt-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            {presetLabel}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {activePresets.map((preset) => {
              const isCurrent = value === preset.url;
              return (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => onChange && onChange(preset.url)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isCurrent
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {isCurrent && <Check className="w-3 h-3 text-emerald-300" />}
                  <span>{preset.name}</span>
                  {preset.badge && <span className="text-[9px] opacity-70">({preset.badge})</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Media Library Modal */}
      <MediaLibraryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={(newUrl) => onChange && onChange(newUrl)}
        currentValue={value}
        title={modalTitle}
      />

      {/* Fullscreen Lightbox Preview */}
      {showFullsize && value && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowFullsize(false)}
        >
          <div className="relative max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl">
            <img src={value} alt="Full Preview" className="max-h-[85vh] object-contain mx-auto" />
            <button
              onClick={() => setShowFullsize(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
