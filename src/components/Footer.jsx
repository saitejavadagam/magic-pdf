import { Shield, Lock, Cpu, Heart } from "lucide-react"

const Footer = () => {
    return (
        <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-slate-100/70 dark:bg-slate-950/80 text-slate-600 dark:text-slate-400 transition-colors duration-200 mt-12">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left mb-8">
                    <div className="flex flex-col items-center md:items-start gap-2">
                        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold text-sm">
                            <Shield className="w-4 h-4 text-emerald-500" /> Zero Uploads
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            Your files never leave your browser. All PDF operations run locally using Web Workers.
                        </p>
                    </div>

                    <div className="flex flex-col items-center md:items-start gap-2">
                        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold text-sm">
                            <Lock className="w-4 h-4 text-indigo-500" /> Privacy First
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            No analytics tracking, no server logs, and no external storage of document content.
                        </p>
                    </div>

                    <div className="flex flex-col items-center md:items-start gap-2">
                        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold text-sm">
                            <Cpu className="w-4 h-4 text-purple-500" /> Browser Engine
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            Powered by WebAssembly, PDF.js, and JavaScript stream processing.
                        </p>
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-200 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <p>© {new Date().getFullYear()} MagicPDF. Free & Open Client-Side Utility Suite.</p>
                    <p className="flex items-center gap-1">
                        Crafted with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for fast PDF tasks.
                    </p>
                </div>
            </div>
        </footer>
    )
}

export default Footer