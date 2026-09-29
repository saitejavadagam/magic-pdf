import { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import { pdfjsLib } from '../utils/pdfWorker'
import { Minimize2, Download, RefreshCw, CheckCircle2 } from 'lucide-react'


const CompressPdf = ({ file, onReset }) => {

    const [compressionLevel, setCompressionLevel] = useState('recommended')
    const [isCompressing, setIsCompressing] = useState(false)
    const [compressedResult, setCompressedResult] = useState(null)

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;

        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    const presets = {
        extreme: { scale: 1.0, quality: 0.4, label: 'Extreme compression', desc: 'Less quality, smallest file size' },
        recommended: { scale: 1.25, quality: 0.65, label: 'Recommended compression', desc: 'Good quality, high compression' },
        low: { scale: 1.5, quality: 0.85, label: 'Low Compression', desc: 'High quality, less compression' },
    }

    const handleCompress = async () => {
        setIsCompressing(true);
        setCompressedResult(null);

        try {

            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const totalPages = pdf.numPages;

            const newPdfDoc = await PDFDocument.create();
            const preset = presets[compressionLevel];

            for (let i = 1; i <= totalPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: preset.scale });

                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = viewport.width;
                canvas.height = viewport.height;

                await page.render({
                    canvasContext: context,
                    viewport: viewport,
                }).promise;

                const jpegDataUrl = canvas.toDataURL('image/jpeg', preset.quality);
                const jpegBytes = await fetch(jpegDataUrl).then((res) => res.arrayBuffer());

                const embeddedImage = await newPdfDoc.embedJpg(jpegBytes);
                const newPage = newPdfDoc.addPage([embeddedImage.width, embeddedImage.height]);
                newPage.drawImage(embeddedImage, {
                    x: 0,
                    y: 0,
                    width: embeddedImage.width,
                    height: embeddedImage.height,
                });
            }

            const compressedBytes = await newPdfDoc.save({ useObjectStreams: true });
            const compressedBlob = new Blob([compressedBytes], { type: 'application/pdf' });

            const originalSize = file.size;
            const compressedSize = compressedBlob.size;
            const savings = Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100));

            setCompressedResult({
                blob: compressedBlob,
                size: compressedSize,
                originalSize,
                savingsPercent: savings,
            });

        } catch (err) {
            console.error('Error compressing PDF:', err);
            alert('Failed to compress PDF. Please try another file.');
        }
        finally {
            setIsCompressing(false);
        }
    }

    const handleDownload = () => {
        if (!compressedResult) return;
        const url = URL.createObjectURL(compressedResult.blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${file.name.replace(/\.pdf$/i, '')}_compressed.pdf`;
        link.click();
    };


    return (
        <div className='space-y-6'>
            {/* Top Summary */}
            <div className='flex items-center justify-between bg-slate-800/60 p-4 rounded-2xl border border-slate-700/50'>
                <div>
                    <h2 className='text-lg font-semibold text-slate-100 truncate max-w-xs sm:max-w-md'>{file.name}</h2>
                    <p className='text-xs text-slate-400'>Original Size: {formatBytes(file.size)}</p>
                </div>
                <button
                    onClick={onReset}
                    className='px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs rounded-xl transition-all'
                >
                    Change File
                </button>
            </div>

            {/* Preset Cards */}
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                {Object.entries(presets).map(([key, item]) => {
                    const isSelected = compressionLevel === key;
                    return (
                        <div
                            key={key}
                            onClick={() => setCompressionLevel(key)}
                            className={`p-4 rounded-2xl border cursor-pointer transition-all ${isSelected
                                ? 'bg-indigo-600/15 border-indigo-500/60 text-slate-100 shadow-lg shadow-indigo-600/10'
                                : 'bg-slate-800/40 border-slate-800 hover:border-slate-700 text-slate-400'
                                }`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-semibold text-slate-200">{item.label}</h3>
                                {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />}
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                        </div>
                    );
                })}
            </div>

            {/* Always render the Compress / Re-Compress button */}
            <button
                onClick={handleCompress}
                disabled={isCompressing}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white font-semibold text-base rounded-2xl shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all"
            >
                {isCompressing ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                    <Minimize2 className="w-5 h-5" />
                )}
                {isCompressing
                    ? 'Compressing PDF...'
                    : compressedResult
                        ? 'Re-compress with Selected Level'
                        : 'Compress PDF File'}
            </button>

            {/* Results */}
            {compressedResult && (
                <div className="bg-slate-800/80 rounded-2xl border border-emerald-500/30 p-6 text-center space-y-4 animate-fade-in mt-6">
                    <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-full w-fit mx-auto border border-emerald-500/20">
                        <CheckCircle2 className="w-8 h-8" />
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-slate-100">Compression Complete!</h3>
                        <p className="text-sm text-slate-400 mt-1">
                            Reduced from{' '}
                            <span className="line-through text-slate-500">
                                {formatBytes(compressedResult.originalSize)}
                            </span>{' '}
                            to{' '}
                            <span className="text-emerald-400 font-semibold">
                                {formatBytes(compressedResult.size)}
                            </span>
                        </p>
                    </div>

                    <div className="inline-block px-4 py-1.5 bg-emerald-500/20 text-emerald-300 font-bold text-sm rounded-full border border-emerald-500/30">
                        {compressedResult.savingsPercent}% Smaller
                    </div>

                    <button
                        onClick={handleDownload}
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-base rounded-2xl shadow-xl shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all"
                    >
                        <Download className="w-5 h-5" /> Download Compressed PDF
                    </button>
                </div>
            )}
        </div>
    )
}

export default CompressPdf