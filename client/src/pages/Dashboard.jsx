import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import shipmentService from '../services/shipmentService';
import { useAuth } from '../context/AuthContext';
import {
  ShipWheel as Ship,
  Clock,
  FileCheck2,
  ShieldAlert,
  AlertTriangle,
  DollarSign,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  Loader2,
  ExternalLink,
  Shield,
  Layers,
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await shipmentService.getShipmentStats();
        if (response && response.success) {
          setStats(response.stats);
        }
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const total = stats?.totalShipments || 0;
  const pending = stats?.pendingShipments || 0;
  const approved = stats?.approvedShipments || 0;
  const highRisk = stats?.highRiskShipments || 0;
  const totalValue = stats?.totalValue || 0;

  // Percentage calculations
  const approvedPct = total > 0 ? Math.round((approved / total) * 100) : 0;
  const pendingPct = total > 0 ? Math.round((pending / total) * 100) : 0;
  const highRiskPct = total > 0 ? Math.round((highRisk / total) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-900 via-primary-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-primary-200">
              <Shield className="w-3.5 h-3.5 text-primary-300" />
              <span>AI Compliance & Risk Engine Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name || 'Trader'}!
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Monitor international trade regulations, evaluate customs HS classifications, and mitigate cross-border shipment risks in real time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/add-shipment"
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white text-primary-950 font-bold text-sm hover:bg-slate-100 shadow-md transition"
            >
              <PlusCircle className="w-4 h-4 text-primary-600" />
              <span>New Shipment</span>
            </Link>
            <Link
              to="/shipments"
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-semibold text-sm transition"
            >
              <span>View Shipments</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Statistic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Shipments
            </span>
            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-950/60 text-primary-600 flex items-center justify-center">
              <Ship className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {loading ? '—' : total}
            </p>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <span>Valued at ${totalValue.toLocaleString()}</span>
            </p>
          </div>
        </div>

        {/* Card 2: Pending */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Pending Review
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {loading ? '—' : pending}
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">
              {pendingPct}% of total volume
            </p>
          </div>
        </div>

        {/* Card 3: Approved */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Approved
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {loading ? '—' : approved}
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
              {approvedPct}% clearance rate
            </p>
          </div>
        </div>

        {/* Card 4: High Risk */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              High Risk Alert
            </span>
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {loading ? '—' : highRisk}
            </p>
            <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 font-medium">
              {highRiskPct}% flagged items
            </p>
          </div>
        </div>
      </div>

      {/* Visual Analytics & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compliance Distribution Bar Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary-600" />
                Compliance Clearance & Risk Distribution
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Visual proportion of shipments across regulatory statuses
              </p>
            </div>
            <Link
              to="/compliance-report"
              className="text-xs font-semibold text-primary-600 hover:underline flex items-center gap-1"
            >
              <span>View Reports</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          {/* Distribution Visual Meter */}
          <div className="space-y-3">
            <div className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
              <div
                className="bg-emerald-500 h-full transition-all duration-500"
                style={{ width: `${approvedPct}%` }}
                title={`Approved: ${approved}`}
              />
              <div
                className="bg-amber-500 h-full transition-all duration-500"
                style={{ width: `${pendingPct}%` }}
                title={`Pending: ${pending}`}
              />
              <div
                className="bg-rose-500 h-full transition-all duration-500"
                style={{ width: `${highRiskPct}%` }}
                title={`High Risk: ${highRisk}`}
              />
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-between text-xs pt-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-slate-600 dark:text-slate-300">
                  Approved ({approvedPct}%)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-slate-600 dark:text-slate-300">
                  Pending Screening ({pendingPct}%)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="text-slate-600 dark:text-slate-300">
                  High Risk / Flagged ({highRiskPct}%)
                </span>
              </div>
            </div>
          </div>

          {/* Quick AI Tip / Summary */}
          <div className="p-4 rounded-xl bg-primary-50/50 dark:bg-primary-950/20 border border-primary-100 dark:border-primary-900/40 flex items-start space-x-3 text-xs text-primary-900 dark:text-primary-200">
            <Shield className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">TradeGuard Orchestrator Recommendation:</p>
              <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                Always ensure commercial invoices include precise 6-digit Harmonized System (HS) classifications and country of origin declarations to expedite customs clearance.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Quick Actions
          </h2>

          <div className="space-y-2.5">
            <Link
              to="/add-shipment"
              className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-50/30 transition group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-950/60 text-primary-600 flex items-center justify-center">
                  <PlusCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-primary-600 transition">
                    Create Shipment
                  </p>
                  <p className="text-[11px] text-slate-400">Attach customs documents</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-primary-600 group-hover:translate-x-0.5 transition" />
            </Link>

            <Link
              to="/compliance-report"
              className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-50/30 transition group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-primary-600 transition">
                    Compliance Audit
                  </p>
                  <p className="text-[11px] text-slate-400">Run AI checks with Gemini</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-primary-600 group-hover:translate-x-0.5 transition" />
            </Link>

            <Link
              to="/notifications"
              className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-50/30 transition group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-primary-600 transition">
                    Regulatory Alerts
                  </p>
                  <p className="text-[11px] text-slate-400">View recent notifications</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-primary-600 group-hover:translate-x-0.5 transition" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Shipments Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Ship className="w-4 h-4 text-primary-600" />
            Recent Shipments
          </h2>
          <Link
            to="/shipments"
            className="text-xs font-semibold text-primary-600 hover:underline flex items-center gap-1"
          >
            <span>View All ({total})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
          </div>
        ) : !stats?.recentShipments || stats.recentShipments.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            No shipments logged yet. Get started by registering your first consignment!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-400 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="pb-3">Shipment Name</th>
                  <th className="pb-3">HS Code</th>
                  <th className="pb-3">Route</th>
                  <th className="pb-3">Value</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {stats.recentShipments.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 font-semibold text-slate-900 dark:text-white">
                      <Link to={`/shipments/${s._id}`} className="hover:text-primary-600">
                        {s.shipmentName}
                      </Link>
                    </td>
                    <td className="py-3 font-mono text-xs text-primary-600">{s.hsCode}</td>
                    <td className="py-3 text-xs text-slate-500">
                      {s.originCountry} → {s.destinationCountry}
                    </td>
                    <td className="py-3 font-medium text-slate-900 dark:text-white">
                      ${Number(s.shipmentValue).toLocaleString()}
                    </td>
                    <td className="py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          s.complianceStatus === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : s.complianceStatus === 'Warning'
                            ? 'bg-amber-100 text-amber-800'
                            : s.complianceStatus === 'Rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {s.complianceStatus}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        to={`/shipments/${s._id}`}
                        className="text-xs text-primary-600 hover:underline font-semibold"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
