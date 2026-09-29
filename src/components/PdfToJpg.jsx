import { useState, useEffect } from 'react';
import { pdfjsLib } from '../utils/pdfWorker';
import JSZip from 'jszip';
import { Download, Archive, Loader2 } from 'lucide-react';

const PdfToJpg = ({ file, onReset }) => {
  const [pages, setPages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [quality, setQuality] = useState('2');
  const [isZipping, setIsZipping] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const extractPdfPages = async () => {
      setIsLoading(true);
      setLoadingProgress(0);
      setPages([]);

      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const totalPages = pdf.numPages;
        const extractedPages = [];

        const scale = parseFloat(quality);
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        for (let i = 1; i <= totalPages; i++) {
          if (!isMounted) break;

          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale });

          canvas.width = viewport.width;
          canvas.height = viewport.height;

          // Fill white background to avoid black background on JPG export
          context.fillStyle = '#ffffff';
          context.fillRect(0, 0, canvas.width, canvas.height);

          await page.render({
            canvasContext: context,
            viewport: viewport,
          }).promise;

          const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
          extractedPages.push({ pageNum: i, dataUrl });

          if (isMounted) {
            setLoadingProgress(Math.round((i / totalPages) * 100));
          }
        }

        if (isMounted) setPages(extractedPages);
      } catch (err) {
        console.error('Error extracting PDF pages:', err);
        if (isMounted) alert('Failed to process PDF file. Please try another file.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    extractPdfPages();

    return () => {
      isMounted = false; // Prevent state updates if component unmounts mid-render
    };
  }, [file, quality]);

  const downloadSinglePage = (pageNum, dataUrl) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${file.name.replace(/\.pdf$/i, '')}_page_${pageNum}.jpg`;
    link.click();
  };

  const downloadAllAsZip = async () => {
    if (pages.length === 0) return;
    setIsZipping(true);

    try {
      const zip = new JSZip();
      const baseName = file.name.replace(/\.pdf$/i, '');

      pages.forEach(({ pageNum, dataUrl }) => {
        const base64Data = dataUrl.replace(/^data:image\/jpeg;base64,/, '');
        zip.file(`${baseName}_page_${pageNum}.jpg`, base64Data, { base64: true });
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipUrl = URL.createObjectURL(zipBlob);

      const link = document.createElement('a');
      link.href = zipUrl;
      link.download = `${baseName}_jpg_images.zip`;
      link.click();

      setTimeout(() => URL.revokeObjectURL(zipUrl), 1000);
    } catch (err) {
      console.error('Failed to create ZIP file:', err);
      alert('Could not bundle images into ZIP.');
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/50">
        <div>
          <h2 className="text-lg font-semibold text-slate-100 truncate max-w-xs md:max-w-md">{file.name}</h2>
          <p className="text-xs text-slate-400">
            {isLoading ? `Rendering Pages (${loadingProgress}%)` : `${pages.length} Page(s) Extracted`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400 font-medium hidden sm:inline">Image Quality:</label>
            <select
              value={quality}
              disabled={isLoading}
              onChange={(e) => setQuality(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl p-2 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
            >
              <option value="0.9">Low Quality (65 DPI - Fast)</option>
              <option value="1">Standard (72 DPI)</option>
              <option value="2">High Quality (144 DPI)</option>
              <option value="3">Ultra HD (216 DPI)</option>
            </select>
          </div>

          <button
            onClick={onReset}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs rounded-xl transition-all"
          >
            Change File
          </button>
        </div>
      </div>

      {/* Pages Preview Grid or Loading State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-slate-800/40 rounded-2xl border border-slate-800 space-y-4">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-sm text-slate-300">Processing pages... {loadingProgress}%</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-96 overflow-y-auto pr-1">
            {pages.map(({ pageNum, dataUrl }) => (
              <div key={pageNum} className="group relative bg-slate-800/80 rounded-xl border border-slate-700/60 p-2 flex flex-col items-center">
                <div className="relative w-full aspect-[3/4] bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center">
                  <img src={dataUrl} alt={`Page ${pageNum}`} className="max-w-full max-h-full object-contain" />
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-slate-900/80 backdrop-blur-md text-xs font-bold text-slate-300 rounded-md border border-slate-700">
                    Page {pageNum}
                  </span>
                </div>

                <button
                  onClick={() => downloadSinglePage(pageNum, dataUrl)}
                  className="mt-2 w-full py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs rounded-lg flex items-center justify-center gap-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5" /> Download JPG
                </button>
              </div>
            ))}
          </div>

          {/* ZIP Download Action */}
          <button
            onClick={downloadAllAsZip}
            disabled={isZipping || pages.length === 0}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white font-semibold text-base rounded-2xl shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all"
          >
            {isZipping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Archive className="w-5 h-5" />}
            {isZipping ? 'Bundling Images into ZIP...' : 'Download All Pages (ZIP)'}
          </button>
        </>
      )}
    </div>
  );
};

export default PdfToJpg;