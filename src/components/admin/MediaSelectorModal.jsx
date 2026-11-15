import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Search,
  Upload,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Folder,
  ExternalLink,
  Layers,
  Sparkles,
  RefreshCw,
  Info,
} from 'lucide-react';
import { fetchMediaList, uploadMediaFile, fetchCloudinaryStatus } from '../../services/mediaApi';

const FOLDERS = [
  { id: 'all', label: 'All Folders' },
  { id: 'haxudio/services', label: 'Services' },
  { id: 'haxudio/projects', label: 'Projects' },
  { id: 'haxudio/team', label: 'Team' },
  { id: 'haxudio/testimonials', label: 'Testimonials' },
  { id: 'haxudio/content', label: 'Content' },
  { id: 'haxudio/branding', label: 'Branding' },
  { id: 'haxudio/seo', label: 'SEO' },
  { id: 'haxudio/misc', label: 'Misc' },
];

export default function MediaSelectorModal({
  isOpen,
  onClose,
  onSelect,
  currentValue = '',
  defaultFolder = 'all',
  initialTab = 'library',
  title = 'Select Image Asset',
}) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'library' | 'upload' | 'direct'
  const [selectedFolder, setSelectedFolder] = useState(defaultFolder);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Library State
  const [mediaItems, setMediaItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  // Cloudinary Status
  const [cloudinaryStatus, setCloudinaryStatus] = useState({ configured: true });

  // Upload Tab State
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [uploadFolder, setUploadFolder] = useState(
    defaultFolder !== 'all' ? defaultFolder : 'haxudio/misc'
  );
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadAltText, setUploadAltText] = useState('');
  const [uploadCaption, setUploadCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // Direct URL State
  const [directUrl, setDirectUrl] = useState(currentValue || '');
  const [directAltText, setDirectAltText] = useState('');

  const fileInputRef = useRef(null);

  // Check Cloudinary status & load media when opened
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab || 'library');
      setUploadError(null);
      loadMedia(1, selectedFolder, searchQuery);
      checkStatus();
      if (currentValue) {
        setDirectUrl(currentValue);
      }
    }
  }, [isOpen, initialTab]);

  const checkStatus = async () => {
    const status = await fetchCloudinaryStatus();
    setCloudinaryStatus(status);
  };

  const loadMedia = async (page = 1, folder = selectedFolder, search = searchQuery) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchMediaList({ page, limit: 30, folder, search });
      if (res.data) {
        setMediaItems(res.data);
        setPagination({
          page: res.currentPage || 1,
          totalPages: res.totalPages || 1,
          total: res.total || 0,
        });

        // If there's a currentValue, highlight matching item if found
        if (currentValue && !selectedMedia) {
          const matched = res.data.find(
            (m) => m.url === currentValue || m.secureUrl === currentValue
          );
          if (matched) setSelectedMedia(matched);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load media assets.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFolderChange = (folderId) => {
    setSelectedFolder(folderId);
    loadMedia(1, folderId, searchQuery);
  };

  const handleSearchSubmit = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    loadMedia(1, selectedFolder, searchQuery);
  };

  // Upload handler
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check SVG
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (file.type === 'image/svg+xml' || ext === 'svg') {
      setUploadError('SVG uploads are disabled for security reasons. Please use WebP, PNG, JPEG, or AVIF.');
      setUploadFile(null);
      setUploadPreview(null);
      return;
    }

    // Check size (10 MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size exceeds the 10 MB limit.');
      setUploadFile(null);
      setUploadPreview(null);
      return;
    }

    setUploadError(null);
    setUploadFile(file);
    setUploadTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));

    const reader = new FileReader();
    reader.onload = (event) => setUploadPreview(event.target?.result);
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!uploadFile) {
      setUploadError('Please choose an image file to upload.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const uploaded = await uploadMediaFile(uploadFile, {
        folder: uploadFolder,
        title: uploadTitle,
        altText: uploadAltText,
        caption: uploadCaption,
      });

      // Clear upload fields
      setUploadFile(null);
      setUploadPreview(null);
      setUploadTitle('');
      setUploadAltText('');
      setUploadCaption('');

      // Auto-select and notify parent
      if (onSelect) {
        onSelect({
          url: uploaded.secureUrl || uploaded.url,
          secureUrl: uploaded.secureUrl,
          altText: uploaded.altText || uploadAltText,
          title: uploaded.title || uploadTitle,
          id: uploaded._id || uploaded.id,
          publicId: uploaded.publicId,
        });
      }
      onClose();
    } catch (err) {
      if (err.code === 'CLOUDINARY_NOT_CONFIGURED' || err.status === 503) {
        setUploadError(
          'Cloudinary credentials are not configured in your server environment. To upload images, please define CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env.'
        );
      } else {
        setUploadError(err.message || 'Image upload failed. Please try again.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmSelect = () => {
    if (!selectedMedia) return;
    if (onSelect) {
      onSelect({
        url: selectedMedia.secureUrl || selectedMedia.url,
        secureUrl: selectedMedia.secureUrl,
        altText: selectedMedia.altText || selectedMedia.title || '',
        title: selectedMedia.title || selectedMedia.filename || '',
        id: selectedMedia._id,
        publicId: selectedMedia.publicId,
      });
    }
    onClose();
  };

  const handleConfirmDirect = () => {
    if (!directUrl.trim()) return;
    if (onSelect) {
      onSelect({
        url: directUrl.trim(),
        secureUrl: directUrl.trim(),
        altText: directAltText.trim(),
        title: directAltText.trim() || 'Custom Asset',
      });
    }
    onClose();
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-[#14161C] border border-[#252830] rounded-2xl w-full max-w-5xl h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#252830] flex items-center justify-between bg-[#111318] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#C25E34]/20 border border-[#C25E34]/40 flex items-center justify-center text-[#C25E34]">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-[#FAF8F5]">
                {title}
              </h3>
              <p className="text-xs text-[#8A8782]">
                Browse existing assets, upload directly to Cloudinary, or specify asset path.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tabs */}
            <div className="flex items-center bg-[#1B1E26] p-1 rounded-lg border border-[#282C38] text-xs font-mono">
              <button
                type="button"
                onClick={() => setActiveTab('library')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  activeTab === 'library'
                    ? 'bg-[#C25E34] text-white font-semibold'
                    : 'text-[#8A8782] hover:text-[#FAF8F5]'
                }`}
              >
                Media Library
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'upload'
                    ? 'bg-[#C25E34] text-white font-semibold'
                    : 'text-[#8A8782] hover:text-[#FAF8F5]'
                }`}
              >
                <Upload className="w-3 h-3" />
                <span>Upload New</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('direct')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  activeTab === 'direct'
                    ? 'bg-[#C25E34] text-white font-semibold'
                    : 'text-[#8A8782] hover:text-[#FAF8F5]'
                }`}
              >
                Direct URL
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#8A8782] hover:text-[#FAF8F5] hover:bg-[#1E212B] transition-colors cursor-pointer ml-2"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* TAB 1: MEDIA LIBRARY */}
          {activeTab === 'library' && (
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Left Content: Search, Folder Pills, Grid */}
              <div className="flex-1 flex flex-col overflow-hidden border-r border-[#252830]">
                {/* Search & Folder Bar */}
                <div className="p-3 border-b border-[#252830] bg-[#111318] space-y-2.5 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8782]" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSearchSubmit(e);
                          }
                        }}
                        placeholder="Search media by title, filename, or alt text..."
                        className="w-full pl-9 pr-3 py-1.5 bg-[#0D0E11] border border-[#252830] rounded-lg text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C25E34]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => loadMedia(1, selectedFolder, searchQuery)}
                      className="p-2 rounded-lg bg-[#1B1E26] hover:bg-[#282C38] text-[#8A8782] hover:text-[#FAF8F5] transition-colors cursor-pointer"
                      title="Refresh library"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>

                  {/* Folder Pill Strip */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-mono scrollbar-none">
                    {FOLDERS.map((f) => {
                      const isSel = selectedFolder === f.id;
                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => handleFolderChange(f.id)}
                          className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                            isSel
                              ? 'bg-[#C25E34]/20 border border-[#C25E34] text-[#C25E34] font-semibold'
                              : 'bg-[#181A22] border border-[#252830] text-[#8A8782] hover:text-[#FAF8F5]'
                          }`}
                        >
                          {f.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Media Grid */}
                <div className="flex-1 overflow-y-auto p-4">
                  {isLoading && (
                    <div className="h-64 flex flex-col items-center justify-center gap-2 text-xs font-mono text-[#8A8782]">
                      <RefreshCw className="w-5 h-5 animate-spin text-[#C25E34]" />
                      <span>Loading media assets...</span>
                    </div>
                  )}

                  {!isLoading && error && (
                    <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/50 text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {!isLoading && !error && mediaItems.length === 0 && (
                    <div className="h-64 flex flex-col items-center justify-center gap-3 text-center p-6">
                      <div className="w-12 h-12 rounded-xl bg-[#1B1E26] border border-[#282C38] flex items-center justify-center text-[#8A8782]">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-[#FAF8F5]">No images found in this folder</p>
                        <p className="text-xs text-[#8A8782]">
                          Upload a new image or switch to another folder.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('upload')}
                        className="px-3.5 py-1.5 rounded-lg bg-[#C25E34] hover:bg-[#D46B3E] text-xs font-mono text-white flex items-center gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload First Image</span>
                      </button>
                    </div>
                  )}

                  {!isLoading && !error && mediaItems.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {mediaItems.map((item) => {
                        const isSelected = selectedMedia?._id === item._id;
                        const isCurrent =
                          currentValue &&
                          (currentValue === item.url || currentValue === item.secureUrl);

                        return (
                          <div
                            key={item._id}
                            onClick={() => setSelectedMedia(item)}
                            className={`group relative rounded-xl border overflow-hidden cursor-pointer transition-all aspect-video bg-[#0D0E11] ${
                              isSelected
                                ? 'border-[#C25E34] ring-2 ring-[#C25E34]/40 shadow-lg'
                                : 'border-[#252830] hover:border-[#383C4A]'
                            }`}
                          >
                            <img
                              src={item.secureUrl || item.url}
                              alt={item.altText || item.title || item.filename}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />

                            {/* Format & Provider Badge */}
                            <div className="absolute top-1.5 left-1.5 flex items-center gap-1">
                              <span className="px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[9px] font-mono text-[#FAF8F5] uppercase">
                                {item.format || 'img'}
                              </span>
                            </div>

                            {/* Active or Current Marker */}
                            {isSelected && (
                              <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#C25E34] flex items-center justify-center text-white shadow">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                            )}

                            {isCurrent && !isSelected && (
                              <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-700 text-[9px] font-mono text-emerald-300">
                                Current
                              </div>
                            )}

                            {/* Bottom Caption Overlay */}
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2 pt-4">
                              <p className="text-[11px] font-semibold text-[#FAF8F5] truncate leading-tight">
                                {item.title || item.filename}
                              </p>
                              <p className="text-[9px] font-mono text-[#8A8782] truncate">
                                {item.folder ? item.folder.replace('haxudio/', '') : ''}
                                {item.width ? ` · ${item.width}×${item.height}` : ''}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Sidebar: Selected Asset Details */}
              <div className="w-full md:w-72 bg-[#111318] p-4 flex flex-col justify-between shrink-0 overflow-y-auto border-t md:border-t-0 border-[#252830]">
                {selectedMedia ? (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#8A8782]">
                        Selected Image
                      </span>
                      <h4 className="font-semibold text-xs text-[#FAF8F5] truncate">
                        {selectedMedia.title || selectedMedia.filename}
                      </h4>
                    </div>

                    {/* Preview Box */}
                    <div className="rounded-lg border border-[#252830] overflow-hidden bg-neutral-950 aspect-video flex items-center justify-center">
                      <img
                        src={selectedMedia.secureUrl || selectedMedia.url}
                        alt={selectedMedia.altText || ''}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Metadata Specs */}
                    <div className="space-y-2 text-[11px] font-mono">
                      <div className="flex justify-between py-1 border-b border-[#1E212B]">
                        <span className="text-[#8A8782]">Dimensions:</span>
                        <span className="text-[#FAF8F5]">
                          {selectedMedia.width ? `${selectedMedia.width} × ${selectedMedia.height}` : 'N/A'}
                        </span>
                      </div>

                      <div className="flex justify-between py-1 border-b border-[#1E212B]">
                        <span className="text-[#8A8782]">File Size:</span>
                        <span className="text-[#FAF8F5]">
                          {selectedMedia.bytes ? `${Math.round(selectedMedia.bytes / 1024)} KB` : 'N/A'}
                        </span>
                      </div>

                      <div className="flex justify-between py-1 border-b border-[#1E212B]">
                        <span className="text-[#8A8782]">Format:</span>
                        <span className="text-[#FAF8F5] uppercase">
                          {selectedMedia.format || selectedMedia.mimeType || 'Image'}
                        </span>
                      </div>

                      <div className="flex justify-between py-1 border-b border-[#1E212B]">
                        <span className="text-[#8A8782]">Folder:</span>
                        <span className="text-[#FAF8F5]">
                          {selectedMedia.folder || 'haxudio/misc'}
                        </span>
                      </div>

                      <div className="space-y-1 pt-1">
                        <span className="text-[#8A8782] block">Alt Text:</span>
                        <p className="text-[#FAF8F5] font-sans text-xs bg-[#0D0E11] p-2 rounded border border-[#252830] leading-snug">
                          {selectedMedia.altText || 'No alt text provided.'}
                        </p>
                      </div>

                      <div className="space-y-1 pt-1">
                        <span className="text-[#8A8782] block">Asset URL:</span>
                        <p className="text-[10px] text-[#A09D98] bg-[#0D0E11] p-1.5 rounded border border-[#252830] break-all select-all">
                          {selectedMedia.secureUrl || selectedMedia.url}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-center p-4 text-[#8A8782] space-y-2">
                    <ImageIcon className="w-8 h-8 stroke-1" />
                    <p className="text-xs">Click an image on the left to preview its specs and insert it.</p>
                  </div>
                )}

                {/* Confirm Action Button */}
                <div className="pt-4 border-t border-[#252830] space-y-2">
                  <button
                    type="button"
                    disabled={!selectedMedia}
                    onClick={handleConfirmSelect}
                    className="w-full py-2.5 px-4 rounded-lg bg-[#C25E34] hover:bg-[#D46B3E] text-white text-xs font-mono font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow"
                  >
                    Insert Selected Image
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-2 px-4 rounded-lg bg-[#181A20] hover:bg-[#222530] text-[#8A8782] hover:text-[#FAF8F5] text-xs font-mono transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: UPLOAD TO CLOUDINARY */}
          {activeTab === 'upload' && (
            <div className="flex-1 overflow-y-auto p-6 max-w-2xl mx-auto w-full">
              {!cloudinaryStatus.configured && (
                <div className="mb-4 p-4 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs flex items-start gap-3">
                  <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                  <div className="space-y-1">
                    <p className="font-semibold text-amber-200">Cloudinary Credentials Notice</p>
                    <p className="leading-relaxed text-[#D2C5B4]">
                      Cloudinary is not yet configured in your server environment. To upload live images, define <code className="bg-black/40 px-1 py-0.5 rounded text-amber-300">CLOUDINARY_CLOUD_NAME</code>, <code className="bg-black/40 px-1 py-0.5 rounded text-amber-300">CLOUDINARY_API_KEY</code>, and <code className="bg-black/40 px-1 py-0.5 rounded text-amber-300">CLOUDINARY_API_SECRET</code> in <code className="text-amber-300">.env</code>.
                    </p>
                  </div>
                </div>
              )}

              {uploadError && (
                <div className="mb-4 p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              <div className="space-y-5">
                {/* File Dropzone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                    uploadPreview
                      ? 'border-[#C25E34] bg-[#C25E34]/5'
                      : 'border-[#2D313D] hover:border-[#C25E34] hover:bg-[#161820]'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {uploadPreview ? (
                    <div className="space-y-3">
                      <div className="max-h-48 rounded-lg overflow-hidden inline-block border border-[#252830]">
                        <img src={uploadPreview} alt="Upload preview" className="max-h-48 object-contain" />
                      </div>
                      <p className="text-xs font-mono text-emerald-400">
                        {uploadFile?.name} ({Math.round((uploadFile?.size || 0) / 1024)} KB)
                      </p>
                      <p className="text-[11px] text-[#8A8782]">Click here to choose a different image file.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 py-4">
                      <div className="w-12 h-12 rounded-xl bg-[#1F222B] border border-[#2D313D] flex items-center justify-center text-[#C25E34] mx-auto">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold text-[#FAF8F5]">
                          Click to browse or drop image here
                        </p>
                        <p className="text-xs text-[#8A8782]">
                          Supported: WebP, PNG, JPEG, AVIF up to 10 MB. (SVG disabled for security)
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Target Folder */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#FAF8F5]">
                    Target Cloudinary Folder
                  </label>
                  <select
                    value={uploadFolder}
                    onChange={(e) => setUploadFolder(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0D0E11] border border-[#252830] rounded-lg text-xs font-mono text-[#FAF8F5] focus:outline-none focus:border-[#C25E34]"
                  >
                    <option value="haxudio/services">haxudio/services — Services CMS covers</option>
                    <option value="haxudio/projects">haxudio/projects — Project portfolio & galleries</option>
                    <option value="haxudio/team">haxudio/team — Team member portraits</option>
                    <option value="haxudio/testimonials">haxudio/testimonials — Client photos</option>
                    <option value="haxudio/content">haxudio/content — Homepage & narrative assets</option>
                    <option value="haxudio/branding">haxudio/branding — Logo, favicons, OG cards</option>
                    <option value="haxudio/seo">haxudio/seo — Social preview images</option>
                    <option value="haxudio/misc">haxudio/misc — Miscellaneous assets</option>
                  </select>
                </div>

                {/* Image Title */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#FAF8F5]">
                    Image Title
                  </label>
                  <input
                    type="text"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="Descriptive title for internal management..."
                    className="w-full px-3 py-2 bg-[#0D0E11] border border-[#252830] rounded-lg text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C25E34]"
                  />
                </div>

                {/* Alt Text */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#FAF8F5]">
                    Alt Text (Accessibility & SEO)
                  </label>
                  <input
                    type="text"
                    value={uploadAltText}
                    onChange={(e) => setUploadAltText(e.target.value)}
                    placeholder="Describe the image content for screen readers and search engines..."
                    className="w-full px-3 py-2 bg-[#0D0E11] border border-[#252830] rounded-lg text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C25E34]"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('library')}
                    className="px-4 py-2 rounded-lg bg-[#181A20] text-xs font-mono text-[#8A8782] hover:text-[#FAF8F5] transition-colors cursor-pointer"
                  >
                    Back to Library
                  </button>
                  <button
                    type="button"
                    disabled={!uploadFile || isUploading}
                    onClick={handleUploadSubmit}
                    className="px-6 py-2 rounded-lg bg-[#C25E34] hover:bg-[#D46B3E] text-xs font-mono font-semibold text-white transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40"
                  >
                    {isUploading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Uploading to Cloudinary...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload & Select Image</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DIRECT URL / MANUAL ASSET PATH */}
          {activeTab === 'direct' && (
            <div className="flex-1 overflow-y-auto p-6 max-w-xl mx-auto w-full space-y-5">
              <div className="space-y-1">
                <h4 className="font-semibold text-sm text-[#FAF8F5]">Direct URL or Bundled Asset</h4>
                <p className="text-xs text-[#8A8782]">
                  Specify a full https:// image URL or existing local path (e.g. <code className="text-neutral-400">/src/assets/images/...</code>).
                </p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#FAF8F5]">Asset Path / URL</label>
                  <input
                    type="text"
                    value={directUrl}
                    onChange={(e) => setDirectUrl(e.target.value)}
                    placeholder="https://... or /src/assets/images/..."
                    className="w-full px-3 py-2 bg-[#0D0E11] border border-[#252830] rounded-lg text-xs font-mono text-[#FAF8F5] focus:outline-none focus:border-[#C25E34]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#FAF8F5]">Alt Text (Optional)</label>
                  <input
                    type="text"
                    value={directAltText}
                    onChange={(e) => setDirectAltText(e.target.value)}
                    placeholder="Descriptive alt text for SEO..."
                    className="w-full px-3 py-2 bg-[#0D0E11] border border-[#252830] rounded-lg text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C25E34]"
                  />
                </div>
              </div>

              {/* Preview if directUrl is present */}
              {directUrl.trim() && (
                <div className="rounded-xl border border-[#252830] p-3 bg-[#0D0E11] space-y-2">
                  <span className="text-[10px] font-mono uppercase text-[#8A8782] block">Live Preview</span>
                  <div className="rounded-lg overflow-hidden max-h-48 flex items-center justify-center bg-black">
                    <img
                      src={directUrl}
                      alt="Live preview"
                      className="max-h-48 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-[#181A20] text-xs font-mono text-[#8A8782] hover:text-[#FAF8F5] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!directUrl.trim()}
                  onClick={handleConfirmDirect}
                  className="px-6 py-2 rounded-lg bg-[#C25E34] hover:bg-[#D46B3E] text-xs font-mono font-semibold text-white transition-all cursor-pointer disabled:opacity-40"
                >
                  Use This URL
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
}
