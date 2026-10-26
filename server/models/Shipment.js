const mongoose = require('mongoose');

const documentSubSchema = mongoose.Schema({
  fileName: { type: String, required: true },
  originalName: { type: String, required: true },
  filePath: { type: String, required: true },
  fileType: { type: String },
  fileSize: { type: Number },
  uploadDate: { type: Date, default: Date.now },
});

const shipmentSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    shipmentName: {
      type: String,
      required: [true, 'Please add a shipment name'],
      trim: true,
    },
    originCountry: {
      type: String,
      required: [true, 'Please add origin country'],
      trim: true,
    },
    destinationCountry: {
      type: String,
      required: [true, 'Please add destination country'],
      trim: true,
    },
    hsCode: {
      type: String,
      required: [true, 'Please add HS Code'],
      trim: true,
    },
    goodsDescription: {
      type: String,
      required: [true, 'Please add description of goods'],
      trim: true,
    },
    weight: {
      type: Number,
      required: [true, 'Please add shipment weight (kg)'],
    },
    shipmentValue: {
      type: Number,
      required: [true, 'Please add shipment value (USD)'],
    },
    shippingDate: {
      type: Date,
      required: [true, 'Please add shipping date'],
    },
    shippingCompany: {
      type: String,
      required: [true, 'Please add shipping carrier/company'],
      trim: true,
    },
    documents: [documentSubSchema],
    complianceStatus: {
      type: String,
      enum: ['Pending', 'Approved', 'Warning', 'Rejected'],
      default: 'Pending',
    },
    riskScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    riskLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Low',
    },
    aiAnalysis: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster search and filtering
shipmentSchema.index({ user: 1, createdAt: -1 });
shipmentSchema.index({ shipmentName: 'text', goodsDescription: 'text', hsCode: 'text' });

module.exports = mongoose.model('Shipment', shipmentSchema);
