import { useState, useEffect, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Trash2, FileDown, Plus, MoveLeft, MoveRight } from 'lucide-react';

export default function JpgToPdf({ initialFiles, onReset }) {
  const [images, setImages] = useState([]);
  const [orientation, setOrientation] = useState('portrait');
  const [pageSize, setPageSize] = useState('a4');
  const [margin, setMargin] = useState('none');
  const [isProcessing, setIsProcessing] = useState(false);

  // 1. Silently track the latest images for the unmount cleanup
  const imagesRef = useRef(images);
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  // 2. Initialize files inside useEffect (Fixes Strict Mode broken images & ESLint warnings)
  useEffect(() => {
    if (initialFiles && initialFiles.length > 0) {
      const processed = initialFiles.map((file) => ({
        id: Math.random().toString(36).substring(2, 9),
        file,
        previewUrl: URL.createObjectURL(file),
        name: file.name,
      }));
      setImages(processed);
    }
  }, [initialFiles]);

  // 3. Clean up memory ONLY when the component permanently unmounts
  useEffect(() => {
    return () => {
      imagesRef.current.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    };
  }, []);

  // Add more image files
  const handleAddMore = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const processed = newFiles.map((file) => ({
        id: Math.random().toString(36).substring(2, 9),
        file,
        previewUrl: URL.createObjectURL(file),
        name: file.name,
      }));
      setImages((prev) => [...prev, ...processed]);
    }
  };

  // Remove individual image and free memory
  const handleRemove = (id) => {
    setImages((prev) => {
      const imageToRemove = prev.find((img) => img.id === id);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.previewUrl); // Free up RAM
      }

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

  // Generate and download PDF
  const handleGeneratePdf = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);

    try {
      const pdfDoc = await PDFDocument.create();

      const A4_WIDTH = 595.28;
      const A4_HEIGHT = 841.89;
      const LETTER_WIDTH = 612;
      const LETTER_HEIGHT = 792;

      const marginMap = { none: 0, small: 28.35, big: 56.70 };
      const currentMargin = marginMap[margin];

      for (let i = 0; i < images.length; i++) {
        const imgObj = images[i];
        const fileBytes = await imgObj.file.arrayBuffer();

        let pdfImage;
        if (imgObj.file.type === 'image/jpeg' || imgObj.file.type === 'image/jpg') {
          pdfImage = await pdfDoc.embedJpg(fileBytes);
        } else if (imgObj.file.type === 'image/png') {
          pdfImage = await pdfDoc.embedPng(fileBytes);
        } else {
          console.warn(`Skipping unsupported format: ${imgObj.file.type}`);
          continue;
        }

        const imgWidth = pdfImage.width;
        const imgHeight = pdfImage.height;
        const imgRatio = imgWidth / imgHeight;

        let pageW, pageH;

        if (pageSize === 'fit') {
          pageW = imgWidth + (currentMargin * 2);
          pageH = imgHeight + (currentMargin * 2);
        } else {
          const isPortrait = orientation === 'portrait';
          const stdW = pageSize === 'a4' ? A4_WIDTH : LETTER_WIDTH;
          const stdH = pageSize === 'a4' ? A4_HEIGHT : LETTER_HEIGHT;

          pageW = isPortrait ? stdW : stdH;
          pageH = isPortrait ? stdH : stdW;
        }

        const page = pdfDoc.addPage([pageW, pageH]);

        const printableWidth = pageW - (currentMargin * 2);
        const printableHeight = pageH - (currentMargin * 2);

        let renderWidth = printableWidth;
        let renderHeight = printableWidth / imgRatio;

        if (renderHeight > printableHeight) {
          renderHeight = printableHeight;
          renderWidth = printableHeight * imgRatio;
        }

        const x = currentMargin + (printableWidth - renderWidth) / 2;
        const y = currentMargin + (printableHeight - renderHeight) / 2;

        page.drawImage(pdfImage, {
          x: x,
          y: pageH - y - renderHeight,
          width: renderWidth,
          height: renderHeight,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = 'magicpdf-converted.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('An error occurred. Ensure your images are standard JPG or PNG files.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-100 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/50">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            {images.length} Image{images.length > 1 ? 's' : ''} Selected
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Reorder images or customize page layout settings below</p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-xl cursor-pointer transition-all">
            <Plus className="w-4 h-4" /> Add More
            <input type="file" accept="image/jpeg, image/png, image/webp" multiple onChange={handleAddMore} className="hidden" />
          </label>

          <button
            onClick={onReset}
            className="px-3 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 text-xs rounded-xl transition-all"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div>
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1.5">Page Orientation</label>
          <select
            value={orientation}
            onChange={(e) => setOrientation(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm rounded-xl p-2.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="portrait">Portrait</option>
            <option value="landscape">Landscape</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1.5">Page Size</label>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm rounded-xl p-2.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="a4">A4 (Standard)</option>
            <option value="letter">US Letter</option>
            <option value="fit">Auto-Fit to Image</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1.5">Margins</label>
          <select
            value={margin}
            onChange={(e) => setMargin(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm rounded-xl p-2.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="none">No Margin</option>
            <option value="small">Small Margin</option>
            <option value="big">Big Margin</option>
          </select>
        </div>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-100 overflow-y-auto pr-1">
        {images.map((img, index) => (
          <div key={img.id} className="group relative bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 p-2 flex flex-col items-center">
            <div className="relative w-full aspect-3/4 bg-slate-200 dark:bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center">
              <img src={img.previewUrl} alt={img.name} className="max-w-full max-h-full object-contain" />
              <span className="absolute top-2 left-2 px-2 py-0.5 bg-white/90 dark:bg-slate-900/80 backdrop-blur-md text-xs font-bold text-slate-700 dark:text-slate-300 rounded-md border border-slate-300 dark:border-slate-700">
                {index + 1}
              </span>
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate w-full mt-2 text-center">{img.name}</p>

            <div className="flex items-center gap-1 mt-2">
              <button
                disabled={index === 0}
                onClick={() => handleMove(index, 'left')}
                className="p-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-30 text-slate-700 dark:text-slate-200 rounded-lg transition-all"
                title="Move Left"
              >
                <MoveLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleRemove(img.id)}
                className="p-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-500 dark:text-red-400 rounded-lg transition-all"
                title="Remove"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                disabled={index === images.length - 1}
                onClick={() => handleMove(index, 'right')}
                className="p-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-30 text-slate-700 dark:text-slate-200 rounded-lg transition-all"
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
        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-semibold text-base rounded-2xl shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all"
      >
        <FileDown className="w-5 h-5" />
        {isProcessing ? 'Converting to PDF...' : 'Convert to PDF & Download'}
      </button>
    </div>
  );
}