import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Image as ImageIcon,
  Upload,
  Search,
  Filter,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  Folder,
  Layers,
  Sparkles,
  RefreshCw,
  Info,
  Lock,
  Eye,
  Edit2,
  X,
  FileCheck,
  ShieldAlert,
} from 'lucide-react';
import ProtectedRoute from '../../components/admin/ProtectedRoute';
import AdminNavbar from '../../components/admin/AdminNavbar';
import {
  fetchMediaList,
  fetchMediaById,
  uploadMediaFile,
  updateMediaMetadata,
  deleteMedia,
  fetchMediaUsage,
  fetchCloudinaryStatus,
} from '../../services/mediaApi';

const FOLDER_OPTIONS = [
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

export default function AdminMediaPage() {
  const [mediaList, setMediaList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Cloudinary Status
  const [cloudinaryStatus, setCloudinaryStatus] = useState({ configured: true });

  // Details & Usage Drawer
  const [activeMedia, setActiveMedia] = useState(null);
  const [usageDetails, setUsageDetails] = useState(null);
  const [isLoadingUsage, setIsLoadingUsage] = useState(false);
  const [isUpdatingMetadata, setIsUpdatingMetadata] = useState(false);
  const [metadataForm, setMetadataForm] = useState({
    title: '',
    altText: '',
    caption: '',
    folder: 'haxudio/misc',
  });

  // Upload Dialog
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [uploadFolder, setUploadFolder] = useState('haxudio/misc');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadAltText, setUploadAltText] = useState('');
  const [uploadCaption, setUploadCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // Delete State
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // Copy feedback
  const [copiedId, setCopiedId] = useState(null);

  // Toast notification
  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4500);
  };

  // Initial Load
  useEffect(() => {
    checkCloudinary();
    loadMedia(1, selectedFolder, searchQuery);
  }, []);

  const checkCloudinary = async () => {
    const status = await fetchCloudinaryStatus();
    setCloudinaryStatus(status);
  };

  const loadMedia = async (page = 1, folder = selectedFolder, search = searchQuery) => {
    setIsLoading(true);
    try {
      const res = await fetchMediaList({ page, limit: 18, folder, search });
      if (res && res.data) {
        setMediaList(res.data);
        setCurrentPage(res.currentPage || 1);
        setTotalPages(res.totalPages || 1);
        setTotalCount(res.total || 0);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load media assets.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFolderSelect = (folderId) => {
    setSelectedFolder(folderId);
    setCurrentPage(1);
    loadMedia(1, folderId, searchQuery);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadMedia(1, selectedFolder, searchQuery);
  };

  // Open Details Modal and fetch usage
  const handleOpenDetails = async (media) => {
    setActiveMedia(media);
    setMetadataForm({
      title: media.title || '',
      altText: media.altText || '',
      caption: media.caption || '',
      folder: media.folder || 'haxudio/misc',
    });
    setIsLoadingUsage(true);
    setUsageDetails(null);

    try {
      const usage = await fetchMediaUsage(media._id);
      setUsageDetails(usage);
    } catch (err) {
      console.warn('Failed to check usage:', err.message);
      setUsageDetails({ inUse: false, usageCount: 0, references: [] });
    } finally {
      setIsLoadingUsage(false);
    }
  };

  // Save metadata
  const handleSaveMetadata = async (e) => {
    e.preventDefault();
    if (!activeMedia) return;

    setIsUpdatingMetadata(true);
    try {
      const updated = await updateMediaMetadata(activeMedia._id, metadataForm);
      setActiveMedia(updated);
      setMediaList((prev) =>
        prev.map((item) => (item._id === updated._id ? { ...item, ...metadataForm } : item))
      );
      showToast('Media metadata updated successfully.');
    } catch (err) {
      showToast(err.message || 'Failed to update metadata.', 'error');
    } finally {
      setIsUpdatingMetadata(false);
    }
  };

  // File Upload Handlers
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (file.type === 'image/svg+xml' || ext === 'svg') {
      setUploadError('SVG uploads are prohibited for security reasons. Please use WebP, PNG, JPEG, or AVIF.');
      setUploadFile(null);
      setUploadPreview(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size exceeds the 10 MB maximum limit.');
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
    e.preventDefault();
    if (!uploadFile) {
      setUploadError('Please select an image file to upload.');
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

      showToast(`Uploaded "${uploaded.title || uploaded.filename}" to Cloudinary!`);
      setIsUploadOpen(false);
      setUploadFile(null);
      setUploadPreview(null);
      setUploadTitle('');
      setUploadAltText('');
      setUploadCaption('');

      // Refresh list
      loadMedia(1, selectedFolder, searchQuery);
    } catch (err) {
      if (err.code === 'CLOUDINARY_NOT_CONFIGURED' || err.status === 503) {
        setUploadError(
          'Cloudinary is not configured on the server. Please define CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your server environment (.env).'
        );
      } else {
        setUploadError(err.message || 'Image upload failed.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Delete Handler with Reference Protection
  const handleInitiateDelete = async (media) => {
    setItemToDelete(media);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteMedia(itemToDelete._id);
      setMediaList((prev) => prev.filter((m) => m._id !== itemToDelete._id));
      setTotalCount((prev) => Math.max(0, prev - 1));
      showToast('Media asset removed from storage and database.');
      setItemToDelete(null);
      if (activeMedia?._id === itemToDelete._id) {
        setActiveMedia(null);
      }
    } catch (err) {
      if (err.code === 'MEDIA_IN_USE' || err.status === 409) {
        setDeleteError({
          message: err.message,
          references: err.references || [],
          count: err.usageCount || 0,
        });
      } else {
        setDeleteError({ message: err.message || 'Failed to delete media asset.' });
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // Copy URL to clipboard
  const handleCopyUrl = (url, id) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    showToast('Image URL copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0D0E11] text-[#FAF8F5] flex flex-col font-sans selection:bg-[#C25E34] selection:text-white">
        <AdminNavbar activeTab="media" />

        {/* Toast Notification */}
        {notification && (
          <div
            className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200 text-xs font-mono ${
              notification.type === 'error'
                ? 'bg-rose-950 border-rose-800 text-rose-200'
                : 'bg-emerald-950 border-emerald-800 text-emerald-200'
            }`}
          >
            {notification.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        )}

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Header & Badges */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#252830] pb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#C25E34] font-semibold">
                  Haxudio Asset Management
                </span>
                <span className="text-[#3A3D4A]">·</span>
                <span className="text-[11px] font-mono text-[#8A8782]">Phase 3F</span>
              </div>
              <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#FAF8F5]">
                Media & Image Library
              </h1>
              <p className="text-xs sm:text-sm text-[#8A8782] max-w-2xl mt-1">
                Upload, categorize, inspect usage, and safely manage website images hosted on Cloudinary with MongoDB metadata.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => loadMedia(currentPage, selectedFolder, searchQuery)}
                className="p-2 rounded-lg bg-[#14161C] border border-[#252830] hover:bg-[#1E212B] text-[#8A8782] hover:text-[#FAF8F5] transition-colors cursor-pointer"
                title="Refresh media"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>

              <button
                type="button"
                onClick={() => setIsUploadOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#C25E34] hover:bg-[#D46B3E] text-xs font-mono font-semibold text-white transition-all cursor-pointer shadow-md"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Media</span>
              </button>
            </div>
          </div>

          {/* Cloudinary Status Notice */}
          {!cloudinaryStatus.configured && (
            <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/50 flex items-start gap-3 text-xs">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-amber-200">Cloudinary Not Configured:</span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-900/60 font-mono text-[10px] text-amber-300">
                    CLOUDINARY_NOT_CONFIGURED
                  </span>
                </div>
                <p className="text-[#C4B7A6] leading-relaxed">
                  Existing bundled images and direct URLs continue working smoothly across the site. To enable direct file uploads to Cloudinary, set <code className="text-amber-300 bg-black/40 px-1 py-0.5 rounded">CLOUDINARY_CLOUD_NAME</code>, <code className="text-amber-300 bg-black/40 px-1 py-0.5 rounded">CLOUDINARY_API_KEY</code>, and <code className="text-amber-300 bg-black/40 px-1 py-0.5 rounded">CLOUDINARY_API_SECRET</code> in your environment.
                </p>
              </div>
            </div>
          )}

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-[#14161C] border border-[#252830]">
              <span className="text-[10px] font-mono uppercase text-[#8A8782] block">Total Indexed Assets</span>
              <span className="text-xl font-bold font-display text-[#FAF8F5]">{totalCount}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#14161C] border border-[#252830]">
              <span className="text-[10px] font-mono uppercase text-[#8A8782] block">Primary Storage</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs font-semibold text-[#FAF8F5]">Cloudinary CDN</span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    cloudinaryStatus.configured ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#14161C] border border-[#252830]">
              <span className="text-[10px] font-mono uppercase text-[#8A8782] block">Max Upload Size</span>
              <span className="text-xs font-semibold text-[#FAF8F5]">10 MB per file</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#14161C] border border-[#252830]">
              <span className="text-[10px] font-mono uppercase text-[#8A8782] block">Safe Formats</span>
              <span className="text-xs font-mono text-emerald-400">WebP, PNG, JPG, AVIF</span>
            </div>
          </div>

          {/* Search Bar & Folder Filters */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch">
              <form onSubmit={handleSearchSubmit} className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8782]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search assets by filename, title, alt text, or caption..."
                  className="w-full pl-10 pr-4 py-2 bg-[#14161C] border border-[#252830] rounded-xl text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C25E34]"
                />
              </form>
            </div>

            {/* Folder Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono scrollbar-none">
              <span className="text-[#8A8782] text-[11px] mr-1 hidden sm:inline">Folder:</span>
              {FOLDER_OPTIONS.map((f) => {
                const isSelected = selectedFolder === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => handleFolderSelect(f.id)}
                    className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#C25E34] text-white font-semibold shadow'
                        : 'bg-[#14161C] border border-[#252830] text-[#8A8782] hover:text-[#FAF8F5]'
                    }`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Media Grid */}
          <div className="space-y-4">
            {isLoading && (
              <div className="h-64 rounded-2xl bg-[#14161C] border border-[#252830] flex flex-col items-center justify-center gap-2 text-xs font-mono text-[#8A8782]">
                <RefreshCw className="w-5 h-5 animate-spin text-[#C25E34]" />
                <span>Loading media repository...</span>
              </div>
            )}

            {!isLoading && mediaList.length === 0 && (
              <div className="rounded-2xl bg-[#14161C] border border-[#252830] p-12 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#1B1E26] border border-[#282C38] flex items-center justify-center text-[#8A8782] mx-auto">
                  <ImageIcon className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-base text-[#FAF8F5]">
                    No media items found
                  </h3>
                  <p className="text-xs text-[#8A8782] max-w-sm mx-auto">
                    {searchQuery
                      ? `No images matched query "${searchQuery}". Try a different term or clear filters.`
                      : 'No media uploaded in this folder yet. Use the Upload Media button to add assets.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#C25E34] hover:bg-[#D46B3E] text-xs font-mono text-white cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Image</span>
                </button>
              </div>
            )}

            {!isLoading && mediaList.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {mediaList.map((media) => (
                  <div
                    key={media._id}
                    className="group bg-[#14161C] border border-[#252830] hover:border-[#383C4A] rounded-xl overflow-hidden flex flex-col justify-between transition-all shadow-sm hover:shadow-lg"
                  >
                    {/* Image Preview Carrier */}
                    <div
                      onClick={() => handleOpenDetails(media)}
                      className="relative aspect-video bg-[#0D0E11] overflow-hidden cursor-pointer"
                    >
                      <img
                        src={media.secureUrl || media.url}
                        alt={media.altText || media.title || media.filename}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />

                      {/* Top Badges */}
                      <div className="absolute top-2 left-2 flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-xs text-[9px] font-mono text-[#FAF8F5] uppercase">
                          {media.format || 'img'}
                        </span>
                        {media.provider === 'local' && (
                          <span className="px-1.5 py-0.5 rounded bg-neutral-900/80 border border-neutral-700 text-[9px] font-mono text-neutral-300">
                            Local
                          </span>
                        )}
                      </div>

                      {/* Dimensions Overlay on hover */}
                      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="px-1.5 py-0.5 rounded bg-black/80 text-[9px] font-mono text-[#FAF8F5]">
                          {media.width && media.height ? `${media.width}×${media.height}` : 'Asset'}
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <h3
                          onClick={() => handleOpenDetails(media)}
                          className="font-semibold text-xs text-[#FAF8F5] line-clamp-1 hover:text-[#C25E34] cursor-pointer transition-colors"
                          title={media.title || media.filename}
                        >
                          {media.title || media.filename}
                        </h3>

                        <div className="flex items-center justify-between text-[10px] font-mono text-[#8A8782]">
                          <span className="truncate">
                            {media.folder ? media.folder.replace('haxudio/', '') : 'misc'}
                          </span>
                          <span>{media.bytes ? `${Math.round(media.bytes / 1024)} KB` : ''}</span>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="pt-2 border-t border-[#1F222B] flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleCopyUrl(media.secureUrl || media.url, media._id)}
                            className="p-1.5 rounded hover:bg-[#20232E] text-[#8A8782] hover:text-[#FAF8F5] transition-colors cursor-pointer"
                            title="Copy image URL"
                          >
                            {copiedId === media._id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <a
                            href={media.secureUrl || media.url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded hover:bg-[#20232E] text-[#8A8782] hover:text-[#FAF8F5] transition-colors"
                            title="Open in new tab"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          <button
                            type="button"
                            onClick={() => handleOpenDetails(media)}
                            className="p-1.5 rounded hover:bg-[#20232E] text-[#8A8782] hover:text-[#FAF8F5] transition-colors cursor-pointer"
                            title="Inspect usage & edit metadata"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleInitiateDelete(media)}
                          className="p-1.5 rounded hover:bg-rose-950/60 text-[#8A8782] hover:text-rose-400 transition-colors cursor-pointer"
                          title="Delete image safely"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-[#252830] text-xs font-mono text-[#8A8782]">
                <span>
                  Showing Page {currentPage} of {totalPages} ({totalCount} total assets)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => {
                      const p = currentPage - 1;
                      setCurrentPage(p);
                      loadMedia(p, selectedFolder, searchQuery);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#14161C] border border-[#252830] hover:bg-[#1E212B] text-[#FAF8F5] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => {
                      const p = currentPage + 1;
                      setCurrentPage(p);
                      loadMedia(p, selectedFolder, searchQuery);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#14161C] border border-[#252830] hover:bg-[#1E212B] text-[#FAF8F5] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* ========================================================================= */}
        {/* DETAILS & USAGE INSPECTOR MODAL */}
        {/* ========================================================================= */}
        {activeMedia && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-[#14161C] border border-[#252830] rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-[#252830] flex items-center justify-between bg-[#111318]">
                <div className="flex items-center gap-2.5">
                  <ImageIcon className="w-5 h-5 text-[#C25E34]" />
                  <div>
                    <h3 className="font-display font-bold text-base text-[#FAF8F5] truncate max-w-md">
                      {activeMedia.title || activeMedia.filename}
                    </h3>
                    <p className="text-xs font-mono text-[#8A8782]">
                      Public ID: {activeMedia.publicId}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveMedia(null)}
                  className="p-1.5 rounded-md text-[#8A8782] hover:text-[#FAF8F5] hover:bg-[#1E212B] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                {/* Visual Preview Carrier */}
                <div className="rounded-xl border border-[#252830] overflow-hidden bg-black max-h-72 flex items-center justify-center">
                  <img
                    src={activeMedia.secureUrl || activeMedia.url}
                    alt={activeMedia.altText || ''}
                    className="max-h-72 w-auto object-contain"
                  />
                </div>

                {/* Real-time Usage Audit Callout */}
                <div className="rounded-xl border border-[#252830] bg-[#111318] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#C25E34]" />
                      <h4 className="font-semibold text-xs text-[#FAF8F5] uppercase font-mono tracking-wider">
                        CMS Usage Inspector (Real-Time)
                      </h4>
                    </div>

                    {isLoadingUsage ? (
                      <span className="text-[11px] font-mono text-[#8A8782] flex items-center gap-1">
                        <RefreshCw className="w-3 h-3 animate-spin text-[#C25E34]" />
                        Scanning CMS...
                      </span>
                    ) : usageDetails?.inUse ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-[10px] font-mono text-emerald-300">
                        In Use ({usageDetails.usageCount} location{usageDetails.usageCount > 1 ? 's' : ''})
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-700 text-[10px] font-mono text-neutral-400">
                        Unused (Safe to delete)
                      </span>
                    )}
                  </div>

                  {!isLoadingUsage && usageDetails && (
                    <div className="space-y-2">
                      {usageDetails.inUse ? (
                        <div className="space-y-1.5">
                          <p className="text-xs text-[#FAF8F5]">
                            This asset is actively displayed across the following website components:
                          </p>
                          <div className="divide-y divide-[#1E212B] rounded-lg border border-[#252830] bg-[#0D0E11] overflow-hidden text-xs">
                            {usageDetails.references.map((ref, idx) => (
                              <div key={idx} className="p-2.5 flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <span className="font-semibold text-[#FAF8F5] block">
                                    {ref.type}: {ref.title}
                                  </span>
                                  <span className="text-[11px] font-mono text-[#8A8782]">
                                    Field: {ref.field}
                                  </span>
                                </div>
                                <span className="px-2 py-0.5 rounded bg-[#1B1E26] text-[10px] font-mono text-[#A09D98]">
                                  {ref.type}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-[#8A8782]">
                          No services, projects, testimonials, team profiles, or content sections are currently referencing this image.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Metadata Editor Form */}
                <form onSubmit={handleSaveMetadata} className="space-y-4">
                  <div className="border-b border-[#252830] pb-2">
                    <h4 className="font-semibold text-xs text-[#FAF8F5] uppercase font-mono tracking-wider">
                      Edit Asset Metadata
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-[#FAF8F5]">Title</label>
                      <input
                        type="text"
                        value={metadataForm.title}
                        onChange={(e) => setMetadataForm({ ...metadataForm, title: e.target.value })}
                        className="w-full px-3 py-2 bg-[#0D0E11] border border-[#252830] rounded-lg text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C25E34]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-[#FAF8F5]">Folder Category</label>
                      <select
                        value={metadataForm.folder}
                        onChange={(e) => setMetadataForm({ ...metadataForm, folder: e.target.value })}
                        className="w-full px-3 py-2 bg-[#0D0E11] border border-[#252830] rounded-lg text-xs font-mono text-[#FAF8F5] focus:outline-none focus:border-[#C25E34]"
                      >
                        <option value="haxudio/services">haxudio/services</option>
                        <option value="haxudio/projects">haxudio/projects</option>
                        <option value="haxudio/team">haxudio/team</option>
                        <option value="haxudio/testimonials">haxudio/testimonials</option>
                        <option value="haxudio/content">haxudio/content</option>
                        <option value="haxudio/branding">haxudio/branding</option>
                        <option value="haxudio/seo">haxudio/seo</option>
                        <option value="haxudio/misc">haxudio/misc</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-[#FAF8F5]">Alt Text (SEO & Accessibility)</label>
                    <input
                      type="text"
                      value={metadataForm.altText}
                      onChange={(e) => setMetadataForm({ ...metadataForm, altText: e.target.value })}
                      placeholder="Descriptive image summary..."
                      className="w-full px-3 py-2 bg-[#0D0E11] border border-[#252830] rounded-lg text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C25E34]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-[#FAF8F5]">Caption (Optional)</label>
                    <textarea
                      rows={2}
                      value={metadataForm.caption}
                      onChange={(e) => setMetadataForm({ ...metadataForm, caption: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0D0E11] border border-[#252830] rounded-lg text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C25E34]"
                    />
                  </div>

                  {/* CDN URL */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-[#FAF8F5]">Direct Secure Asset URL</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={activeMedia.secureUrl || activeMedia.url}
                        className="flex-1 px-3 py-2 bg-[#0D0E11] border border-[#252830] rounded-lg text-xs font-mono text-[#A09D98] select-all"
                      />
                      <button
                        type="button"
                        onClick={() => handleCopyUrl(activeMedia.secureUrl || activeMedia.url, activeMedia._id)}
                        className="px-3 py-2 rounded-lg bg-[#1B1E26] hover:bg-[#282C38] text-xs font-mono text-[#FAF8F5] cursor-pointer"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleInitiateDelete(activeMedia)}
                      className="px-3.5 py-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-xs font-mono text-rose-300 transition-colors cursor-pointer"
                    >
                      Delete Asset
                    </button>

                    <button
                      type="submit"
                      disabled={isUpdatingMetadata}
                      className="px-5 py-2 rounded-lg bg-[#C25E34] hover:bg-[#D46B3E] text-xs font-mono font-semibold text-white transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isUpdatingMetadata ? 'Saving Changes...' : 'Save Metadata'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* UPLOAD MODAL */}
        {/* ========================================================================= */}
        {isUploadOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-[#14161C] border border-[#252830] rounded-2xl w-full max-w-xl flex flex-col shadow-2xl overflow-hidden my-auto">
              <div className="px-6 py-4 border-b border-[#252830] flex items-center justify-between bg-[#111318]">
                <div className="flex items-center gap-2.5">
                  <Upload className="w-5 h-5 text-[#C25E34]" />
                  <h3 className="font-display font-bold text-base text-[#FAF8F5]">
                    Upload Image to Cloudinary
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="p-1.5 rounded-md text-[#8A8782] hover:text-[#FAF8F5] hover:bg-[#1E212B] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
                {uploadError && (
                  <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* File picker */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#FAF8F5]">
                    Image File (WebP, PNG, JPEG, AVIF up to 10 MB)
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    onChange={handleFileChange}
                    className="w-full text-xs text-[#8A8782] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-mono file:bg-[#1E212B] file:text-[#FAF8F5] hover:file:bg-[#282C38] cursor-pointer"
                  />
                </div>

                {uploadPreview && (
                  <div className="rounded-xl border border-[#252830] p-2 bg-black flex items-center justify-center max-h-48 overflow-hidden">
                    <img src={uploadPreview} alt="Preview" className="max-h-48 object-contain" />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#FAF8F5]">Target Folder</label>
                  <select
                    value={uploadFolder}
                    onChange={(e) => setUploadFolder(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0D0E11] border border-[#252830] rounded-lg text-xs font-mono text-[#FAF8F5] focus:outline-none focus:border-[#C25E34]"
                  >
                    <option value="haxudio/services">haxudio/services</option>
                    <option value="haxudio/projects">haxudio/projects</option>
                    <option value="haxudio/team">haxudio/team</option>
                    <option value="haxudio/testimonials">haxudio/testimonials</option>
                    <option value="haxudio/content">haxudio/content</option>
                    <option value="haxudio/branding">haxudio/branding</option>
                    <option value="haxudio/seo">haxudio/seo</option>
                    <option value="haxudio/misc">haxudio/misc</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#FAF8F5]">Image Title</label>
                  <input
                    type="text"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="Descriptive title..."
                    className="w-full px-3 py-2 bg-[#0D0E11] border border-[#252830] rounded-lg text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C25E34]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#FAF8F5]">Alt Text</label>
                  <input
                    type="text"
                    value={uploadAltText}
                    onChange={(e) => setUploadAltText(e.target.value)}
                    placeholder="Accessibility & SEO alt text..."
                    className="w-full px-3 py-2 bg-[#0D0E11] border border-[#252830] rounded-lg text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C25E34]"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-3 border-t border-[#252830]">
                  <button
                    type="button"
                    onClick={() => setIsUploadOpen(false)}
                    className="px-4 py-2 rounded-lg bg-[#181A20] text-xs font-mono text-[#8A8782] hover:text-[#FAF8F5] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!uploadFile || isUploading}
                    className="px-5 py-2 rounded-lg bg-[#C25E34] hover:bg-[#D46B3E] text-xs font-mono font-semibold text-white cursor-pointer disabled:opacity-40 flex items-center gap-2"
                  >
                    {isUploading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload to Cloudinary</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* DELETE CONFIRMATION & REFERENCE LOCK DIALOG */}
        {/* ========================================================================= */}
        {itemToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-[#14161C] border border-[#252830] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400 shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-[#FAF8F5]">
                    Delete Media Asset
                  </h3>
                  <p className="text-xs text-[#8A8782]">
                    Verify safe deletion before removing from Cloudinary.
                  </p>
                </div>
              </div>

              {deleteError ? (
                <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 space-y-2">
                  <div className="flex items-center gap-2 text-rose-300 text-xs font-semibold">
                    <Lock className="w-4 h-4 shrink-0" />
                    <span>Deletion Blocked — Asset is In Use</span>
                  </div>
                  <p className="text-xs text-rose-200/90 leading-relaxed">
                    {deleteError.message}
                  </p>
                  {deleteError.references && deleteError.references.length > 0 && (
                    <div className="pt-1 space-y-1">
                      <span className="text-[10px] font-mono uppercase text-rose-400 block">
                        Referenced in:
                      </span>
                      <ul className="text-xs font-mono text-rose-200 list-disc list-inside space-y-0.5">
                        {deleteError.references.map((r, i) => (
                          <li key={i}>
                            {r.type}: {r.title} ({r.field})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-[#A09D98] leading-relaxed">
                    Are you sure you want to permanently delete{' '}
                    <span className="font-semibold text-[#FAF8F5]">
                      "{itemToDelete.title || itemToDelete.filename}"
                    </span>
                    ?
                  </p>
                  <p className="text-[11px] text-[#8A8782]">
                    If this asset is currently referenced by any live service, project, testimonial, or content section, the server will block deletion to prevent broken images.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setItemToDelete(null);
                    setDeleteError(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-[#181A20] text-xs font-mono text-[#8A8782] hover:text-[#FAF8F5] cursor-pointer"
                >
                  {deleteError ? 'Close' : 'Cancel'}
                </button>

                {!deleteError && (
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={handleConfirmDelete}
                    className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-xs font-mono font-semibold text-white cursor-pointer disabled:opacity-50"
                  >
                    {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
