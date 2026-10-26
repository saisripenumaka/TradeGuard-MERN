const mongoose = require('mongoose');

const complianceReportSchema = mongoose.Schema(
  {
    shipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shipment',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    aiAnalysis: {
      hsCodeVerification: String,
      customsCompliance: String,
      restrictedGoodsDetection: String,
      missingDocuments: [String],
      recommendations: [String],
    },
    status: {
      type: String,
      enum: ['Approved', 'Warning', 'Rejected'],
      required: true,
    },
    riskDetails: {
      score: Number,
      level: String,
      factors: [String],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ComplianceReport', complianceReportSchema);
