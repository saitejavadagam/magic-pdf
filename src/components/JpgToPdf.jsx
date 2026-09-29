import { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { Trash2, FileDown, Plus, MoveLeft, MoveRight, Loader2 } from 'lucide-react';

export default function JpgToPdf({ initialFiles, onReset }) {
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [orientation, setOrientation] = useState('portrait');
  const [pageSize, setPageSize] = useState('a4');
  const [margin, setMargin] = useState('none');
  const [isProcessing, setIsProcessing] = useState(false);

  // Helper to safely read File objects into Data URLs
  const fileToDataUrl = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Convert incoming initial files to Data URL previews on mount
  useEffect(() => {
    const processInitialFiles = async () => {
      setIsLoading(true);
      try {
        const processed = await Promise.all(
          initialFiles.map(async (file) => {
            const dataUrl = await fileToDataUrl(file);
            return {
              id: Math.random().toString(36).substring(2, 9),
              file,
              previewUrl: dataUrl,
              name: file.name,
            };
          })
        );
        setImages(processed);
      } catch (err) {
        console.error('Error reading files:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (initialFiles && initialFiles.length > 0) {
      processInitialFiles();
    }
  }, [initialFiles]);

  // Add more image files
  const handleAddMore = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const processed = await Promise.all(
        newFiles.map(async (file) => {
          const dataUrl = await fileToDataUrl(file);
          return {
            id: Math.random().toString(36).substring(2, 9),
            file,
            previewUrl: dataUrl,
            name: file.name,
          };
        })
      );
      setImages((prev) => [...prev, ...processed]);
    }
  };

  // Remove individual image
  const handleRemove = (id) => {
    setImages((prev) => {
      const filtered = prev.filter((img) => img.id !== id);
      if (filtered.length === 0) onReset();
      return filtered;
    });
  };

  // Move image order
  const handleMove = (index, direction) => {
    const newImages = [...images];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newImages.length) return;
    const temp = newImages[index];
    newImages[index] = newImages[targetIndex];
    newImages[targetIndex] = temp;
    setImages(newImages);
  };

  // Measure image dimensions from Data URL
  const loadImageDimensions = (dataUrl) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ element: img, width: img.width, height: img.height });
      img.onerror = reject;
      img.src = dataUrl;
    });
  };

  // Generate and download PDF
  const handleGeneratePdf = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);

    try {
      const doc = new jsPDF({
        orientation: orientation,
        unit: 'mm',
        format: pageSize === 'fit' ? 'a4' : pageSize,
      });

      const marginValues = { none: 0, small: 10, big: 20 };
      const currentMargin = marginValues[margin];

      for (let i = 0; i < images.length; i++) {
        if (i > 0) doc.addPage();

        const imgData = await loadImageDimensions(images[i].previewUrl);

        let pdfWidth = doc.internal.pageSize.getWidth();
        let pdfHeight = doc.internal.pageSize.getHeight();

        if (pageSize === 'fit') {
          const imgAspect = imgData.width / imgData.height;
          pdfWidth = 210;
          pdfHeight = pdfWidth / imgAspect;
          doc.setPage(i + 1);
        }

        const printableWidth = pdfWidth - currentMargin * 2;
        const printableHeight = pdfHeight - currentMargin * 2;

        const imgRatio = imgData.width / imgData.height;
        let renderWidth = printableWidth;
        let renderHeight = printableWidth / imgRatio;

        if (renderHeight > printableHeight) {
          renderHeight = printableHeight;
          renderWidth = printableHeight * imgRatio;
        }

        const x = currentMargin + (printableWidth - renderWidth) / 2;
        const y = currentMargin + (printableHeight - renderHeight) / 2;

        const format = images[i].file.type.includes('png') ? 'PNG' : 'JPEG';

        doc.addImage(images[i].previewUrl, format, x, y, renderWidth, renderHeight);
      }

      doc.save('magicpdf-converted.pdf');
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('An error occurred while generating the PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-16 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
        <p className="text-slate-300 text-sm">Loading image previews...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/50">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">
            {images.length} Image{images.length > 1 ? 's' : ''} Selected
          </h2>
          <p className="text-xs text-slate-400">Reorder images or customize page layout settings below</p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium rounded-xl cursor-pointer transition-all">
            <Plus className="w-4 h-4" /> Add More
            <input type="file" accept="image/jpeg, image/png, image/webp" multiple onChange={handleAddMore} className="hidden" />
          </label>

          <button
            onClick={onReset}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs rounded-xl transition-all"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-800/40 p-4 rounded-2xl border border-slate-800">
        <div>
          <label className="text-xs font-medium text-slate-400 block mb-1.5">Page Orientation</label>
          <select
            value={orientation}
            onChange={(e) => setOrientation(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-xl p-2.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="portrait">Portrait</option>
            <option value="landscape">Landscape</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-400 block mb-1.5">Page Size</label>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-xl p-2.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="a4">A4 (Standard)</option>
            <option value="letter">US Letter</option>
            <option value="fit">Auto-Fit to Image</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-400 block mb-1.5">Margins</label>
          <select
            value={margin}
            onChange={(e) => setMargin(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-xl p-2.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="none">No Margin</option>
            <option value="small">Small Margin</option>
            <option value="big">Big Margin</option>
          </select>
        </div>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto pr-1">
        {images.map((img, index) => (
          <div key={img.id} className="group relative bg-slate-800/80 rounded-xl border border-slate-700/60 p-2 flex flex-col items-center">
            <div className="relative w-full aspect-[3/4] bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center">
              <img src={img.previewUrl} alt={img.name} className="max-w-full max-h-full object-contain" />
              <span className="absolute top-2 left-2 px-2 py-0.5 bg-slate-900/80 backdrop-blur-md text-xs font-bold text-slate-300 rounded-md border border-slate-700">
                {index + 1}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 truncate w-full mt-2 text-center">{img.name}</p>

            <div className="flex items-center gap-1 mt-2">
              <button
                disabled={index === 0}
                onClick={() => handleMove(index, 'left')}
                className="p-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 text-slate-200 rounded-lg transition-all"
                title="Move Left"
              >
                <MoveLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleRemove(img.id)}
                className="p-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all"
                title="Remove"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                disabled={index === images.length - 1}
                onClick={() => handleMove(index, 'right')}
                className="p-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 text-slate-200 rounded-lg transition-all"
                title="Move Right"
              >
                <MoveRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Convert & Download Button */}
      <button
        onClick={handleGeneratePdf}
        disabled={isProcessing || images.length === 0}
        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white font-semibold text-base rounded-2xl shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all"
      >
        <FileDown className="w-5 h-5" />
        {isProcessing ? 'Converting to PDF...' : 'Convert to PDF & Download'}
      </button>
    </div>
  );
}