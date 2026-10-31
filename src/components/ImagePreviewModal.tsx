import React, { useState } from 'react';
import { X, Download, Copy, Check, ZoomIn, ZoomOut, RotateCcw, FileText, Share2 } from 'lucide-react';

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageDataUrl: string | null;
  buildingName: string;
  monthLabel: string;
  onDownloadPDF?: () => void;
  onCopyClipboard?: () => void;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  isOpen,
  onClose,
  imageDataUrl,
  buildingName,
  monthLabel,
  onDownloadPDF,
  onCopyClipboard
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  if (!isOpen || !imageDataUrl) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.download = `รายงานรูปภาพ_${buildingName}_${monthLabel}.png`;
    link.href = imageDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = async () => {
    try {
      const res = await fetch(imageDataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
      if (onCopyClipboard) onCopyClipboard();
    } catch (err) {
      // Fallback
      handleDownload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex flex-col justify-between p-2 sm:p-4 no-print animate-fadeIn">
      
      {/* Top Floating Control Bar */}
      <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl px-4 py-3 text-white max-w-4xl w-full mx-auto flex flex-wrap items-center justify-between gap-3 shadow-2xl backdrop-blur-md">
        
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
          <div>
            <h3 className="text-sm font-bold tracking-wide">
              ตัวอย่างรูปภาพรายงาน: หอพัก{buildingName} ({monthLabel})
            </h3>
            <p className="text-[11px] text-slate-400">
              ความละเอียดสูง (PNG) เหมาะสำหรับส่งเข้าแชท Line หรือสั่งพิมพ์
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Zoom controls */}
          <div className="flex bg-slate-800 rounded-xl p-0.5 border border-slate-700">
            <button
              onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.2))}
              className="p-1.5 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="ย่อขนาด"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono px-2 py-1 text-slate-300 self-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel(prev => Math.min(2.5, prev + 0.2))}
              className="p-1.5 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="ขยายขนาด"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1.5 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="ขนาด 100%"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Copy Image Button */}
          <button
            onClick={handleCopy}
            className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-3 py-1.5 rounded-xl text-xs flex items-center space-x-1.5 border border-slate-700 transition-all cursor-pointer"
            title="คัดลอกรูปภาพลง Clipboard"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{isCopied ? 'คัดลอกแล้ว!' : 'คัดลอกรูปภาพ'}</span>
          </button>

          {/* Download PNG Button */}
          <button
            onClick={handleDownload}
            className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center space-x-1.5 shadow-md transition-all cursor-pointer"
            title="ดาวน์โหลดไฟล์ .PNG"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ดาวน์โหลดรูปภาพ (.PNG)</span>
          </button>

          {/* PDF Download shortcut */}
          {onDownloadPDF && (
            <button
              onClick={onDownloadPDF}
              className="bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-semibold px-3 py-1.5 rounded-xl text-xs flex items-center space-x-1.5 shadow-md transition-all cursor-pointer"
              title="ดาวน์โหลดในรูปแบบ PDF A4"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>ดาวน์โหลด PDF</span>
            </button>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-xl transition-colors cursor-pointer"
            title="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>

        </div>

      </div>

      {/* Main Image Preview Scrollable Viewport */}
      <div className="flex-grow flex items-center justify-center overflow-auto p-4 my-2">
        <div
          className="transition-transform duration-200 shadow-2xl rounded-xl overflow-hidden bg-white max-w-full"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
        >
          <img
            src={imageDataUrl}
            alt={`รายงานมิเตอร์ ${buildingName}`}
            className="block max-w-full h-auto object-contain mx-auto border border-slate-300"
          />
        </div>
      </div>

      {/* Bottom Hint Bar */}
      <div className="max-w-md mx-auto text-center text-slate-400 text-xs py-1">
        💡 สามารถคลิกขวาที่รูปภาพเพื่อ <b>"คัดลอกรูปภาพ"</b> หรือ <b>"บันทึกรูปภาพเป็น..."</b> ได้โดยตรง
      </div>

    </div>
  );
};
