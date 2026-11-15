import React, { useState } from 'react';
import { Image as ImageIcon, Upload, X, ExternalLink, Check } from 'lucide-react';
import MediaSelectorModal from './MediaSelectorModal';

export default function ImageFieldPicker({
  label = 'Image Asset',
  value = '',
  onChange,
  altValue = '',
  onAltChange,
  defaultFolder = 'haxudio/misc',
  showAltInput = true,
  helperText = '',
  placeholder = '/src/assets/... or https://...',
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDefaultTab, setModalDefaultTab] = useState('library');

  const handleOpenLibrary = () => {
    setModalDefaultTab('library');
    setIsModalOpen(true);
  };

  const handleOpenUpload = () => {
    setModalDefaultTab('upload');
    setIsModalOpen(true);
  };

  const handleSelectMedia = (media) => {
    if (onChange) {
      onChange(media.secureUrl || media.url);
    }
    if (onAltChange && media.altText && !altValue) {
      onAltChange(media.altText);
    }
  };

  const handleClear = () => {
    if (onChange) onChange('');
    if (onAltChange) onAltChange('');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-medium text-[#FAF8F5]">
          {label}
        </label>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleOpenLibrary}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#1C1F28] hover:bg-[#252A36] border border-[#2B303E] text-[11px] font-mono text-[#FAF8F5] transition-colors cursor-pointer"
          >
            <ImageIcon className="w-3 h-3 text-[#C25E34]" />
            <span>Choose from Media</span>
          </button>
          <button
            type="button"
            onClick={handleOpenUpload}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#C25E34]/20 hover:bg-[#C25E34]/30 border border-[#C25E34]/50 text-[11px] font-mono text-[#C25E34] transition-colors cursor-pointer"
          >
            <Upload className="w-3 h-3" />
            <span>Upload</span>
          </button>
        </div>
      </div>

      {/* Preview Carrier & URL input */}
      <div className="flex flex-col sm:flex-row gap-3 items-start">
        {/* Thumbnail Preview */}
        {value ? (
          <div className="relative group shrink-0 w-24 h-16 rounded-lg overflow-hidden border border-[#252830] bg-[#0D0E11]">
            <img
              src={value}
              alt={altValue || 'Thumbnail preview'}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <button
              type="button"
              onClick={handleClear}
              className="absolute top-1 right-1 p-1 rounded bg-black/80 hover:bg-rose-900/90 text-white transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
              title="Remove image"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div
            onClick={handleOpenLibrary}
            className="shrink-0 w-24 h-16 rounded-lg border border-dashed border-[#2D313D] hover:border-[#C25E34] bg-[#0D0E11] flex flex-col items-center justify-center text-[#8A8782] hover:text-[#FAF8F5] cursor-pointer transition-colors"
            title="Click to select image"
          >
            <ImageIcon className="w-4 h-4 text-[#8A8782]" />
            <span className="text-[9px] font-mono mt-0.5">No image</span>
          </div>
        )}

        {/* Input box */}
        <div className="flex-1 w-full space-y-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange && onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-3 py-2 bg-[#0D0E11] border border-[#252830] rounded-lg text-xs font-mono text-[#FAF8F5] focus:outline-none focus:border-[#C25E34]"
          />

          {showAltInput && (
            <input
              type="text"
              value={altValue}
              onChange={(e) => onAltChange && onAltChange(e.target.value)}
              placeholder="Descriptive alt text for SEO & accessibility..."
              className="w-full px-3 py-1.5 bg-[#0D0E11] border border-[#252830] rounded-lg text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C25E34]"
            />
          )}

          {helperText && (
            <p className="text-[10px] text-[#8A8782] font-mono">{helperText}</p>
          )}
        </div>
      </div>

      {/* Modal */}
      <MediaSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleSelectMedia}
        currentValue={value}
        defaultFolder={defaultFolder}
        initialTab={modalDefaultTab}
        title={`Select ${label}`}
      />
    </div>
  );
}
