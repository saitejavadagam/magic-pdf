import { Sparkles, ShieldCheck, Zap, Sun, Moon } from "lucide-react"

const Header = ({theme, toggleTheme}) => {
  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">

            {/* Brand Logo */}
            <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/10 dark:bg-indigo-600/20 rounded-xl border border-indigo-500/20 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400">
                    <Sparkles className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                        MagicPDF
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Secure PDF Tools</p>
                </div>
            </div>

            {/* Feature Badges */}
            <div className="flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    100% Client-Side Privacy
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    Zero server delay
                </span>

                <button
                    onClick={toggleTheme}
                    aria-label="Toggle Theme"
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all border border-slate-200 dark:border-slate-700/50"
                >
                    {theme === 'dark'? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
                </button>

            </div>
        </div>
    </header>
  )
}

export default Header