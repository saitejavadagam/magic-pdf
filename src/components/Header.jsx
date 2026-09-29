import { Sparkles, ShieldCheck, Zap } from "lucide-react"

const Header = () => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">

            {/* Brand Logo */}
            <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-600/20 rounded-xl border border-indigo-500/30 text-indigo-400">
                    <Sparkles className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-xl font-bold bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                        MagicPDF
                    </h1>
                    <p className="text-xs text-slate-400">Secure PDF Tools</p>
                </div>
            </div>

            {/* Feature Badges */}
            <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700/50">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    100% Client-Side Privacy
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700/50">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    Zero server delay
                </span>

            </div>
        </div>
    </header>
  )
}

export default Header