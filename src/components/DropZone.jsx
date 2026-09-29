import { useState, useRef } from 'react';
import { UploadCloud, FileUp } from 'lucide-react';

const DropZone = ({ onFileSelected, accept, multiple = false, title, subtitle }) => {

    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    }

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    }

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onFileSelected(Array.from(e.dataTransfer.files));
        }
    }

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            onFileSelected(Array.from(e.target.files));
        }
    }

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => { fileInputRef.current?.click() }}
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${isDragging
                    ? 'border-indigo-500 bg-indigo-500/10 scale-[0.99]'
                    : 'border-slate-700 bg-slate-800/40 hover:border-slate-500 hover:bg-slate-800/80'
                }`}
        >

            <input
                ref={fileInputRef}
                type='file'
                accept={accept}
                multiple={multiple}
                onChange={handleFileChange}
                className='hidden'
            />

            <div className='flex flex-col items-center justify-center gap-3'>
                <div className={`p-4 rounded-full transition-colors ${isDragging ? 'bg-indigo-500/20 text-indigo-400':'bg-slate-700/50 text-slate-300'}`}>
                    {isDragging ? <FileUp className='w-8 h-8 animate-bounce' />: <UploadCloud className='w-8 h-8' />}
                </div>
                <div>
                    <h3 className='text-lg font-semibold text-slate-100'>{title}</h3>
                    <p className='text-sm text-slate-400 mt-1'>{subtitle}</p>
                </div>
                <button type='button' className='mt-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl shadow-lg shadow-indigo-600/20 transition-all'>
                    Select Files
                </button>
            </div>
        </div>
    )
}

export default DropZone