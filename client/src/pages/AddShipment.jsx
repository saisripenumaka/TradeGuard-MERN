import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import shipmentService from '../services/shipmentService';
import {
  PlusCircle,
  UploadCloud,
  FileText,
  Trash2,
  Loader2,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

export default function AddShipment() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    shipmentName: '',
    originCountry: '',
    destinationCountry: '',
    hsCode: '',
    goodsDescription: '',
    weight: '',
    shipmentValue: '',
    shippingDate: new Date().toISOString().split('T')[0],
    shippingCompany: '',
  });

  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError('');
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSampleFill = (type) => {
    if (type === 'electronics') {
      setFormData({
        shipmentName: 'High-Density Server Motherboards Batch #409',
        originCountry: 'Taiwan',
        destinationCountry: 'United States',
        hsCode: '8473.30.11',
        goodsDescription:
          'Printed circuit assemblies and multi-chip high density computing server units for enterprise cloud data centers.',
        weight: '1250',
        shipmentValue: '185000',
        shippingDate: new Date().toISOString().split('T')[0],
        shippingCompany: 'Maersk Line',
      });
    } else if (type === 'chemicals') {
      setFormData({
        shipmentName: 'Industrial Lithium Ion Energy Cells',
        originCountry: 'China',
        destinationCountry: 'Germany',
        hsCode: '8507.60.00',
        goodsDescription:
          'High capacity rechargeable lithium-ion battery modules subject to UN3480 hazardous goods transport regulations.',
        weight: '4800',
        shipmentValue: '92000',
        shippingDate: new Date().toISOString().split('T')[0],
        shippingCompany: 'Hapag-Lloyd',
      });
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.shipmentName ||
      !formData.originCountry ||
      !formData.destinationCountry ||
      !formData.hsCode ||
      !formData.goodsDescription ||
      !formData.weight ||
      !formData.shipmentValue ||
      !formData.shippingDate ||
      !formData.shippingCompany
    ) {
      setError('Please complete all required shipment fields.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      files.forEach((file) => {
        data.append('documents', file);
      });

      const response = await shipmentService.createShipment(data);
      if (response && response.success) {
        navigate(`/shipments/${response.data._id}`);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Failed to submit shipment. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/shipments"
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 mb-2 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Back to All Shipments
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Register New International Shipment
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Submit cargo specifications and attach trade documents for automated AI compliance
          </p>
        </div>

        {/* Quick Sample Fill */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSampleFill('electronics')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary-500" />
            <span>Sample Electronics</span>
          </button>
          <button
            type="button"
            onClick={() => handleSampleFill('chemicals')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Sample Batteries</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-start p-4 text-sm text-red-700 bg-red-50 dark:bg-red-950/40 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-900/60 space-x-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Core Shipment Details */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            1. Shipment Metadata & Routing
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Shipment Name / Consignment ID *
              </label>
              <input
                type="text"
                name="shipmentName"
                required
                value={formData.shipmentName}
                onChange={handleChange}
                placeholder="e.g. Commercial Electronics Batch Q3"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Origin Country *
              </label>
              <input
                type="text"
                name="originCountry"
                required
                value={formData.originCountry}
                onChange={handleChange}
                placeholder="e.g. South Korea"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Destination Country *
              </label>
              <input
                type="text"
                name="destinationCountry"
                required
                value={formData.destinationCountry}
                onChange={handleChange}
                placeholder="e.g. Netherlands"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Shipping Carrier / Company *
              </label>
              <input
                type="text"
                name="shippingCompany"
                required
                value={formData.shippingCompany}
                onChange={handleChange}
                placeholder="e.g. Maersk, MSC, FedEx, DHL"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Shipping Date *
              </label>
              <input
                type="date"
                name="shippingDate"
                required
                value={formData.shippingDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm transition"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Cargo & Customs Classification */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            2. Cargo & Customs Classification
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  HS Code (Harmonized System) *
                </label>
              </div>
              <input
                type="text"
                name="hsCode"
                required
                value={formData.hsCode}
                onChange={handleChange}
                placeholder="e.g. 8517.13.00"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                6 to 10-digit international trade classification
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Total Weight (kg) *
              </label>
              <input
                type="number"
                name="weight"
                required
                min="0.1"
                step="any"
                value={formData.weight}
                onChange={handleChange}
                placeholder="e.g. 1500"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Shipment Value (USD) *
              </label>
              <input
                type="number"
                name="shipmentValue"
                required
                min="1"
                step="any"
                value={formData.shipmentValue}
                onChange={handleChange}
                placeholder="e.g. 45000"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm transition"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Detailed Goods Description *
              </label>
              <textarea
                name="goodsDescription"
                required
                rows={3}
                value={formData.goodsDescription}
                onChange={handleChange}
                placeholder="Describe material compositions, item intended usage, specifications, and serial designations..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm transition"
              />
            </div>
          </div>
        </div>

        {/* Card 3: Document Uploads (Multer) */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                3. Customs Documentation
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Upload Commercial Invoice, Bill of Lading, Certificate of Origin, or Material Safety
                Data Sheets
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              PDF, DOCX, Images
            </span>
          </div>

          {/* Upload Dropzone */}
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-primary-500 dark:hover:border-primary-400 transition bg-slate-50/50 dark:bg-slate-800/40 relative">
            <input
              type="file"
              multiple
              accept=".pdf,.docx,.doc,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
              <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Click or drag files here to upload
              </p>
              <p className="text-xs text-slate-400">
                Max 5 files (Up to 15MB each) • Supported: PDF, DOCX, JPG, PNG
              </p>
            </div>
          </div>

          {/* Uploaded Files List */}
          {files.length > 0 && (
            <div className="space-y-2 pt-2">
              <p className="text-xs font-semibold text-slate-500">Selected Files ({files.length}):</p>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 text-sm"
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <FileText className="w-5 h-5 text-primary-600 flex-shrink-0" />
                      <div className="truncate">
                        <p className="font-medium text-slate-900 dark:text-white truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                      title="Remove file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4 pt-2">
          <Link
            to="/shipments"
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm shadow-md shadow-primary-600/20 disabled:opacity-60 transition"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Registering & Uploading...</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                <span>Submit Shipment</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
