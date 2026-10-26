const asyncHandler = require('express-async-handler');
const path = require('path');
const fs = require('fs');
const Shipment = require('../models/Shipment');
const Notification = require('../models/Notification');

// @desc    Create a new shipment with document upload
// @route   POST /api/shipments
// @access  Private
const createShipment = asyncHandler(async (req, res) => {
  const {
    shipmentName,
    originCountry,
    destinationCountry,
    hsCode,
    goodsDescription,
    weight,
    shipmentValue,
    shippingDate,
    shippingCompany,
  } = req.body;

  if (
    !shipmentName ||
    !originCountry ||
    !destinationCountry ||
    !hsCode ||
    !goodsDescription ||
    !weight ||
    !shipmentValue ||
    !shippingDate ||
    !shippingCompany
  ) {
    res.status(400);
    throw new Error('Please fill in all mandatory shipment fields');
  }

  // Handle uploaded files (single or multiple)
  const documents = [];
  const uploadedFiles = req.files || (req.file ? [req.file] : []);

  uploadedFiles.forEach((file) => {
    documents.push({
      fileName: file.filename,
      originalName: file.originalname,
      filePath: `/uploads/${file.filename}`,
      fileType: path.extname(file.originalname).toLowerCase().replace('.', ''),
      fileSize: file.size,
      uploadDate: new Date(),
    });
  });

  // Calculate preliminary risk indicators
  let initialRiskScore = 10;
  let initialRiskLevel = 'Low';

  const val = Number(shipmentValue);
  if (val > 100000) {
    initialRiskScore += 25;
  } else if (val > 50000) {
    initialRiskScore += 15;
  }

  if (documents.length === 0) {
    initialRiskScore += 20; // Risk for missing documents
  }

  if (initialRiskScore >= 50) {
    initialRiskLevel = 'High';
  } else if (initialRiskScore >= 25) {
    initialRiskLevel = 'Medium';
  }

  const shipment = await Shipment.create({
    user: req.user._id,
    shipmentName,
    originCountry,
    destinationCountry,
    hsCode,
    goodsDescription,
    weight: Number(weight),
    shipmentValue: Number(shipmentValue),
    shippingDate: new Date(shippingDate),
    shippingCompany,
    documents,
    complianceStatus: 'Pending',
    riskScore: initialRiskScore,
    riskLevel: initialRiskLevel,
  });

  // Create notification for submission
  try {
    await Notification.create({
      user: req.user._id,
      title: 'Shipment Submitted',
      message: `Shipment "${shipment.shipmentName}" (HS: ${shipment.hsCode}) was registered successfully. Ready for AI Compliance Screening.`,
      type: 'Shipment Submitted',
    });

    if (documents.length === 0) {
      await Notification.create({
        user: req.user._id,
        title: 'Missing Documents Notice',
        message: `Shipment "${shipment.shipmentName}" has no accompanying customs documents. Consider uploading a commercial invoice or bill of lading.`,
        type: 'Missing Documents',
      });
    }
  } catch (notifErr) {
    console.error('Notification creation failed:', notifErr.message);
  }

  res.status(201).json({
    success: true,
    data: shipment,
    message: 'Shipment created successfully',
  });
});

// @desc    Get all shipments with search, filtering, and pagination
// @route   GET /api/shipments
// @access  Private
const getShipments = asyncHandler(async (req, res) => {
  const { search, status, riskLevel, origin, destination, page = 1, limit = 20 } = req.query;

  // Normal users see their own shipments; Admin can view all or own
  let query = {};
  if (req.user.role !== 'admin' || req.query.ownOnly === 'true') {
    query.user = req.user._id;
  }

  // Search keyword across name, HS code, description, destination, origin
  if (search && search.trim() !== '') {
    const searchRegex = new RegExp(search.trim(), 'i');
    query.$or = [
      { shipmentName: searchRegex },
      { hsCode: searchRegex },
      { goodsDescription: searchRegex },
      { originCountry: searchRegex },
      { destinationCountry: searchRegex },
      { shippingCompany: searchRegex },
    ];
  }

  // Filter by compliance status
  if (status && status !== 'All') {
    query.complianceStatus = status;
  }

  // Filter by risk level
  if (riskLevel && riskLevel !== 'All') {
    query.riskLevel = riskLevel;
  }

  // Filter by origin / destination
  if (origin && origin !== 'All') {
    query.originCountry = new RegExp(origin, 'i');
  }
  if (destination && destination !== 'All') {
    query.destinationCountry = new RegExp(destination, 'i');
  }

  const pageNum = parseInt(page, 10);
  const pageSize = parseInt(limit, 10);
  const skip = (pageNum - 1) * pageSize;

  const total = await Shipment.countDocuments(query);
  const shipments = await Shipment.find(query)
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(pageSize);

  res.status(200).json({
    success: true,
    count: shipments.length,
    total,
    totalPages: Math.ceil(total / pageSize) || 1,
    currentPage: pageNum,
    data: shipments,
  });
});

// @desc    Get shipment statistics for dashboard
// @route   GET /api/shipments/stats
// @access  Private
const getShipmentStats = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'admin' && req.query.global === 'true' ? {} : { user: req.user._id };

  const [
    totalShipments,
    pendingShipments,
    approvedShipments,
    warningShipments,
    rejectedShipments,
    highRiskShipments,
    recentShipments,
  ] = await Promise.all([
    Shipment.countDocuments(filter),
    Shipment.countDocuments({ ...filter, complianceStatus: 'Pending' }),
    Shipment.countDocuments({ ...filter, complianceStatus: 'Approved' }),
    Shipment.countDocuments({ ...filter, complianceStatus: 'Warning' }),
    Shipment.countDocuments({ ...filter, complianceStatus: 'Rejected' }),
    Shipment.countDocuments({ ...filter, riskLevel: 'High' }),
    Shipment.find(filter).sort({ createdAt: -1 }).limit(5),
  ]);

  // Aggregate total value
  const totalValueResult = await Shipment.aggregate([
    { $match: filter },
    { $group: { _id: null, totalValue: { $sum: '$shipmentValue' }, totalWeight: { $sum: '$weight' } } },
  ]);

  const totalValue = totalValueResult.length > 0 ? totalValueResult[0].totalValue : 0;
  const totalWeight = totalValueResult.length > 0 ? totalValueResult[0].totalWeight : 0;

  res.status(200).json({
    success: true,
    stats: {
      totalShipments,
      pendingShipments,
      approvedShipments,
      warningShipments,
      rejectedShipments,
      highRiskShipments,
      totalValue,
      totalWeight,
      recentShipments,
    },
  });
});

// @desc    Get single shipment by ID
// @route   GET /api/shipments/:id
// @access  Private
const getShipmentById = asyncHandler(async (req, res) => {
  const shipment = await Shipment.findById(req.params.id).populate('user', 'name email');

  if (!shipment) {
    res.status(404);
    throw new Error('Shipment not found');
  }

  // Check ownership
  if (shipment.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to access this shipment record');
  }

  res.status(200).json({
    success: true,
    data: shipment,
  });
});

// @desc    Update shipment details
// @route   PUT /api/shipments/:id
// @access  Private
const updateShipment = asyncHandler(async (req, res) => {
  let shipment = await Shipment.findById(req.params.id);

  if (!shipment) {
    res.status(404);
    throw new Error('Shipment not found');
  }

  // Check ownership
  if (shipment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to update this shipment');
  }

  const {
    shipmentName,
    originCountry,
    destinationCountry,
    hsCode,
    goodsDescription,
    weight,
    shipmentValue,
    shippingDate,
    shippingCompany,
  } = req.body;

  if (shipmentName) shipment.shipmentName = shipmentName;
  if (originCountry) shipment.originCountry = originCountry;
  if (destinationCountry) shipment.destinationCountry = destinationCountry;
  if (hsCode) shipment.hsCode = hsCode;
  if (goodsDescription) shipment.goodsDescription = goodsDescription;
  if (weight) shipment.weight = Number(weight);
  if (shipmentValue) shipment.shipmentValue = Number(shipmentValue);
  if (shippingDate) shipment.shippingDate = new Date(shippingDate);
  if (shippingCompany) shipment.shippingCompany = shippingCompany;

  // Append any newly uploaded documents
  const uploadedFiles = req.files || (req.file ? [req.file] : []);
  if (uploadedFiles.length > 0) {
    uploadedFiles.forEach((file) => {
      shipment.documents.push({
        fileName: file.filename,
        originalName: file.originalname,
        filePath: `/uploads/${file.filename}`,
        fileType: path.extname(file.originalname).toLowerCase().replace('.', ''),
        fileSize: file.size,
        uploadDate: new Date(),
      });
    });
  }

  const updatedShipment = await shipment.save();

  res.status(200).json({
    success: true,
    data: updatedShipment,
    message: 'Shipment updated successfully',
  });
});

// @desc    Delete shipment
// @route   DELETE /api/shipments/:id
// @access  Private
const deleteShipment = asyncHandler(async (req, res) => {
  const shipment = await Shipment.findById(req.params.id);

  if (!shipment) {
    res.status(404);
    throw new Error('Shipment not found');
  }

  // Check ownership
  if (shipment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this shipment');
  }

  // Clean up physical document files from disk
  if (shipment.documents && shipment.documents.length > 0) {
    shipment.documents.forEach((doc) => {
      const fullPath = path.join(__dirname, '..', doc.filePath);
      if (fs.existsSync(fullPath)) {
        try {
          fs.unlinkSync(fullPath);
        } catch (unlinkErr) {
          console.error(`Failed to delete document file: ${fullPath}`, unlinkErr);
        }
      }
    });
  }

  await shipment.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Shipment and associated documents deleted successfully',
  });
});

module.exports = {
  createShipment,
  getShipments,
  getShipmentStats,
  getShipmentById,
  updateShipment,
  deleteShipment,
};
