import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import shipmentService from '../services/shipmentService';
import {
  ArrowLeft,
  Save,
  UploadCloud,
  FileText,
  Trash2,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export default function EditShipment() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    shipmentName: '',
    originCountry: '',
    destinationCountry: '',
    hsCode: '',
    goodsDescription: '',
    weight: '',
    shipmentValue: '',
    shippingDate: '',
    shippingCompany: '',
  });

  const [existingDocs, setExistingDocs] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchShipment = async () => {
      setLoading(true);
      try {
        const response = await shipmentService.getShipmentById(id);
        if (response && response.success) {
          const s = response.data;
          setFormData({
            shipmentName: s.shipmentName || '',
            originCountry: s.originCountry || '',
            destinationCountry: s.destinationCountry || '',
            hsCode: s.hsCode || '',
            goodsDescription: s.goodsDescription || '',
            weight: s.weight || '',
            shipmentValue: s.shipmentValue || '',
            shippingDate: s.shippingDate ? s.shippingDate.split('T')[0] : '',
            shippingCompany: s.shippingCompany || '',
          });
          setExistingDocs(s.documents || []);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load shipment for editing');
      } finally {
        setLoading(false);
      }
    };

    fetchShipment();
  }, [id]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError('');
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setNewFiles((prev) => [...prev, ...files]);
    }
  };

  const removeNewFile = (index) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      newFiles.forEach((file) => {
        data.append('documents', file);
      });

      const response = await shipmentService.updateShipment(id, data);
      if (response && response.success) {
        navigate(`/shipments/${id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update shipment');
    } finally {
      setIsSubmitting(false);
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link
          to={`/shipments/${id}`}
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 mb-2 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to Shipment Details
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Edit Shipment Details
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Update customs metadata, transport dates, or attach additional trade documentation
        </p>
      </div>

      {error && (
        <div className="flex items-start p-4 text-sm text-red-700 bg-red-50 dark:bg-red-950/40 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-900/60 space-x-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
          <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            Routing & Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Shipment Name
              </label>
              <input
                type="text"
                name="shipmentName"
                required
                value={formData.shipmentName}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Origin Country
              </label>
              <input
                type="text"
                name="originCountry"
                required
                value={formData.originCountry}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Destination Country
              </label>
              <input
                type="text"
                name="destinationCountry"
                required
                value={formData.destinationCountry}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Shipping Carrier
              </label>
              <input
                type="text"
                name="shippingCompany"
                required
                value={formData.shippingCompany}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Shipping Date
              </label>
              <input
                type="date"
                name="shippingDate"
                required
                value={formData.shippingDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
          <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            Cargo Specifications
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                HS Tariff Code
              </label>
              <input
                type="text"
                name="hsCode"
                required
                value={formData.hsCode}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Weight (kg)
              </label>
              <input
                type="number"
                name="weight"
                required
                value={formData.weight}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Shipment Value (USD)
              </label>
              <input
                type="number"
                name="shipmentValue"
                required
                value={formData.shipmentValue}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Detailed Goods Description
              </label>
              <textarea
                name="goodsDescription"
                required
                rows={3}
                value={formData.goodsDescription}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
            </div>
          </div>
        </div>

        {/* Upload More Documents */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            Attach Additional Documents
          </h2>

          {existingDocs.length > 0 && (
            <p className="text-xs text-slate-500">
              Already attached: {existingDocs.map((d) => d.originalName || d.fileName).join(', ')}
            </p>
          )}

          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center bg-slate-50/50 dark:bg-slate-800/40 relative">
            <input
              type="file"
              multiple
              accept=".pdf,.docx,.doc,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
              <UploadCloud className="w-6 h-6 text-primary-600" />
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Click to attach additional customs documents
              </p>
              <p className="text-xs text-slate-400">PDF, DOCX, JPG, PNG (Multer)</p>
            </div>
          </div>

          {newFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500">New files to upload:</p>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 border rounded-xl overflow-hidden">
                {newFiles.map((file, i) => (
                  <div key={i} className="flex justify-between items-center p-3 text-sm">
                    <span className="truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeNewFile(i)}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end space-x-4">
          <Link
            to={`/shipments/${id}`}
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
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
