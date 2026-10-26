import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, CheckCircle2, ShieldCheck, Zap, Globe, FileWarning } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="relative min-h-[80vh] flex flex-col justify-center">
      {/* Decorative blurred backgrounds */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-10" />

      {/* Hero Section */}
      <div className="text-center max-w-4xl mx-auto px-4 pt-10 pb-16">
        <div className="inline-flex items-center space-x-2 bg-primary-50 dark:bg-primary-950/40 border border-primary-200/50 dark:border-primary-900/30 px-4 py-1.5 rounded-full text-primary-700 dark:text-primary-400 text-sm font-semibold mb-6">
          <Zap className="w-4 h-4 fill-current" />
          <span>Powered by Gemini 3.1 Pro & Pinecone RAG</span>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-6 leading-tight">
          AI-Powered Global Shipping{' '}
          <span className="bg-gradient-to-r from-primary-600 to-indigo-500 bg-clip-text text-transparent">
            Compliance Orchestration
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-450 max-w-2xl mx-auto mb-10 leading-relaxed">
          Upload shipment documents, analyze global trade compliance, and run semantic checks against regulations in seconds. Reduce audit risks with automated compliance reports.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          {user ? (
            <Link
              to="/dashboard"
              className="px-8 py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-lg shadow-primary-500/20 transition flex items-center space-x-2 w-full sm:w-auto justify-center"
            >
              <span>Go to Dashboard</span>
              <ShieldCheck className="w-5 h-5" />
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="px-8 py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-lg shadow-primary-500/20 transition w-full sm:w-auto justify-center"
              >
                Get Started Free
              </Link>
              <Link
                to="/login"
                className="px-8 py-3.5 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl font-bold transition w-full sm:w-auto justify-center"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4 mt-8 pb-16">
        <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-850 p-6 rounded-2xl">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-950/50 w-fit rounded-xl text-indigo-600 dark:text-indigo-450 mb-4">
            <Globe className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Cross-Border Check</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Automatically check destination and origin risks, compliance sanctions, and correct export regulations.
          </p>
        </div>

        <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-850 p-6 rounded-2xl">
          <div className="p-3 bg-primary-100 dark:bg-primary-950/50 w-fit rounded-xl text-primary-600 dark:text-primary-450 mb-4">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Semantic RAG Analysis</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Pinecone searches live regulations database, feeding context to Gemini AI to spot complex policy requirements.
          </p>
        </div>

        <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-850 p-6 rounded-2xl">
          <div className="p-3 bg-amber-100 dark:bg-amber-950/50 w-fit rounded-xl text-amber-600 dark:text-amber-450 mb-4">
            <FileWarning className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Pre-empt Customs Holds</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Identify documentation discrepancies and dangerous goods conflicts before cargo gets stuck at the border.
          </p>
        </div>
      </div>
    </div>
  );
}
