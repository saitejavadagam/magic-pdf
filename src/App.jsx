import { FileText, Sparkles } from 'lucide-react'
import {pdfjsLib} from './utils/pdfWorker'

const App = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-8 h-8 text-amber-400" />
        <h1 className="text-4xl font-bold text-indigo-400">MagicPDF</h1>
      </div>
      <p>
        <FileText className="w-5 h-5" />
        PDF Worker initialized (v{pdfjsLib.version})
      </p>
    </div>
  )
}

export default App