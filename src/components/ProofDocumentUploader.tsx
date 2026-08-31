import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileImage,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Eye,
  Link as LinkIcon,
  RefreshCw,
  FileText,
  AlertCircle,
  Maximize2,
  X
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface ProofDocumentUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
  disabled?: boolean;
  required?: boolean;
}

/**
 * Utility to compress an image file to a reasonable base64 data URL
 * Ensures high readability of document text while keeping payload size small.
 */
async function compressImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    // If it's a PDF or non-image file, read as standard data URL
    if (!file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
      return;
    }

    const img = new Image();
    const reader = new FileReader();

    reader.onload = e => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      const MAX_DIMENSION = 1600;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_DIMENSION) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        }
      } else {
        if (height > MAX_DIMENSION) {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        // Fallback to raw reader output
        resolve(reader.result as string);
        return;
      }

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      // Export as high-quality JPEG
      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
      resolve(compressedDataUrl);
    };

    img.onerror = () => {
      // Fallback
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
    };

    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}

export const ProofDocumentUploader: React.FC<ProofDocumentUploaderProps> = ({
  value,
  onChange,
  label,
  hint,
  disabled = false,
  required = false,
}) => {
  const { isRtl } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const isBase64 = value?.startsWith('data:');
  const hasValue = Boolean(value && value.trim().length > 0);

  const handleFileProcess = async (file: File) => {
    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type) && !file.type.startsWith('image/')) {
      setErrorMessage(
        isRtl
          ? 'نوع الملف غير مدعوم. يرجى رفع صورة (JPG, PNG, WEBP) أو ملف PDF.'
          : 'Unsupported file type. Please upload an image (JPG, PNG, WEBP) or PDF.'
      );
      return;
    }

    // Validate size (max 15MB before compression)
    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage(
        isRtl
          ? 'حجم الملف كبير جداً (الحد الأقصى 15 ميجابايت).'
          : 'File size is too large (max 15MB).'
      );
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMessage(null);
      const dataUrl = await compressImageFile(file);
      onChange(dataUrl);
    } catch (err: any) {
      setErrorMessage(
        isRtl
          ? 'حدث خطأ أثناء معالجة الصورة. يرجى المحاولة مرة أخرى.'
          : 'Error processing image. Please try again.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
    // reset input value so re-uploading same file triggers change
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleApplyUrl = () => {
    if (!customUrl.trim()) return;
    onChange(customUrl.trim());
    setShowUrlInput(false);
    setCustomUrl('');
  };

  const handleClear = () => {
    onChange('');
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full space-y-2">
      {/* Hidden native file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        disabled={disabled}
        onChange={onFileInputChange}
      />

      {/* Label and Actions */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
          {label || (isRtl ? 'صورة ترخيص الإرشاد / كارنيه النقابة (Proof Document)' : 'Tourism License / Guide ID Card')}
          {required && <span className="text-red-500 mr-1">*</span>}
        </label>

        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-400 flex items-center gap-1 hover:underline transition-colors"
        >
          <LinkIcon className="h-3 w-3" />
          <span>{showUrlInput ? (isRtl ? 'إخفاء الرابط المباشر' : 'Hide direct URL') : (isRtl ? 'إدخال رابط ويب مباشر' : 'Enter direct URL')}</span>
        </button>
      </div>

      {/* Optional URL Input Dropdown */}
      {showUrlInput && (
        <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
          <div className="flex gap-2">
            <input
              type="url"
              value={customUrl}
              onChange={e => setCustomUrl(e.target.value)}
              placeholder="https://example.com/license-photo.jpg"
              className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:border-amber-500 focus:outline-hidden"
            />
            <button
              type="button"
              onClick={handleApplyUrl}
              disabled={!customUrl.trim()}
              className="rounded-lg bg-amber-500 hover:bg-amber-400 px-3 py-1.5 text-xs font-bold text-slate-950 disabled:opacity-50"
            >
              {isRtl ? 'تطبيق' : 'Apply'}
            </button>
          </div>
          <p className="text-[10px] text-slate-400">
            {isRtl ? 'يمكنك استخدام رابط صورة من Google Drive أو Dropbox أو أي رابط سحابي مباشر.' : 'You can paste a direct public image link.'}
          </p>
        </div>
      )}

      {/* Uploader / Preview Container */}
      {!hasValue ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && !isProcessing && fileInputRef.current?.click()}
          className={`relative group cursor-pointer rounded-2xl border-2 border-dashed p-5 transition-all text-center ${
            isDragging
              ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20'
              : 'border-slate-300 hover:border-amber-400 bg-slate-50/60 hover:bg-amber-50/30 dark:border-slate-700 dark:bg-slate-900/50 dark:hover:border-amber-500/60'
          } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center py-4 space-y-2">
              <RefreshCw className="h-8 w-8 text-amber-500 animate-spin" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {isRtl ? 'جاري قراءة ومعالجة صورة المستند...' : 'Processing document image...'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-2.5">
              <div className="h-12 w-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <UploadCloud className="h-6 w-6" />
              </div>

              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {isRtl ? 'اضغط لرفع صورة الكارنيه / الترخيص من جهازك' : 'Click or Drag & Drop to upload Guide License'}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {isRtl ? 'أو اسحب الصورة وأفلتها هنا (JPG, PNG, WEBP)' : 'Supports JPG, PNG, WEBP & PDF'}
                </p>
              </div>

              <div className="inline-flex items-center gap-1.5 rounded-full bg-white dark:bg-slate-800 px-3 py-1 text-[10px] font-semibold text-slate-600 dark:text-slate-300 shadow-2xs border border-slate-200 dark:border-slate-700">
                <FileImage className="h-3 w-3 text-amber-500" />
                <span>{isRtl ? 'يدعم كاميرا الهاتف والماسح الضوئي' : 'Mobile camera & scanner ready'}</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Image Preview Box */
        <div className="relative rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 shadow-2xs overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Thumbnail */}
            <div
              onClick={() => setShowPreviewModal(true)}
              className="relative group/thumb cursor-pointer h-20 w-28 shrink-0 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center"
            >
              {isBase64 || value.match(/\.(jpeg|jpg|png|webp|gif|svg)$/i) ? (
                <img
                  src={value}
                  alt="License Proof"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover group-hover/thumb:scale-105 transition-transform"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-2 text-slate-500">
                  <FileText className="h-6 w-6 text-amber-500 mb-1" />
                  <span className="text-[9px] font-mono truncate max-w-[80px]">مستند</span>
                </div>
              )}

              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Maximize2 className="h-4 w-4" />
              </div>
            </div>

            {/* Info and Status */}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span className="text-xs font-black">
                  {isRtl ? 'تم إرفاق صورة المستند بنجاح' : 'Proof Document Attached'}
                </span>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {isBase64
                  ? isRtl
                    ? 'صورة مرفوعة محلياً من الجهاز (مشفرة ومحفوظة)'
                    : 'Uploaded local file (Encrypted Base64)'
                  : value}
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(true)}
                  className="inline-flex items-center gap-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-200 transition-colors"
                >
                  <Eye className="h-3 w-3 text-amber-500" />
                  <span>{isRtl ? 'معاينة وتكبير' : 'Preview'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled}
                  className="inline-flex items-center gap-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-200 transition-colors"
                >
                  <RefreshCw className="h-3 w-3 text-blue-500" />
                  <span>{isRtl ? 'تغيير الصورة' : 'Replace'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleClear}
                  disabled={disabled}
                  className="inline-flex items-center gap-1 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 px-2.5 py-1 text-[11px] font-bold text-red-600 dark:text-red-400 transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>{isRtl ? 'إزالة' : 'Remove'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {errorMessage && (
        <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 text-xs">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Security Hint */}
      <p className="text-[10px] text-slate-400 leading-relaxed">
        {hint ||
          (isRtl
            ? 'ملاحظة أمنية: صورة الترخيص تُستخدم حصرياً للتدقيق الإداري من قِبل إدارة TOURVIA ولا يتم نشرها للعامة مطلقاً.'
            : 'Security Notice: This document is used solely for administrative verification by TOURVIA team and is never made public.')}
      </p>

      {/* Full Preview Lightbox Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileImage className="h-5 w-5 text-amber-500" />
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  {isRtl ? 'معاينة مستند ترخيص الإرشاد السياحي' : 'Guide License Document Preview'}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[65vh] overflow-auto rounded-2xl bg-slate-950 flex items-center justify-center p-2">
              {isBase64 || value.match(/\.(jpeg|jpg|png|webp|gif|svg)$/i) ? (
                <img
                  src={value}
                  alt="Full License Proof"
                  referrerPolicy="no-referrer"
                  className="max-h-[60vh] w-auto max-w-full object-contain rounded-lg"
                />
              ) : (
                <iframe
                  src={value}
                  title="Document Preview"
                  className="w-full h-96 rounded-lg bg-white"
                />
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-500">
                {isRtl ? 'وثيقة رسمية مخصصة للتحقق المهني' : 'Official Verification Document'}
              </span>
              <div className="flex items-center gap-2">
                {!isBase64 && (
                  <a
                    href={value}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>{isRtl ? 'فتح في نافذة جديدة' : 'Open in new tab'}</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-1.5 text-xs font-bold text-slate-950"
                >
                  {isRtl ? 'إغلاق' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
