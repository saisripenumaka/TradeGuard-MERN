import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import shipmentService from '../services/shipmentService';
import {
  ShipWheel as Ship,
  Search,
  Filter,
  PlusCircle,
  Eye,
  Trash2,
  Edit3,
  Loader2,
  AlertCircle,
  ArrowRight,
  FileCheck2,
  AlertTriangle,
  XCircle,
  Clock,
  ShieldAlert,
} from 'lucide-react';

export default function Shipments() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();

  const fetchShipments = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== 'All') params.status = statusFilter;
      if (riskFilter !== 'All') params.riskLevel = riskFilter;

      const response = await shipmentService.getShipments(params);
      if (response && response.success) {
        setShipments(response.data || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch shipments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, [statusFilter, riskFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchShipments();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await shipmentService.deleteShipment(deleteId);
      setDeleteId(null);
      fetchShipments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete shipment');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            <FileCheck2 className="w-3.5 h-3.5 mr-1" />
            Approved
          </span>
        );
      case 'Warning':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 mr-1" />
            Warning
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
            <XCircle className="w-3.5 h-3.5 mr-1" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <Clock className="w-3.5 h-3.5 mr-1 text-slate-500" />
            Pending
          </span>
        );
    }
  };

  const getRiskBadge = (level, score) => {
    switch (level) {
      case 'High':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-300">
            <ShieldAlert className="w-3 h-3 mr-1 text-rose-600" />
            {score}/100 High
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold bg-amber-50 border border-amber-200 text-amber-700 dark:bg-amber-950/40 dark:border-amber-900/60 dark:text-amber-300">
            {score}/100 Med
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-900/60 dark:text-emerald-300">
            {score}/100 Low
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Ship className="w-7 h-7 text-primary-600" />
            Shipment Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track, filter, and review international shipments for regulatory compliance
          </p>
        </div>

        <Link
          to="/add-shipment"
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-semibold text-sm shadow-md shadow-primary-600/20 transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Shipment</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by shipment name, HS code, or destination..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
          />
        </form>

        {/* Status Dropdown */}
        <div className="flex items-center space-x-2">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
            Status:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Warning">Warning</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Risk Dropdown */}
        <div className="flex items-center space-x-2">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
            Risk:
          </label>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="py-2 px-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="All">All Risks</option>
            <option value="Low">Low Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="High">High Risk</option>
          </select>
        </div>
      </div>

      {/* Shipments Table Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            <p className="text-sm font-medium text-slate-500">Loading shipments...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <p className="text-sm font-semibold text-rose-600">{error}</p>
            <button
              onClick={fetchShipments}
              className="text-xs px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 transition"
            >
              Try Again
            </button>
          </div>
        ) : shipments.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-950/40 text-primary-600 flex items-center justify-center mx-auto">
              <Ship className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                No shipments found
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                No shipments matched your search criteria or none have been submitted yet.
              </p>
            </div>
            <Link
              to="/add-shipment"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-primary-600 text-white font-medium text-sm hover:bg-primary-700 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Register First Shipment</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Shipment / Carrier</th>
                  <th className="py-3.5 px-4">HS Code & Goods</th>
                  <th className="py-3.5 px-4">Route</th>
                  <th className="py-3.5 px-4">Value & Weight</th>
                  <th className="py-3.5 px-4">Compliance</th>
                  <th className="py-3.5 px-4">Risk Score</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {shipments.map((s) => (
                  <tr
                    key={s._id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition group"
                  >
                    <td className="py-4 px-4 font-medium text-slate-900 dark:text-white">
                      <div className="font-semibold text-slate-900 dark:text-white hover:text-primary-600 transition">
                        <Link to={`/shipments/${s._id}`}>{s.shipmentName}</Link>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {s.shippingCompany}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-mono text-xs font-bold text-primary-700 dark:text-primary-400">
                        {s.hsCode}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs">
                        {s.goodsDescription}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-1.5 text-xs text-slate-700 dark:text-slate-300">
                        <span>{s.originCountry}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span className="font-semibold">{s.destinationCountry}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        ${Number(s.shipmentValue).toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {s.weight} kg
                      </div>
                    </td>

                    <td className="py-4 px-4">{getStatusBadge(s.complianceStatus)}</td>

                    <td className="py-4 px-4">{getRiskBadge(s.riskLevel, s.riskScore)}</td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <Link
                          to={`/shipments/${s._id}`}
                          className="p-1.5 text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/shipments/${s._id}/edit`}
                          className="p-1.5 text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteId(s._id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Shipment?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                This will permanently delete this shipment and remove all associated uploaded
                documents from the server.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-md shadow-rose-600/20 disabled:opacity-60 transition flex items-center justify-center"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
