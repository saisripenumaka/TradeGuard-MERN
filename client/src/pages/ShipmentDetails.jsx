import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import shipmentService from '../services/shipmentService';
import {
  ShipWheel as Ship,
  ArrowLeft,
  Calendar,
  Globe2,
  DollarSign,
  Weight,
  FileText,
  Download,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  XCircle,
  FileCheck2,
  Clock,
  Edit3,
  Trash2,
  Loader2,
  AlertCircle,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export default function ShipmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchShipment = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await shipmentService.getShipmentById(id);
        if (response && response.success) {
          setShipment(response.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch shipment details');
      } finally {
        setLoading(false);
      }
    };

    fetchShipment();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this shipment and its documents?')) return;

    setIsDeleting(true);
    try {
      await shipmentService.deleteShipment(id);
      navigate('/shipments');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete shipment');
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            <FileCheck2 className="w-4 h-4 mr-1.5" />
            Compliance Approved
          </span>
        );
      case 'Warning':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4 mr-1.5" />
            Compliance Warning
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
            <XCircle className="w-4 h-4 mr-1.5" />
            Compliance Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <Clock className="w-4 h-4 mr-1.5 text-slate-500" />
            Screening Pending
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        <p className="text-sm font-medium text-slate-500">Loading shipment specifications...</p>
      </div>
    );
  }

  if (error || !shipment) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Shipment Not Found</h2>
        <p className="text-sm text-slate-500">{error || 'This record does not exist or was removed.'}</p>
        <Link
          to="/shipments"
          className="inline-flex items-center px-4 py-2 rounded-xl bg-primary-600 text-white font-medium text-sm"
        >
          Return to Shipments
        </Link>
      </div>
    );
  }

  const backendBaseUrl = 'http://localhost:5000';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/shipments"
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 mb-2 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Back to All Shipments
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {shipment.shipmentName}
            </h1>
            {getStatusBadge(shipment.complianceStatus)}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Registered by {shipment.user?.name || 'Exporter'} • Carrier: {shipment.shippingCompany}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <Link
            to={`/shipments/${shipment._id}/edit`}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <Edit3 className="w-4 h-4 text-slate-500" />
            <span>Edit</span>
          </Link>

          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>

          <Link
            to={`/compliance-report?shipmentId=${shipment._id}`}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold shadow-md shadow-primary-600/20 transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>Compliance Assessment</span>
          </Link>
        </div>
      </div>

      {/* Main Grid: Details & Risk Assessment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Core Specs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card: Routing & Schedule */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-primary-600" />
              Routing & Transport Logistics
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <p className="text-xs text-slate-400">Origin Country</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  {shipment.originCountry}
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <p className="text-xs text-slate-400">Destination</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  {shipment.destinationCountry}
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <p className="text-xs text-slate-400">Shipping Company</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                  {shipment.shippingCompany}
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <p className="text-xs text-slate-400">Shipping Date</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  {new Date(shipment.shippingDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Card: Cargo Specifications */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Weight className="w-4 h-4 text-primary-600" />
              Cargo & Customs Specifications
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <p className="text-xs text-slate-400">HS Tariff Code</p>
                <p className="text-base font-mono font-bold text-primary-600 dark:text-primary-400 mt-0.5">
                  {shipment.hsCode}
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <p className="text-xs text-slate-400">Declared Value (USD)</p>
                <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  ${Number(shipment.shipmentValue).toLocaleString()}
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <p className="text-xs text-slate-400">Total Net Weight</p>
                <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {shipment.weight} kg
                </p>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-xs font-semibold text-slate-500 mb-1">Declared Goods Description</p>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {shipment.goodsDescription}
              </div>
            </div>
          </div>

          {/* Card: Document Vault (Multer storage) */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary-600" />
                Attached Customs Documents ({shipment.documents?.length || 0})
              </h2>
              <span className="text-xs text-slate-400">Stored via Multer</span>
            </div>

            {shipment.documents && shipment.documents.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                {shipment.documents.map((doc, idx) => {
                  const downloadUrl = `${backendBaseUrl}${doc.filePath}`;
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                    >
                      <div className="flex items-center space-x-3 truncate">
                        <div className="w-9 h-9 rounded-lg bg-primary-100 dark:bg-primary-950/60 text-primary-600 flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                          {doc.fileType || 'DOC'}
                        </div>
                        <div className="truncate">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                            {doc.originalName || doc.fileName}
                          </p>
                          <p className="text-xs text-slate-400">
                            {doc.fileSize ? `${(doc.fileSize / 1024 / 1024).toFixed(2)} MB • ` : ''}
                            Uploaded {new Date(doc.uploadDate || shipment.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <a
                        href={downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-primary-950/50 text-slate-700 dark:text-slate-300 hover:text-primary-600 text-xs font-semibold transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </a>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
                <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  No documents attached to this shipment
                </p>
                <Link
                  to={`/shipments/${shipment._id}/edit`}
                  className="text-xs font-semibold text-primary-600 hover:underline"
                >
                  Upload invoice or packing list
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Risk & Compliance Overview */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-5">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary-600" />
              Risk Index & Score
            </h2>

            {/* Score Ring / Bar */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center space-y-2">
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {shipment.riskScore}
                <span className="text-base font-normal text-slate-400">/100</span>
              </div>
              <p
                className={`text-xs font-bold uppercase tracking-wider ${
                  shipment.riskLevel === 'High'
                    ? 'text-rose-600'
                    : shipment.riskLevel === 'Medium'
                    ? 'text-amber-600'
                    : 'text-emerald-600'
                }`}
              >
                {shipment.riskLevel} Risk Profile
              </p>

              {/* Progress Bar */}
              <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mt-2">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    shipment.riskLevel === 'High'
                      ? 'bg-rose-500'
                      : shipment.riskLevel === 'Medium'
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(shipment.riskScore, 100)}%` }}
                />
              </div>
            </div>

            {/* Risk Factors Checklist */}
            <div className="space-y-2.5 text-xs">
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                Automated Risk Indicators:
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                  <span>Shipment Value</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {shipment.shipmentValue > 100000
                      ? 'High (> $100k)'
                      : shipment.shipmentValue > 50000
                      ? 'Medium'
                      : 'Standard'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                  <span>Documentation Status</span>
                  <span
                    className={`font-semibold ${
                      shipment.documents?.length > 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {shipment.documents?.length > 0
                      ? `${shipment.documents.length} File(s) Verified`
                      : 'Missing Documents'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                  <span>Cross-Border Risk</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {shipment.originCountry} → {shipment.destinationCountry}
                  </span>
                </div>
              </div>
            </div>

            {/* AI Compliance Report Action */}
            <Link
              to={`/compliance-report?shipmentId=${shipment._id}`}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm shadow-md shadow-primary-600/20 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate AI Compliance Report</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
