import { useState } from 'react'
import { useTheme } from './utils/useTheme'
import Header from './components/Header'
import DropZone from './components/DropZone'
import JpgToPdf from './components/JpgToPdf'
import { Image, FileOutput, Minimize2 } from 'lucide-react'
import PdfToJpg from './components/PdfToJpg'
import CompressPdf from './components/CompressPdf'

const App = () => {

  const [activeTab, setActiveTab] = useState('jpg-to-pdf');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const { theme, toggleTheme } = useTheme();

  const tabs = [
    { id: 'jpg-to-pdf', label: 'JPG to PDF', icon: Image, accept: 'image/jpeg, image/png, image/webp', multiple: true, title: 'Convert Images to PDF', subtitle: 'Drag & drop JPG/PNG images here' },
    { id: 'pdf-to-jpg', label: 'PDF to JPG', icon: FileOutput, accept: 'application/pdf', multiple: false, title: 'Convert PDF to JPG', subtitle: 'Drag & drop PDF document here' },
    { id: 'compress-pdf', label: 'Compress PDF', icon: Minimize2, accept: 'application/pdf', multiple: false, title: 'Compress PDF File', subtitle: 'Drag & drop PDF file to shrink its size' }
  ];

  const currentTab = tabs.find((t) => t.id === activeTab);

  const handleTabChange = (id) => {
    setActiveTab(id);
    setSelectedFiles([]);
  }

  const handleFilesSelected = (files) => {
    setSelectedFiles(files);
  }

  return (
    <div className='min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200'>
      <Header theme={theme} toggleTheme={toggleTheme} />

      <main className='flex-1 max-w-4xl w-full mx-auto px-4 py-8'>
        {/* Tool Navigation Tabs */}
        <div className='flex bg-slate-200/80 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-300 dark:border-slate-800 mb-8 max-w-md mx-auto'>
          {
            tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-medium text-sm transition-all ${isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-300/50 dark:hover:bg-slate-800/50'
                    }`}
                >
                  <Icon className='w-4 h-4' />
                  <span className='hidden sm:inline'>{tab.label}</span>
                </button>
              )
            })
          }
        </div>

        {/* Dynamic Tool Container */}
        <div className='bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl transition-colors duration-200'>
          {
            selectedFiles.length === 0 ? (
              <DropZone
                key={activeTab}
                accept={currentTab.accept}
                multiple={currentTab.multiple}
                title={currentTab.title}
                subtitle={currentTab.subtitle}
                onFilesSelected={handleFilesSelected}
              />
            ) :
              activeTab === 'jpg-to-pdf' ? (
                <JpgToPdf initialFiles={selectedFiles} onReset={() => setSelectedFiles([])} />
              ) :
                activeTab === 'pdf-to-jpg' ? (
                  <PdfToJpg file={selectedFiles[0]} onReset={() => setSelectedFiles([])} />
                ) :
                  activeTab === 'compress-pdf' ? (
                    <CompressPdf file={selectedFiles[0]} onReset={() => setSelectedFiles([])} />
                  ) : null
          }
        </div>
      </main>
    </div>
  )
}

export default App