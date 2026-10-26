import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Shield, ArrowLeft, RefreshCw, FileText, CheckCircle2, AlertTriangle, AlertCircle, HelpCircle, Activity, ChevronDown, ChevronUp, Clock, Globe, ArrowRight, Loader2 } from 'lucide-react';

export default function ComplianceReport() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get('id');

  // Shipment & Analysis states
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showRawText, setShowRawText] = useState(false);

  const fetchShipmentDetails = async () => {
    if (!id) {
      setError('No shipment ID provided.');
      setLoading(false);
      return;
    }

    try {
      const response = await api.get(`/shipments/${id}`);
      setShipment(response.data);
      setError('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch shipment details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/login');
      } else {
        fetchShipmentDetails();
      }
    }
  }, [user, authLoading, id, navigate]);

  const handleRunAnalysis = async () => {
    if (!id) return;
    setIsAnalyzing(true);
    setError('');
    try {
      await api.post(`/shipments/${id}/analyze`);
      await fetchShipmentDetails(); // refresh
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'AI Compliance engine failed.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (authLoading || (loading && !shipment)) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error && !shipment) {
    return (
      <div className="max-w-xl mx-auto text-center p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-850 dark:text-white">Error Loading Report</h3>
        <p className="text-slate-500 dark:text-slate-400 mt-2 mb-6">{error}</p>
        <Link to="/dashboard" className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const analysis = shipment.analysisResult;
  const hasAnalysis = !!analysis;

  // Score color picker
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-450 bg-emerald-500';
    if (score >= 50) return 'text-amber-600 dark:text-amber-450 bg-amber-500';
    return 'text-red-600 dark:text-red-450 bg-red-500';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-fadeIn">
      {/* Back link */}
      <div className="flex justify-between items-center">
        <Link
          to="/dashboard"
          className="flex items-center space-x-2 text-slate-550 hover:text-slate-900 dark:hover:text-white font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        {hasAnalysis && (
          <button
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
            className="flex items-center space-x-1.5 px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Analyzing...' : 'Re-Run Compliance Check'}</span>
          </button>
        )}
      </div>

      {/* Main shipment profile banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-555">Active Shipment Profile</span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{shipment.productName}</h2>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-xs text-slate-500 font-semibold">
            <span className="flex items-center space-x-1">
              <Globe className="w-3.5 h-3.5" />
              <span>{shipment.originCountry} to {shipment.destinationCountry}</span>
            </span>
            <span>•</span>
            <span>Quantity: {shipment.quantity}</span>
            <span>•</span>
            <span>Declared: ${shipment.value.toLocaleString()} USD</span>
            <span>•</span>
            <span>Method: {shipment.shippingMethod}</span>
          </div>
        </div>

        {/* Audit timestamp */}
        <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
          <Clock className="w-4 h-4" />
          <span>Created: {new Date(shipment.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* If shipment is NOT analyzed yet */}
      {!hasAnalysis ? (
        <div className="bg-slate-950 text-white rounded-2xl border border-slate-850 p-12 text-center flex flex-col items-center justify-center min-h-[40vh]">
          <Shield className="w-16 h-16 text-primary-500 mb-4 animate-pulse" />
          <h3 className="text-2xl font-black mb-2">No Compliance Report Available</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
            This shipment has not been audited against international compliance regulations yet. Launch the TradeGuard AI auditor engine to perform semantic checks.
          </p>
          <button
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-lg shadow-primary-500/20 transition flex items-center space-x-2 cursor-pointer"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Running Audit Engine...</span>
              </>
            ) : (
              <>
                <Activity className="w-5 h-5" />
                <span>Run Compliance Analysis</span>
              </>
            )}
          </button>
        </div>
      ) : (
        /* COMPLIANCE AUDIT DISCOVERY VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left panel: Risk Status Header + Progress bars */}
          <div className="lg:col-span-1 space-y-6">
            {/* Risk header card */}
            <div className={`p-6 rounded-2xl shadow-md border text-center flex flex-col items-center justify-center transition-all ${
              analysis.overallRisk === 'HIGH'
                ? 'bg-red-500/10 border-red-200 dark:border-red-900/30 text-red-705 dark:text-red-400'
                : analysis.overallRisk === 'MEDIUM'
                ? 'bg-amber-505/10 border-amber-250 dark:border-amber-900/30 text-amber-705 dark:text-amber-400'
                : 'bg-emerald-500/10 border-emerald-250 dark:border-emerald-900/30 text-emerald-705 dark:text-emerald-400'
            }`}>
              <div className="p-3 rounded-full mb-3 bg-white dark:bg-slate-900 shadow-sm relative">
                <div className={`absolute inset-0 rounded-full animate-ping opacity-25 ${
                  analysis.overallRisk === 'HIGH' ? 'bg-red-500' : analysis.overallRisk === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500'
                }`} />
                <Shield className={`w-8 h-8 ${
                  analysis.overallRisk === 'HIGH' ? 'text-red-550' : analysis.overallRisk === 'MEDIUM' ? 'text-amber-500' : 'text-emerald-500'
                }`} />
              </div>
              <span className="text-xs font-black uppercase tracking-widest">Global Risk Factor</span>
              <h3 className="text-4xl font-extrabold mt-1 tracking-tight">{analysis.overallRisk}</h3>
            </div>

            {/* Score Breakdown Bars */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm space-y-5">
              <h4 className="text-sm font-bold text-slate-850 dark:text-white uppercase tracking-wider flex items-center space-x-1.5">
                <Activity className="w-4 h-4 text-primary-500" />
                <span>Compliance Scores</span>
              </h4>
              
              <div className="space-y-4">
                {[
                  { label: 'Documentation Match', key: 'documentation', desc: 'Invoices, packing lists compliance' },
                  { label: 'Product Control', key: 'product', desc: 'Battery, chemical & hardware checks' },
                  { label: 'Route & Destination', key: 'destination', desc: 'Geo restrictions & sanction risk' },
                  { label: 'Regulatory Adherence', key: 'regulatory', desc: 'Matched policies verification' },
                ].map((item) => {
                  const score = analysis.scoreBreakdown?.[item.key] ?? 100;
                  const bgClass = getScoreColor(score);
                  
                  return (
                    <div key={item.key} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-700 dark:text-slate-300">{item.label}</span>
                        <span className={bgClass.split(' ')[0]}>{score}%</span>
                      </div>
                      
                      {/* Progress bar background */}
                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${bgClass.split(' ')[1]}`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right panel: Alerts (Critical Issues, Warnings, Actions) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Critical Issues Box */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm space-y-4">
              <h4 className="text-sm font-bold text-red-650 dark:text-red-400 uppercase tracking-wider flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span>Critical Issues</span>
              </h4>
              
              {analysis.criticalIssues && analysis.criticalIssues.length > 0 ? (
                <div className="space-y-2">
                  {analysis.criticalIssues.map((issue, idx) => (
                    <div key={idx} className="p-3.5 bg-red-500/5 border-l-4 border-red-550 text-red-800 dark:text-red-300 text-sm rounded-r-xl leading-relaxed">
                      {issue}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-emerald-500/5 border-l-4 border-emerald-500 text-emerald-800 dark:text-emerald-450 text-sm rounded-r-xl flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span className="font-semibold">No critical trade violations or bans detected for this cargo.</span>
                </div>
              )}
            </div>

            {/* Warnings Box */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm space-y-4">
              <h4 className="text-sm font-bold text-amber-650 dark:text-amber-450 uppercase tracking-wider flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <span>Warnings & Discrepancies</span>
              </h4>
              
              {analysis.warnings && analysis.warnings.length > 0 ? (
                <div className="space-y-2">
                  {analysis.warnings.map((warning, idx) => (
                    <div key={idx} className="p-3.5 bg-amber-500/5 border-l-4 border-amber-500 text-amber-800 dark:text-amber-305 text-sm rounded-r-xl leading-relaxed">
                      {warning}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 dark:bg-slate-950/40 text-slate-500 dark:text-slate-400 text-sm rounded-xl">
                  No standard warnings or compliance discrepancies detected.
                </div>
              )}
            </div>

            {/* Action Items List */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-primary-500" />
                <span>Recommended Mitigation Actions</span>
              </h4>
              
              {analysis.recommendedActions && analysis.recommendedActions.length > 0 ? (
                <ol className="space-y-3 pl-1">
                  {analysis.recommendedActions.map((action, idx) => (
                    <li key={idx} className="flex items-start space-x-3 text-sm text-slate-750 dark:text-slate-300 leading-relaxed">
                      <span className="w-6 h-6 rounded-lg bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5 border border-primary-100 dark:border-primary-900/50">
                        {idx + 1}
                      </span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="p-4 bg-emerald-500/5 text-emerald-800 text-sm rounded-xl">
                  No compliance actions required. Shipment profile matches compliance standard parameters.
                </div>
              )}
            </div>

            {/* Raw parsed document text section */}
            {shipment.rawDocumentText && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden shadow-sm">
                <button
                  onClick={() => setShowRawText(!showRawText)}
                  className="w-full px-6 py-4 flex justify-between items-center font-bold text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850/50 transition cursor-pointer"
                >
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4.5 h-4.5 text-slate-500" />
                    <span>View Extracted Document Text</span>
                  </div>
                  {showRawText ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                
                {showRawText && (
                  <div className="p-6 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-105 dark:border-slate-800">
                    <pre className="text-xs text-slate-655 dark:text-slate-455 font-mono whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
                      {shipment.rawDocumentText}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
